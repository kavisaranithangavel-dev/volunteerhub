import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function UniversityFinancePortal() {
  const [budgets, setBudgets] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Allocation Form State
  const [selectedZone, setSelectedZone] = useState('Boys Hostel 1');
  const [allocateAmount, setAllocateAmount] = useState('500000');
  const [successMsg, setSuccessMsg] = useState(null);

  // Authenticate as University Finance Board
  useEffect(() => {
    const authFinance = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'ESTATE' })
        });
        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        console.error(err);
      }
    };
    authFinance();
  }, []);

  const loadUniversityData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch Budgets
      const bRes = await fetch(`${API_BASE}/university/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (bRes.ok) setBudgets(await bRes.json());

      // 2. Fetch Ledger
      const lRes = await fetch(`${API_BASE}/university/audit-ledger`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (lRes.ok) setLedger(await lRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadUniversityData();
  }, [token]);

  // Handle University Allocating Funds
  const handleAllocateFunds = async (e) => {
    e.preventDefault();
    if (!selectedZone || !allocateAmount) return;

    try {
      const res = await fetch(`${API_BASE}/university/allocate-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zone: selectedZone,
          allocatedAmount: Number(allocateAmount)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Sanctioned ₹${Number(allocateAmount).toLocaleString()} grant to ${selectedZone}!`);
        setTimeout(() => setSuccessMsg(null), 4000);
        loadUniversityData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Aggregated Campus Figures
  const totalAllocated = budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spentAmount || 0), 0);
  const totalBalance = totalAllocated - totalSpent;

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-100 pb-24">
      
      {/* University Finance Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
            <i className="fas fa-landmark text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Amrita Central University Finance & Estate Office</h1>
            <p className="text-slate-400 text-xs font-mono">Fiscal Fund Allocation & Campus Expenditure Oversight</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>ESTATE BOARD • FINANCIAL YEAR 2026-27</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        {successMsg && (
          <div className="bg-cyan-950 border border-cyan-500 text-cyan-200 text-xs p-4 rounded-xl mb-6 flex items-center shadow-lg">
            <i className="fas fa-check-circle text-cyan-400 text-lg mr-3"></i>
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. AGGREGATED CAMPUS FINANCIAL OVERVIEW                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Campus Grant Allocated</span>
            <p className="text-3xl font-black text-white mt-2">₹{totalAllocated.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Distributed across 6 campus jurisdictions</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Total Disbursed Repairs</span>
            <p className="text-3xl font-black text-rose-400 mt-2">₹{totalSpent.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Expensed on verified parts & labor</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Unspent Liquidity Reserves</span>
            <p className="text-3xl font-black text-emerald-400 mt-2">₹{totalBalance.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-1">Available for major capital renewals</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. THE UNIVERSITY FUND ALLOCATION CONTROL PANEL           */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Allocation Action Box */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <i className="fas fa-hand-holding-dollar text-blue-500 mr-2"></i> Allocate / Top-Up Budget Grant
            </h2>
            <p className="text-xs text-slate-400 mb-6">Authorize new maintenance capital for a specific hostel or department.</p>

            <form onSubmit={handleAllocateFunds} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Target Hostel / Academic Block</label>
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                >
                  <option>Boys Hostel 1</option>
                  <option>Boys Hostel 2</option>
                  <option>Girls Hostel 1</option>
                  <option>Academic Block A</option>
                  <option>Academic Block B</option>
                  <option>Central Library</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Allocation Grant Amount (₹)</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/30 text-xs"
              >
                Sanction & Transfer Funds
              </button>
            </form>
          </div>

          {/* Department Breakdown Table */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white">Departmental Grant Allocations</h2>
              <button onClick={loadUniversityData} className="text-xs text-blue-400 hover:underline">
                <i className="fas fa-sync mr-1"></i> Refresh Data
              </button>
            </div>

            <div className="space-y-3">
              {budgets.map(b => {
                const pct = b.allocatedAmount ? Math.min(100, Math.round((b.spentAmount / b.allocatedAmount) * 100)) : 0;
                return (
                  <div key={b._id || b.zone} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-sm text-white">{b.zone}</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        ₹{b.spentAmount?.toLocaleString()} / ₹{b.allocatedAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full ${pct > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Remaining: <strong className="text-emerald-400 font-mono">₹{((b.allocatedAmount || 0) - (b.spentAmount || 0)).toLocaleString()}</strong></span>
                      <span>{pct}% utilized</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. CAMPUS-WIDE REPAIR EXPENDITURE AUDIT LEDGER            */}
        {/* ========================================================= */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center">
                <i className="fas fa-receipt text-cyan-400 mr-2"></i> Campus-Wide Real-Time Expense Audit Ledger
              </h2>
              <p className="text-xs text-slate-400">Transparent ledger tracking every maintenance rupee expensed across the 10,000-student campus.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{ledger.length} Transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Jurisdiction</th>
                  <th className="py-3 px-3">Trade</th>
                  <th className="py-3 px-3">Material Description</th>
                  <th className="py-3 px-3">Amount Expensed</th>
                  <th className="py-3 px-3">Sanctioning Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {ledger.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">{item.ticketId}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item.zone}</td>
                    <td className="py-3 px-3">{item.category}</td>
                    <td className="py-3 px-3 text-slate-400">{item.description}</td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">₹{item.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">{item.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
