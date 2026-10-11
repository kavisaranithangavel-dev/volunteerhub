# Amrita Service System (ASS)
### Unified Campus E-Governance & Federated Facility Service Network
**Amrita Vishwa Vidyapeetham, Coimbatore Campus**  
*Problem Statement 9 — GENESIS 2026*

---

## 🏛️ Overview
The **Amrita Service System (ASS)** is an enterprise-grade **MERN Stack (MongoDB, Express, React, Node.js)** platform designed to solve administrative bottlenecks across large residential university townships (10,000+ students).

Unlike conventional centralized complaint boxes that drown in backlog and experience worker fraud, ASS implements:
1. **$O(1)$ Deterministic Requisition Routing:** Zero-cost, sub-millisecond keyword classification for 6 trades (Plumbing, Electrical, Carpentry, ICT/Network, Sanitation, Civil).
2. **Two-Party Verification OTP Handshake:** Technicians cannot close work orders without the student physically providing a dynamic 4-digit OTP.
3. **Federated Triage & Spatial Batching:** Jurisdiction-partitioned queues (by hostel/zone) and route-optimized dispatching.
4. **University Fund Allocation & Real-Time Expense Ledger:** Central University Finance Board allocates grants to hostels, and material repair costs are automatically deducted and logged to an audit ledger.
5. **Role-Based Access Control (RBAC):** Official Single Sign-On authentication with SHA-256 signed JSON Web Tokens (JWT).

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React.js, Tailwind CSS, FontAwesome  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (via Mongoose ODM) with Compound Indexing `{ zone: 1, status: 1, createdAt: -1 }`  
- **Security:** Stateless JWT, Role-Based Access Control, Location Data Masking  

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd server
npm install
node index.js
```
The server will start on `http://localhost:5000` and automatically connect to MongoDB (`amrita_service_system`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Access Profiles

| Role | Username / ID | Password | Access Portal |
|---|---|---|---|
| **Student** | `CB.EN.U4CSE21104` | `student123` | Student Services & OTP Portal |
| **Hostel Warden** | `warden_bh1` | `warden123` | Hostel Administration & Budget Gauge |
| **Finance Board** | `estate_finance` | `estate123` | University Fund Allocation & Ledger |

---

## 📜 License
Developed for GENESIS 2026 Hackathon. All rights reserved.
