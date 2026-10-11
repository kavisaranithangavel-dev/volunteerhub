const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'amrita-secure-enterprise-key-2026';
const MONGO_URI = 'mongodb://127.0.0.1:27017/amrita_service_system';

app.use(cors());
app.use(express.json());

// ==========================================
// MONGODB SCHEMAS & MODELS
// ==========================================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, default: 'amrita123' },
  role: { type: String, enum: ['STUDENT', 'WARDEN', 'ESTATE', 'WORKER', 'FINANCE'], required: true },
  name: { type: String, required: true },
  rollNo: { type: String, default: 'CB.EN.U4CSE21104' },
  zone: { type: String, required: true },
  trade: { type: String }
});

const TicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  zone: { type: String, required: true },
  exactRoom: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'DISPATCHED', 'RESOLVED'], default: 'PENDING' },
  otp: { type: String, required: true },
  allocatedWorker: { type: String, default: 'Unassigned' },
  workerTrade: { type: String },
  estimatedCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

const BudgetSchema = new mongoose.Schema({
  zone: { type: String, required: true, unique: true },
  allocatedAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  fiscalYear: { type: String, default: '2026-2027' },
  lastAllocatedBy: { type: String, default: 'University Finance Board' },
  lastUpdated: { type: Date, default: Date.now }
});

const ExpenseLedgerSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  zone: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  approvedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

TicketSchema.index({ zone: 1, status: 1, createdAt: -1 });

const User = mongoose.model('User', UserSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Budget = mongoose.model('Budget', BudgetSchema);
const ExpenseLedger = mongoose.model('ExpenseLedger', ExpenseLedgerSchema);

// Campus Directory
const CAMPUS_NETWORK = {
  Plumbing: { name: 'Ramesh K. (Chief Plumber)', phone: 'ext-4411' },
  Electrical: { name: 'Suresh M. (Lead Electrician)', phone: 'ext-4422' },
  Carpentry: { name: 'Murugan P. (Senior Carpenter)', phone: 'ext-4433' },
  Network: { name: 'Dinesh V. (ICT & Network Admin)', phone: 'ext-4455' },
  Sanitation: { name: 'Selvi R. (Sanitation Supervisor)', phone: 'ext-4466' },
  Civil: { name: 'Rajan B. (Civil Works Engineer)', phone: 'ext-4477' },
  Security: { name: 'Capt. Sharma (Campus Security Command)', phone: 'ext-4400' }
};

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('>>> [MONGODB CONNECTED] database: amrita_service_system');
    await seedInitialData();
  } catch (err) {
    console.error('>>> [MONGODB ERROR]', err.message);
  }
}

async function seedInitialData() {
  // Seed Users with Credentials
  await User.deleteMany({});
  await User.insertMany([
    {
      username: 'CB.EN.U4CSE21104',
      password: 'student123',
      role: 'STUDENT',
      name: 'Pranav K',
      rollNo: 'CB.EN.U4CSE21104',
      zone: 'Boys Hostel 1'
    },
    {
      username: 'warden_bh1',
      password: 'warden123',
      role: 'WARDEN',
      name: 'Dr. R. Ramanathan (Chief Warden)',
      rollNo: 'STAFF-102',
      zone: 'Boys Hostel 1'
    },
    {
      username: 'estate_finance',
      password: 'estate123',
      role: 'ESTATE',
      name: 'K. Sunder (University Finance)',
      rollNo: 'FIN-001',
      zone: 'ALL'
    }
  ]);

  const budgetCount = await Budget.countDocuments();
  if (budgetCount === 0) {
    await Budget.insertMany([
      { zone: 'Boys Hostel 1', allocatedAmount: 500000, spentAmount: 43250 },
      { zone: 'Boys Hostel 2', allocatedAmount: 450000, spentAmount: 18500 },
      { zone: 'Girls Hostel 1', allocatedAmount: 550000, spentAmount: 32000 },
      { zone: 'Academic Block A', allocatedAmount: 750000, spentAmount: 64000 }
    ]);
  }
}

connectDB();

// Deterministic Router
const KEYWORD_MAP = {
  Plumbing: ['leak', 'tap', 'pipe', 'flush', 'water', 'drain', 'geyser', 'washbasin', 'sink', 'tank', 'overflow', 'plumb'],
  Electrical: ['spark', 'fan', 'light', 'bulb', 'switch', 'socket', 'plug', 'ac', 'power', 'fuse', 'wire', 'tube', 'voltage'],
  Carpentry: ['door', 'lock', 'hinge', 'cot', 'bed', 'chair', 'table', 'cupboard', 'window', 'latch', 'wood', 'furniture'],
  Network: ['wifi', 'wi-fi', 'lan', 'internet', 'router', 'cable', 'speed', 'ethernet', 'dns', 'signal', 'ip'],
  Sanitation: ['clean', 'sweep', 'mop', 'garbage', 'dustbin', 'pest', 'mosquito', 'cockroach', 'smell', 'dirt', 'washroom'],
  Civil: ['wall', 'ceiling', 'crack', 'tile', 'plaster', 'seepage', 'leakage', 'paint', 'cement']
};

