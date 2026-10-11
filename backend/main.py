from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Boolean, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from google import genai
import datetime
import uuid
import json
import base64

# --- DB SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./omnidesk_v3.db" # Changed to v3 to avoid schema conflicts
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TicketDB(Base):
    __tablename__ = "tickets"
    id = Column(String, primary_key=True, index=True)
    ticket_type = Column(String) 
    description = Column(String)
    location = Column(String)
    ai_category = Column(String, default="Uncategorized") # NEW: Category identified by Vision AI
    
    um_status = Column(String, default="PENDING") 
    hm_status = Column(String, default="PENDING") 
    
    allocated_worker = Column(String, nullable=True) 
    dispatch_status = Column(String, default="WAITING") # Changed default to WAITING
    
    llm_primary_check = Column(String, nullable=True) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- API APP ---
app = FastAPI(title="Amrita Service System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SCHEMAS ---
class StudentRequest(BaseModel):
    ticket_type: str
    description: str
    location: str
    image_base64: str | None = None # NEW: Accepts image from frontend

class ApprovalRequest(BaseModel):
    ticket_id: str
    action: str 

# ==========================================
# MULTIMODAL LLM INTEGRATION (TEXT + VISION)
# ==========================================
def analyze_with_llm(ticket_type: str, description: str, image_base64: str = None):
    # 👇 PASTE YOUR KEY HERE 👇
    GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE"
    
    try:
        if GEMINI_API_KEY == "":
            raise ValueError("API Key not added yet.")
            
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        prompt = f"""
        You are 'Amrita Service AI', a campus facility management assistant.
        A student submitted a '{ticket_type}' ticket with this description: "{description}".
        
        Task:
        1. If an image is provided, analyze it to determine the exact category of the issue (e.g., Plumbing, Electrical, IT, Carpentry, Pest Control, Infrastructure). If no image, guess the category from the text.
        2. If ticket_type is 'anonymous': Set allocated_worker to "REQUIRES_AUTHORITY_REVIEW". Write a 1-sentence 'llm_check' analyzing severity.
        3. If standard: Allocate a realistic worker name and trade. Write a 1-sentence 'llm_check' explaining the issue.
        
        Respond ONLY with a valid JSON object matching this schema:
        {{
            "allocated_worker": "string",
            "llm_check": "string",
            "category": "string"
        }}
        """
        
        contents = [prompt]
        
        # If an image was uploaded, decode it and attach it to the AI prompt
        if image_base64:
            if "," in image_base64:
                header, encoded = image_base64.split(",", 1)
                mime_type = header.split(";")[0].split(":")[1]
            else:
                encoded = image_base64
                mime_type = "image/jpeg"
                
            image_bytes = base64.b64decode(encoded)
            contents.append(
                genai.types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            )
        
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=contents,
        )
        
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
        
    except Exception as e:
        print(f"LLM API Failed. Using Fallback. Error: {e}")
        if ticket_type == "anonymous":
            return {
                "allocated_worker": "REQUIRES_AUTHORITY_REVIEW",
                "llm_check": "[FALLBACK]: Flagged for Disciplinary Committee.",
                "category": "Security/Grievance"
            }
        else:
            import random
            workers = ["Ramesh (Plumber)", "Suresh (Electrician)", "Kumar (IT Support)"]
            cats = ["Plumbing", "Electrical", "Carpentry"]
            return {
                "allocated_worker": random.choice(workers),
                "llm_check": "[FALLBACK]: Standard issue. Allocated.",
                "category": random.choice(cats)
            }


# ==========================================
# ROUTES
# ==========================================
@app.post("/api/student/request")
def submit_request(req: StudentRequest, db: Session = Depends(get_db)):
    llm_response = analyze_with_llm(req.ticket_type, req.description, req.image_base64)
    
    new_ticket = TicketDB(
        id=f"TKT-{str(uuid.uuid4())[:8].upper()}",
        ticket_type=req.ticket_type,
        description=req.description,
        location=req.location,
        allocated_worker=llm_response["allocated_worker"],
        llm_primary_check=llm_response["llm_check"],
        ai_category=llm_response.get("category", "Uncategorized")
    )
    
    if req.ticket_type == "anonymous":
        new_ticket.um_status = "BYPASSED"
        new_ticket.hm_status = "BYPASSED"
        new_ticket.dispatch_status = "UNDER_INVESTIGATION"
        
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

# NEW: Student Dashboard Route
@app.get("/api/student/my-tickets")
def get_student_tickets(db: Session = Depends(get_db)):
    # In a real app, you'd filter by logged-in student ID. 
    # For hackathon, we just return the 10 most recent tickets.
    return db.query(TicketDB).order_by(TicketDB.created_at.desc()).limit(10).all()


@app.get("/api/um/pending")
def get_um_queue(db: Session = Depends(get_db)):
    return db.query(TicketDB).filter(TicketDB.um_status == "PENDING", TicketDB.ticket_type != "anonymous").all()

@app.post("/api/um/process")
def process_um_approval(req: ApprovalRequest, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.id == req.ticket_id).first()
    if not ticket: raise HTTPException(status_code=404)
    ticket.um_status = "APPROVED" if req.action == "APPROVE" else "REJECTED"
    if ticket.um_status == "APPROVED" and ticket.hm_status == "APPROVED":
        ticket.dispatch_status = "DISPATCHED"
    db.commit()
    return {"message": "UM Action Recorded"}

@app.get("/api/hm/pending")
def get_hm_queue(db: Session = Depends(get_db)):
    return db.query(TicketDB).filter(TicketDB.hm_status == "PENDING", TicketDB.ticket_type != "anonymous").all()

@app.post("/api/hm/process")
def process_hm_approval(req: ApprovalRequest, db: Session = Depends(get_db)):
    ticket = db.query(TicketDB).filter(TicketDB.id == req.ticket_id).first()
    if not ticket: raise HTTPException(status_code=404)
    ticket.hm_status = "APPROVED" if req.action == "APPROVE" else "REJECTED"
    if ticket.um_status == "APPROVED" and ticket.hm_status == "APPROVED":
        ticket.dispatch_status = "DISPATCHED"
    db.commit()
    return {"message": "HM Action Recorded"}

@app.get("/api/authorities/anonymous-reports")
def get_anonymous_reports(db: Session = Depends(get_db)):
    return db.query(TicketDB).filter(TicketDB.ticket_type == "anonymous").all()
