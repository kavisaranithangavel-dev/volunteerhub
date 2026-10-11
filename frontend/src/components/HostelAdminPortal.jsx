import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function HostelAdminPortal() {
  const [zone, setZone] = useState('Boys Hostel 1');
  const [budget, setBudget] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cost input state per ticket
  const [costInputs, setCostInputs] = useState({});
  const [actionMsg, setActionMsg] = useState(null);

  // Worker OTP Verification state inside Warden portal
  const [otpInputs, setOtpInputs] = useState({});
  const [otpFeedback, setOtpFeedback] = useState({});

  // Authenticate as Hostel Warden
  useEffect(() => {
    const authWarden = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'WARDEN' })
        });
        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        console.error(err);
      }
    };
    authWarden();
  }, []);

  // Fetch Budget and Tickets
  const loadHostelData = async (showLoading = false) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    try {
      const bRes = await fetch(`${API_BASE}/hostel/budget/${encodeURIComponent(zone)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bRes.ok) setBudget(await bRes.json());

      const tRes = await fetch(`${API_BASE}/tickets?zone=${encodeURIComponent(zone)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tRes.ok) {
        const zoneTickets = await tRes.json();
        setTickets(zoneTickets);
      }
    } catch (err) {
      console.error(err);
    }
    if (showLoading) setLoading(false);
  };

  // REAL-TIME AUTO-SYNC: Poll every 2 seconds
  useEffect(() => {
    if (!token) return;
    loadHostelData(true);

    const liveInterval = setInterval(() => {
      loadHostelData(false);
    }, 2000);

    return () => clearInterval(liveInterval);
  }, [token, zone]);

  // 1. Approve & Deduct Funds
  const handleApproveWithCost = async (ticketId) => {
    const cost = Number(costInputs[ticketId]) || 0;
    try {
      const res = await fetch(`${API_BASE}/hostel/approve-and-expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketId,
          status: 'DISPATCHED',
          estimatedCost: cost
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Work order approved! ₹${cost} allocated and deducted from university grant.`);
        setTimeout(() => setActionMsg(null), 4000);
        loadHostelData(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. VERIFY STUDENT OTP (CLOSES THE TICKET ON BEHALF OF TECHNICIAN)
  const handleVerifyOtp = async (ticketId) => {
    const otp = otpInputs[ticketId];
    if (!otp) return;

    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();

      if (res.ok) {
        setOtpFeedback({
          ...otpFeedback,
          [ticketId]: { type: 'success', text: '✓ OTP Verified! Work verified and ticket closed.' }
        });
        setTimeout(() => {
          loadHostelData(false);
        }, 1200);
      } else {
        setOtpFeedback({
          ...otpFeedback,
          [ticketId]: { type: 'error', text: data.error || '❌ Invalid OTP. Student code does not match.' }
        });
      }
    } catch (err) {
      setOtpFeedback({ ...otpFeedback, [ticketId]: { type: 'error', text: 'Verification Failed' } });
    }
  };

  const spentPercent = budget?.allocatedAmount 
    ? Math.min(100, Math.round((budget.spentAmount / budget.allocatedAmount) * 100)) 
    : 0;

  return (
    <div className="min-h-screen bg-[#f4f6f9] font-sans text-gray-800 pb-20">
      
      {/* Hostel Administration Top Bar */}
      <header className="bg-[#1e293b] border-b border-slate-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center text-white gap-3 shadow">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600 p-2.5 rounded-xl">
            <i className="fas fa-building-user text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Amrita Hostel Administration Portal</h1>
            <p className="text-slate-400 text-xs">Hostel Maintenance & University Grant Management</p>
          </div>
        </div>

        {/* Live Sync Status & Hostel Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>LIVE INCOMING FEED</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 font-bold uppercase">Jurisdiction:</span>
            <select 
              value={zone} 
              onChange={(e) => setZone(e.target.value)}
              className="bg-slate-800 text-white font-bold px-2 py-1 rounded border border-slate-600 focus:outline-none"
            >
              <option>Boys Hostel 1</option>
              <option>Boys Hostel 2</option>
              <option>Girls Hostel 1</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        
        {actionMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl mb-6 flex items-center shadow-sm">
            <i className="fas fa-check-circle text-emerald-600 text-lg mr-3"></i>
            <span className="font-bold">{actionMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. UNIVERSITY-ALLOCATED HOSTEL BUDGET WIDGET              */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-2">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Financial Status (Fiscal Year 2026-27)</span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                University Maintenance Fund Allocation: <span className="text-indigo-600">{zone}</span>
              </h2>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono">
              Sanctioned by: {budget?.lastAllocatedBy || 'University Finance Board'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Allocated Budget</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{budget?.allocatedAmount?.toLocaleString() || '0'}</p>
              <span className="text-[10px] text-slate-400">Annual Grant from University</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
              <span className="text-xs font-bold text-rose-600 uppercase">Utilized / Spent Funds</span>
              <p className="text-2xl font-black text-rose-700 mt-1">₹{budget?.spentAmount?.toLocaleString() || '0'}</p>
              <span className="text-[10px] text-rose-500 font-bold">{spentPercent}% Budget Consumed</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <span className="text-xs font-bold text-emerald-600 uppercase">Available Balance</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ₹{((budget?.allocatedAmount || 0) - (budget?.spentAmount || 0)).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Safe Operating Liquidity</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
              <span>Budget Consumption Progress</span>
              <span>{spentPercent}% spent</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${spentPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${spentPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. REQUISITION QUEUE WITH TWO-PARTY OTP INPUT             */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span>Incoming Student Requisitions ({tickets.length})</span>
                <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <p className="text-xs text-gray-500">Approve new orders, or enter student's 4-digit OTP to officially complete repairs.</p>
            </div>
            <button onClick={() => loadHostelData(true)} className="text-xs text-indigo-600 font-bold hover:underline">
              <i className="fas fa-sync mr-1"></i> Force Refresh
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl text-xs border border-dashed border-gray-200">
              <i className="fas fa-inbox text-3xl mb-2 text-gray-300"></i>
              <p>No pending maintenance requests for {zone} right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(t => (
                <div key={t.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {t.id} • {t.category}
                      </span>
                      <h4 className="text-base font-bold text-gray-900 mt-1">{t.exactRoom} ({t.studentName})</h4>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'DISPATCHED' ? 'bg-cyan-100 text-cyan-800 animate-pulse' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200 mb-4">
                    "{t.description}"
                  </p>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      <i className="fas fa-user-gear mr-1 text-slate-600"></i> Assigned Staff: <strong>{t.allocatedWorker}</strong>
                    </span>

                    {/* ACTION 1: PENDING -> APPROVE WITH MATERIAL COST */}
                    {t.status === 'PENDING' && (
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2.5 py-1">
                          <span className="text-xs text-gray-400 font-bold mr-1">₹</span>
                          <input 
                            type="number" 
                            placeholder="Material Cost" 
                            value={costInputs[t.id] || ''} 
                            onChange={(e) => setCostInputs({ ...costInputs, [t.id]: e.target.value })}
                            className="text-xs w-32 focus:outline-none font-bold text-gray-800"
                          />
                        </div>
                        <button 
                          onClick={() => handleApproveWithCost(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow whitespace-nowrap"
                        >
                          Approve & Expense
                        </button>
                      </div>
                    )}

                    {/* ACTION 2: DISPATCHED -> ENTER STUDENT OTP TO COMPLETE WORK ORDER! */}
                    {t.status === 'DISPATCHED' && (
                      <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div>
                          <span className="text-xs font-bold text-amber-900 block flex items-center">
                            <i className="fas fa-key text-amber-600 mr-1.5"></i> Close Order with Student OTP:
                          </span>
                          <span className="text-[10px] text-amber-700">Enter code provided by student:</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            maxLength="4" 
                            placeholder="4-digit OTP" 
                            value={otpInputs[t.id] || ''} 
                            onChange={(e) => setOtpInputs({ ...otpInputs, [t.id]: e.target.value })} 
                            className="w-24 text-center font-mono font-bold text-xs bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:border-amber-600 focus:outline-none shadow-sm" 
                          />
                          <button 
                            onClick={() => handleVerifyOtp(t.id)} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow whitespace-nowrap flex items-center"
                          >
                            <i className="fas fa-check mr-1"></i> Verify & Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ACTION 3: RESOLVED STATUS */}
                    {t.status === 'RESOLVED' && (
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center">
                        <i className="fas fa-circle-check text-emerald-600 mr-1.5 text-sm"></i>
                        Work Verified & Closed with Student OTP (Cost: ₹{t.estimatedCost || 0})
                      </span>
                    )}
                  </div>

                  {/* OTP Feedback Message (e.g. Invalid OTP / Success) */}
                  {otpFeedback[t.id] && (
                    <div className={`mt-2 p-2 rounded-lg text-xs font-bold ${
                      otpFeedback[t.id].type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {otpFeedback[t.id].text}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