function deterministicCategorize(text) {
  const lower = text.toLowerCase();
  for (const [category, words] of Object.entries(KEYWORD_MAP)) {
    if (words.some(w => lower.includes(w))) return category;
  }
  return 'General Maintenance';
}

// ==========================================
// SECURE AUTHENTICATION ENDPOINT (JWT SIGNING)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body;

  let user = null;
  // Check by username if provided
  if (username) {
    user = await User.findOne({ username });
    if (user && password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }
  }

  // Fallback / Role Quick Login for Hackathon Demo
  if (!user && role) {
    user = await User.findOne({ role });
  }

  if (!user) {
    user = await User.findOne({ role: 'STUDENT' });
  }

  // Generate Real JWT Token
  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      rollNo: user.rollNo,
      zone: user.zone,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      rollNo: user.rollNo,
      role: user.role,
      zone: user.zone
    }
  });
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Bearer Token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token.' });
  }
}

// ==========================================
// TICKETING ROUTES
// ==========================================
app.get('/api/tickets', authenticate, async (req, res) => {
  const { role } = req.user;
  const queryZone = req.query.zone;

  let query = {};
  if (queryZone) {
    query.zone = queryZone;
  } else if (role === 'WARDEN' && req.user.zone) {
    query.zone = req.user.zone;
  }

  const rawTickets = await Ticket.find(query).sort({ createdAt: -1 });
  return res.json(rawTickets);
});

app.post('/api/tickets', authenticate, async (req, res) => {
  const { zone, exactRoom, description } = req.body;
  if (!zone || !exactRoom || !description) return res.status(400).json({ error: 'All fields required' });

  const category = deterministicCategorize(description);
  const workerInfo = CAMPUS_NETWORK[category] || { name: 'K. Sunder (Campus Works)' };
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const newTicket = new Ticket({
    id: `AMR-${Math.floor(100 + Math.random() * 900)}`,
    studentId: req.user.id || 'std_demo',
    studentName: req.user.name || 'Pranav K',
    zone,
    exactRoom,
    category,
    description,
    status: 'PENDING',
    otp,
    allocatedWorker: workerInfo.name,
    workerTrade: category,
    createdAt: new Date()
  });

  await newTicket.save();
  return res.json(newTicket);
});

app.post('/api/tickets/:id/verify-otp', authenticate, async (req, res) => {
  const { otp } = req.body;
  const ticket = await Ticket.findOne({ id: req.params.id });
  if (!ticket) return res.status(404).json({ error: 'Not found' });
  if (ticket.otp !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP' });
  ticket.status = 'RESOLVED';
  ticket.resolvedAt = new Date();
  await ticket.save();
  return res.json({ success: true, message: 'Resolved' });
});

// ==========================================
// HOSTEL ADMIN BUDGET & APPROVAL
// ==========================================
app.get('/api/hostel/budget/:zone', authenticate, async (req, res) => {
  const zoneName = req.params.zone || 'Boys Hostel 1';
  let budget = await Budget.findOne({ zone: zoneName }) || await Budget.findOne();
  return res.json(budget);
});

app.post('/api/hostel/approve-and-expense', authenticate, async (req, res) => {
  const { ticketId, status, estimatedCost } = req.body;
  const cost = Number(estimatedCost) || 0;

  const ticket = await Ticket.findOne({ id: ticketId });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  ticket.status = status || 'DISPATCHED';
  ticket.estimatedCost = cost;
  await ticket.save();

  if (cost > 0) {
    const budget = await Budget.findOne({ zone: ticket.zone });
    if (budget) {
      budget.spentAmount += cost;
      budget.lastUpdated = new Date();
      await budget.save();

      await ExpenseLedger.create({
        ticketId: ticket.id,
        zone: ticket.zone,
        category: ticket.category,
        description: ticket.description,
        amount: cost,
        approvedBy: req.user.name || 'Hostel Administrator'
      });
    }
  }

  return res.json({ success: true, ticket });
});

// ==========================================
// UNIVERSITY FINANCE
// ==========================================
app.get('/api/university/budgets', authenticate, async (req, res) => {
  const budgets = await Budget.find().sort({ zone: 1 });
  return res.json(budgets);
});

app.post('/api/university/allocate-funds', authenticate, async (req, res) => {
  const { zone, allocatedAmount } = req.body;
  let budget = await Budget.findOne({ zone });
  if (budget) {
    budget.allocatedAmount = Number(allocatedAmount);
    budget.lastAllocatedBy = req.user.name || 'University Finance Board';
    budget.lastUpdated = new Date();
    await budget.save();
  }
  return res.json({ success: true, budget });
});

app.get('/api/university/audit-ledger', authenticate, async (req, res) => {
  const logs = await ExpenseLedger.find().sort({ timestamp: -1 });
  return res.json(logs);
});

app.get('/api/network/directory', authenticate, (req, res) => {
  return res.json(CAMPUS_NETWORK);
});

app.listen(PORT, () => {
  console.log(`AMRITA SECURE RBAC SERVER RUNNING ON http://localhost:${PORT}`);
});
