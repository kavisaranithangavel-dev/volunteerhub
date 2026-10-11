import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function UnifiedPortal() {
  // Session & RBAC Role State
  const [currentRole, setCurrentRole] = useState('STUDENT'); // STUDENT, WARDEN, WORKER
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);

  // Tickets & Hazards
  const [tickets, setTickets] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State (No images)
  const [zone, setZone] = useState('Boys Hostel 1');
  const [exactRoom, setExactRoom] = useState('');
  const [description, setDescription] = useState('');
  const [submitMsg, setSubmitMsg] = useState(null);

  // Worker OTP Modal/Input State
  const [otpInputs, setOtpInputs] = useState({});
  const [otpStatusMsg, setOtpStatusMsg] = useState({});

  // 1. Authenticate with Role
  const loginWithRole = async (role) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      setToken(data.token);
      setUserData(data.user);
      setCurrentRole(role);
    } catch (err) {
      console.error('Auth error', err);
    }
  };

  useEffect(() => {
    loginWithRole(currentRole);
  }, [currentRole]);

  // 2. Fetch Tickets & Systemic Hazards
  const loadPortalData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch Tickets
      const tRes = await fetch(`${API_BASE}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tRes.ok) {
        const tData = await tRes.json();
        setTickets(tData);
      }

      // Fetch Systemic Hazards (For Warden/Admins)
      const hRes = await fetch(`${API_BASE}/hazards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (hRes.ok) {
        const hData = await hRes.json();
        setHazards(hData);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadPortalData();
  }, [token]);

  // 3. Student Submit Ticket
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!exactRoom || !description) return;

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ zone, exactRoom, description })
      });

      if (res.ok) {
        setSubmitMsg('Ticket submitted successfully! Auto-routed deterministically.');
        setExactRoom('');
        setDescription('');
        loadPortalData();
      }
    } catch (err) {
      setSubmitMsg('Error submitting ticket.');
    }
  };

  // 4. Warden Approve Ticket
  const handleWardenAction = async (ticketId, status) => {
    try {
      await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      loadPortalData();
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Worker OTP Verification (The Two-Party Handshake)
  const handleVerifyOtp = async (ticketId) => {
    const inputOtp = otpInputs[ticketId];
    if (!inputOtp) return;

    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp: inputOtp })
      });
      const data = await res.json();

      if (res.ok) {
        setOtpStatusMsg({ ...otpStatusMsg, [ticketId]: { type: 'success', text: 'OTP Verified! Ticket Closed.' } });
        setTimeout(() => loadPortalData(), 1000);
      } else {
        setOtpStatusMsg({ ...otpStatusMsg, [ticketId]: { type: 'error', text: data.error || 'Invalid OTP' } });
      }
    } catch (err) {
      setOtpStatusMsg({ ...otpStatusMsg, [ticketId]: { type: 'error', text: 'Verification Failed' } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      
      {/* Top Enterprise Banner */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <i className="fas fa-university text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">AMRITA SERVICE SYSTEM (ASS)</h1>
            <p className="text-xs text-slate-400 font-mono">Federated E-Governance • RBAC Secure • Zero AI</p>
          </div>
        </div>

        {/* Multi-Tenant Role Switcher (For Live Hackathon Demo) */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold px-3 uppercase tracking-wider">Demo Role:</span>
          <button
            onClick={() => setCurrentRole('STUDENT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentRole === 'STUDENT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-graduation-cap mr-1"></i> Student
          </button>
          <button
            onClick={() => setCurrentRole('WARDEN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentRole === 'WARDEN' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-user-shield mr-1"></i> Hostel Warden
          </button>
          <button
            onClick={() => setCurrentRole('WORKER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${currentRole === 'WORKER' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-tools mr-1"></i> Plumber (Worker)
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* User Identity Pill */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
              {userData?.role?.[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{userData?.name}</p>
              <p className="text-xs text-slate-400 font-mono">Active Jurisdiction: <span className="text-indigo-400 font-bold">{userData?.zone}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>JWT AUTHENTICATED • NO SENSITIVE DATA LEAK</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. STUDENT VIEW                                         */}
        {/* ======================================================== */}
        {currentRole === 'STUDENT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-fit shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center">
                <i className="fas fa-plus-circle text-indigo-500 mr-2"></i> New Service Request
              </h2>
              <p className="text-xs text-slate-400 mb-6">Zero AI • Deterministic Keyword Auto-Routing</p>

              {submitMsg && (
                <div className="bg-indigo-950/50 border border-indigo-700 text-indigo-200 text-xs p-3 rounded-lg mb-4">
                  {submitMsg}
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Campus Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>Boys Hostel 1</option>
                    <option>Boys Hostel 2</option>
                    <option>Girls Hostel 1</option>
                    <option>Academic Block A</option>
                    <option>Central Library</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Exact Room / Spot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room B-204"
                    value={exactRoom}
                    onChange={(e) => setExactRoom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">🔒 Location masked to protect student privacy.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Issue Description</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="e.g. Tap leaking continuously under the sink"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Submit Request
                </button>
              </form>
            </div>

            {/* Student Tickets Column */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <i className="fas fa-list-check text-indigo-500 mr-2"></i> My Active Applications & Proof-of-Work OTPs
              </h2>

              {tickets.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                  No active requests submitted yet.
                </div>
              ) : (
                tickets.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                          {t.id} • {t.category}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2">{t.zone} - {t.exactRoom}</h3>
                      </div>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        t.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        t.status === 'DISPATCHED' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      "{t.description}"
                    </p>

                    {/* THE INNOVATION: OTP HANDSHAKE DISPLAY */}
                    {t.status !== 'RESOLVED' ? (
                      <div className="bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-700/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div>
                          <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                            <i className="fas fa-key mr-1.5"></i> Verification OTP (Two-Party Handshake)
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Give this code to the worker <strong className="text-indigo-200">ONLY</strong> after you verify the work is finished.
                          </p>
                        </div>
                        <div className="bg-slate-900 border-2 border-indigo-500 px-5 py-2 rounded-xl text-center shadow-lg">
                          <span className="text-2xl font-black text-white font-mono tracking-widest">{t.otp}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/30 border border-emerald-800 text-emerald-400 text-xs p-3 rounded-xl flex items-center">
                        <i className="fas fa-check-circle mr-2 text-base"></i>
                        Work verified and closed via Student OTP Handshake.
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 2. HOSTEL WARDEN VIEW (FEDERATED TRIAGE & HAZARDS)       */}
        {/* ======================================================== */}
        {currentRole === 'WARDEN' && (
          <div className="space-y-6">
            
            {/* THE INNOVATION: SYSTEMIC HAZARD ALERT BANNER */}
            {hazards.length > 0 && (
              <div className="bg-gradient-to-r from-red-950 to-rose-950 border-2 border-red-600 rounded-2xl p-6 shadow-2xl shadow-red-900/40">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-600 text-white p-3 rounded-xl shadow-lg">
                    <i className="fas fa-triangle-exclamation text-2xl animate-bounce"></i>
                  </div>
                  <div>
                    <span className="bg-red-800 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      CRITICAL SYSTEMIC THRESHOLD TRIGGERED
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      {hazards[0].category} Anomaly Detected in {hazards[0].zone}
                    </h3>
                    <p className="text-sm text-red-200 mt-1">
                      {hazards[0].recommendation} (Cluster of {hazards[0].ticketCount} active complaints logged).
                    </p>
                    <p className="text-xs text-red-300 font-mono mt-2">
                      ACTION TAKEN: Escalation alert automatically routed to Chief Campus Engineer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Federated Queue: {userData?.zone}</h2>
                <p className="text-xs text-slate-400">Partitioned jurisdiction. Eliminates central administrative bottlenecks.</p>
              </div>
              <button onClick={loadPortalData} className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
                <i className="fas fa-sync-alt mr-1"></i> Refresh Queue
              </button>
            </div>

            {/* Queue Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map(t => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      {t.id} • {t.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{t.status}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{t.exactRoom} ({t.studentName})</h3>
                  <p className="text-sm text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                    "{t.description}"
                  </p>

                  <div className="flex space-x-2 pt-2 border-t border-slate-800">
                    {t.status === 'PENDING' && (
                      <button
                        onClick={() => handleWardenAction(t.id, 'APPROVED')}
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition"
                      >
                        <i className="fas fa-check mr-1"></i> Approve Request
                      </button>
                    )}
                    {t.status === 'APPROVED' && (
                      <button
                        onClick={() => handleWardenAction(t.id, 'DISPATCHED')}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl text-xs transition"
                      >
                        <i className="fas fa-truck-fast mr-1"></i> Batch Dispatch Worker
                      </button>
                    )}
                    {t.status === 'DISPATCHED' && (
                      <span className="text-xs text-cyan-400 font-mono py-2 w-full text-center">
                        Worker on-site. Awaiting Student OTP Handshake.
                      </span>
                    )}
                    {t.status === 'RESOLVED' && (
                      <span className="text-xs text-emerald-400 font-mono py-2 w-full text-center">
                        ✓ Verified & Closed with OTP.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 3. WORKER VIEW (SPATIAL BATCHING & OTP RESOLUTION)       */}
        {/* ======================================================== */}
        {currentRole === 'WORKER' && (
          <div className="space-y-6">
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Spatial Cluster Batch: {userData?.zone}</h2>
                <p className="text-xs text-emerald-300">
                  Workers are assigned localized building clusters to minimize transit time across 10,000-student campus.
                </p>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                Trade: {userData?.trade}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.filter(t => t.status === 'DISPATCHED' || t.status === 'APPROVED').map(t => (
                <div key={t.id} className="bg-slate-900 border-2 border-emerald-900/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      CLUSTER TASK: {t.id}
                    </span>
                    <span className="text-xs font-bold text-cyan-400">{t.status}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">{t.zone} - {t.exactRoom}</h3>
                  <p className="text-xs text-slate-400 mb-3">Applicant: {t.studentName}</p>

                  <div className="bg-slate-950 p-3 rounded-xl text-sm text-slate-300 mb-6 border border-slate-800">
                    "{t.description}"
                  </div>

                  {/* TWO-PARTY HANDSHAKE RESOLUTION */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                      <i className="fas fa-lock mr-1 text-emerald-400"></i> Enter Student's 4-Digit OTP to Complete Work:
                    </label>
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="e.g. 4821"
                        value={otpInputs[t.id] || ''}
                        onChange={(e) => setOtpInputs({ ...otpInputs, [t.id]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleVerifyOtp(t.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
                      >
                        Verify & Close
                      </button>
                    </div>

                    {otpStatusMsg[t.id] && (
                      <p className={`text-xs mt-2 font-bold ${otpStatusMsg[t.id].type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {otpStatusMsg[t.id].text}
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
