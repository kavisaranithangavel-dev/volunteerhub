import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function AmritaPortal() {
  // Demo Role: STUDENT, WARDEN, WORKER_Plumbing, WORKER_Electrical, WORKER_Network
  const [activeRole, setActiveRole] = useState('STUDENT');
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);

  // Active Tile View: 'SERVICES', 'COMPLAINTS', 'GATEPASS', 'PAYMENTS', 'PROFILE', 'DOWNLOADS', 'DOCUMENTS', 'INCIDENTS'
  const [activeView, setActiveView] = useState('SERVICES');

  // Live Data Stores
  const [tickets, setTickets] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [directory, setDirectory] = useState({});

  // Ticket Form State
  const [zone, setZone] = useState('Boys Hostel 1');
  const [exactRoom, setExactRoom] = useState('');
  const [description, setDescription] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(null);

  // Gate Pass Form State
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [outTime, setOutTime] = useState('Today 04:30 PM');
  const [inTime, setInTime] = useState('Today 08:30 PM');
  const [gpSuccess, setGpSuccess] = useState(null);

  // Worker OTP
  const [otpInputs, setOtpInputs] = useState({});
  const [otpFeedback, setOtpFeedback] = useState({});

  // 1. Authenticate with Selected Role
  const login = async (role, trade = null) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, trade })
      });
      const data = await res.json();
      setToken(data.token);
      setUserData(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeRole.startsWith('WORKER_')) {
      const trade = activeRole.replace('WORKER_', '');
      login('WORKER', trade);
    } else {
      login(activeRole);
    }
  }, [activeRole]);

  // 2. Load Real MongoDB Data
  const loadData = async () => {
    if (!token) return;
    try {
      const tRes = await fetch(`${API_BASE}/tickets`, { headers: { Authorization: `Bearer ${token}` } });
      if (tRes.ok) setTickets(await tRes.json());

      const gpRes = await fetch(`${API_BASE}/gatepass`, { headers: { Authorization: `Bearer ${token}` } });
      if (gpRes.ok) setGatePasses(await gpRes.json());

      const dRes = await fetch(`${API_BASE}/network/directory`, { headers: { Authorization: `Bearer ${token}` } });
      if (dRes.ok) setDirectory(await dRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Submit Ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!exactRoom || !description) return;

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ zone, exactRoom, description })
      });
      if (res.ok) {
        setTicketSuccess('Requisition registered and routed to department technician!');
        setExactRoom('');
        setDescription('');
        loadData();
        setActiveView('COMPLAINTS');
      }
    } catch (err) {
      setTicketSuccess('Error submitting ticket.');
    }
  };

  // Submit Gate Pass
  const handleSubmitGatePass = async (e) => {
    e.preventDefault();
    if (!destination || !reason) return;

    try {
      const res = await fetch(`${API_BASE}/gatepass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ destination, reason, outTime, inTime })
      });
      if (res.ok) {
        setGpSuccess('Gate Pass issued & approved by Hostel Warden!');
        setDestination('');
        setReason('');
        loadData();
      }
    } catch (err) {
      setGpSuccess('Error submitting gate pass.');
    }
  };

  // Warden Action
  const handleWardenAction = async (id, status) => {
    try {
      await fetch(`${API_BASE}/tickets/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Worker OTP Verify
  const handleVerifyOtp = async (id) => {
    const otp = otpInputs[id];
    if (!otp) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpFeedback({ ...otpFeedback, [id]: { type: 'success', text: 'Verified! Closed.' } });
        setTimeout(() => loadData(), 1200);
      } else {
        setOtpFeedback({ ...otpFeedback, [id]: { type: 'error', text: data.error || 'Wrong OTP' } });
      }
    } catch (err) {
      setOtpFeedback({ ...otpFeedback, [id]: { type: 'error', text: 'Failed' } });
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f7] font-sans text-gray-800 pb-24">
      
      {/* ========================================================= */}
      {/* 1. AMRITA MAGENTA HEADER                                  */}
      {/* ========================================================= */}
      <header className="bg-[#a31545] shadow-md px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-white text-xl font-bold tracking-tight">Student Portal (Beta)</h1>
        </div>

        {/* Multi-Trade Role Switcher for Hackathon Demo */}
        <div className="flex flex-wrap items-center bg-[#840f36] px-3 py-1.5 rounded-lg border border-white/20 gap-2">
          <span className="text-white/80 text-[11px] font-bold uppercase tracking-wider">Demo Role:</span>
          <button 
            onClick={() => setActiveRole('STUDENT')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${activeRole === 'STUDENT' ? 'bg-white text-[#a31545] shadow' : 'text-white/90 hover:text-white'}`}
          >
            Student
          </button>
          <button 
            onClick={() => { setActiveRole('WARDEN'); setActiveView('COMPLAINTS'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition ${activeRole === 'WARDEN' ? 'bg-white text-[#a31545] shadow' : 'text-white/90 hover:text-white'}`}
          >
            Hostel Warden
          </button>
          <button 
            onClick={() => { setActiveRole('WORKER_Plumbing'); setActiveView('COMPLAINTS'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition ${activeRole === 'WORKER_Plumbing' ? 'bg-white text-[#a31545] shadow' : 'text-white/90 hover:text-white'}`}
          >
            Plumber
          </button>
          <button 
            onClick={() => { setActiveRole('WORKER_Electrical'); setActiveView('COMPLAINTS'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition ${activeRole === 'WORKER_Electrical' ? 'bg-white text-[#a31545] shadow' : 'text-white/90 hover:text-white'}`}
          >
            Electrician
          </button>
          <button 
            onClick={() => { setActiveRole('WORKER_Network'); setActiveView('COMPLAINTS'); }}
            className={`px-3 py-1 rounded text-xs font-bold transition ${activeRole === 'WORKER_Network' ? 'bg-white text-[#a31545] shadow' : 'text-white/90 hover:text-white'}`}
          >
            ICT / Network
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* ========================================================= */}
        {/* 2. AMMA QUOTE CARD + HELP LINKS                           */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start gap-4 border border-gray-100">
            <div className="flex-1">
              <span className="text-[#f59e0b] text-5xl font-serif font-black leading-none block mb-1">“</span>
              <p className="text-[#a31545] text-sm md:text-base leading-relaxed font-normal">
                Youngsters need to understand the real purpose of life. They need courage and wisdom to face the challenges of life. Only with that understanding they can become the light of the world. If we care for them responsibly and mold their whole character with love, then the future of the world will be safe
              </p>
              <p className="text-[#a31545] font-bold text-sm mt-4">— Amma</p>
            </div>
            <div className="flex-shrink-0 self-center sm:self-start">
              <div className="w-24 h-24 rounded-full border-2 border-cyan-400 p-0.5 shadow-md overflow-hidden bg-pink-50 flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Mata_Amritanandamayi_at_Kollam.jpg/220px-Mata_Amritanandamayi_at_Kollam.jpg" 
                  alt="Amma" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"; }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Help & Important Links</span>
                <i className="fas fa-caret-up text-gray-400 text-sm"></i>
              </div>
              <ul className="space-y-3 text-xs text-[#2563eb]">
                <li onClick={() => setActiveView('PAYMENTS')} className="flex items-center space-x-2 hover:underline cursor-pointer">
                  <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
                  <i className="fas fa-circle-question text-blue-500"></i>
                  <span>Payment Help Document</span>
                </li>
                <li onClick={() => setActiveView('GATEPASS')} className="flex items-center space-x-2 hover:underline cursor-pointer">
                  <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
                  <i className="fas fa-circle-question text-blue-500"></i>
                  <span>Propelld loan process flow</span>
                </li>
                <li onClick={() => setActiveView('SERVICES')} className="flex items-center space-x-2 hover:underline cursor-pointer">
                  <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
                  <i className="fas fa-circle-question text-blue-500"></i>
                  <span>Hostel Maintenance & OTP Protocol</span>
                </li>
              </ul>
            </div>
            <div className="text-right pt-2 border-t border-gray-100 mt-2">
              <i className="fas fa-caret-down text-gray-400 text-sm cursor-pointer"></i>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. THE 8 ICONIC AMRITA ACTION TILES                       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <AmritaTile title="PROFILE" icon="fa-graduation-cap" active={activeView === 'PROFILE'} onClick={() => setActiveView('PROFILE')} />
          <AmritaTile title="PAYMENTS" icon="fa-indian-rupee-sign" active={activeView === 'PAYMENTS'} onClick={() => setActiveView('PAYMENTS')} />
          <AmritaTile title="GATE PASS" icon="fa-building" active={activeView === 'GATEPASS'} onClick={() => setActiveView('GATEPASS')} />
          <AmritaTile title="SERVICES" icon="fa-pen-to-square" active={activeView === 'SERVICES'} onClick={() => setActiveView('SERVICES')} />
          <AmritaTile title="COMPLAINTS" icon="fa-comment" active={activeView === 'COMPLAINTS'} onClick={() => setActiveView('COMPLAINTS')} />
          <AmritaTile title="DOWNLOADS" icon="fa-download" active={activeView === 'DOWNLOADS'} onClick={() => setActiveView('DOWNLOADS')} />
          <AmritaTile title="Documents" icon="fa-file-lines" active={activeView === 'DOCUMENTS'} onClick={() => setActiveView('DOCUMENTS')} />
          <AmritaTile title="INCIDENTS" icon="fa-comment-dots" active={activeView === 'INCIDENTS'} onClick={() => setActiveView('INCIDENTS')} />
        </div>

        {/* ========================================================= */}
        {/* 4. DYNAMIC INTERACTIVE SECTION (100% REAL & FUNCTIONAL)   */}
        {/* ========================================================= */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          
          {/* Active Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#a31545] uppercase tracking-wider">Active Functional View</span>
              <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center">
                {activeView === 'SERVICES' && <><i className="fas fa-pen-to-square text-[#a31545] mr-2 text-xl"></i> Requisition & Campus Network</>}
                {activeView === 'COMPLAINTS' && <><i className="fas fa-comment text-[#a31545] mr-2 text-xl"></i> Active Maintenance & Two-Party OTPs</>}
                {activeView === 'GATEPASS' && <><i className="fas fa-building-shield text-[#a31545] mr-2 text-xl"></i> Digital Hostel Gate Pass & Out-Pass System</>}
                {activeView === 'PAYMENTS' && <><i className="fas fa-receipt text-[#a31545] mr-2 text-xl"></i> Semester Dues & Multi-Department No-Dues Clearance</>}
                {activeView === 'PROFILE' && <><i className="fas fa-id-card text-[#a31545] mr-2 text-xl"></i> Official Amrita Student Academic Dossier</>}
                {activeView === 'DOWNLOADS' && <><i className="fas fa-download text-[#a31545] mr-2 text-xl"></i> Official University Circulars & Downloads</>}
                {activeView === 'DOCUMENTS' && <><i className="fas fa-file-contract text-[#a31545] mr-2 text-xl"></i> Verified Bonafide & Academic Certificates</>}
                {activeView === 'INCIDENTS' && <><i className="fas fa-shield-alt text-[#a31545] mr-2 text-xl"></i> 24x7 Security & Emergency Incident Command</>}
              </h2>
            </div>
            <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-gray-600">
              Authenticated: <strong>{userData?.name || 'Pranav K'}</strong> ({userData?.role})
            </span>
          </div>

          {/* VIEW 1: SERVICES (REQUISITION FORM & TRADE DIRECTORY) */}
          {activeView === 'SERVICES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-gray-800">Submit New Maintenance Requisition</h3>
                <p className="text-xs text-gray-500">Auto-routes to the designated campus technician (Electrician, Plumber, IT, Carpenter, Sanitation).</p>

                {ticketSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center">
                    <i className="fas fa-check-circle mr-2 text-emerald-600"></i> {ticketSuccess}
                  </div>
                )}

                <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Campus Zone</label>
                      <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]">
                        <option>Boys Hostel 1</option>
                        <option>Boys Hostel 2</option>
                        <option>Girls Hostel 1</option>
                        <option>Academic Block A</option>
                        <option>Academic Block B</option>
                        <option>Central Library</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Room / Lab Number</label>
                      <input type="text" required placeholder="e.g. Room B-204" value={exactRoom} onChange={(e) => setExactRoom(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Description of Issue</label>
                    <textarea rows="4" required placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-[#a31545] hover:bg-[#8e123c] text-white font-bold py-3 rounded-lg transition shadow">
                    Transmit Requisition
                  </button>
                </form>
              </div>

              {/* Complete Staff Directory */}
              <div className="lg:col-span-5 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                  <i className="fas fa-address-book text-[#a31545] mr-2"></i> Campus Trade Network Directory
                </h3>
                <p className="text-[11px] text-gray-500 mb-4">Dedicated department technicians on campus:</p>

                <div className="space-y-2.5 text-xs">
                  {Object.entries(directory).map(([trade, staff]) => (
                    <div key={trade} className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                      <div>
                        <span className="font-bold text-[#a31545] block">{trade} Department</span>
                        <span className="text-gray-600 text-[11px]">{staff.name}</span>
                      </div>
                      <span className="text-gray-500 font-mono text-[10px] bg-gray-100 px-2 py-1 rounded">{staff.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: COMPLAINTS & OTP HANDSHAKES */}
          {activeView === 'COMPLAINTS' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-gray-500">Live queue with Two-Party OTP Handshake protection.</p>
                <button onClick={loadData} className="text-xs text-[#a31545] font-bold hover:underline"><i className="fas fa-sync mr-1"></i> Refresh</button>
              </div>

              {tickets.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs bg-gray-50 rounded-lg">No active requests.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets.map(t => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[#a31545] bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                          {t.id} • {t.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'DISPATCHED' ? 'bg-cyan-100 text-cyan-800 animate-pulse' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mt-1">{t.zone} - {t.exactRoom}</h4>
                      <p className="text-xs text-gray-600 my-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">"{t.description}"</p>
                      <p className="text-[11px] text-gray-500 mb-3"><i className="fas fa-user-gear mr-1 text-[#a31545]"></i> Assigned: <strong>{t.allocatedWorker}</strong></p>

                      {/* Student OTP Display */}
                      {userData?.role === 'STUDENT' && t.status !== 'RESOLVED' && (
                        <div className="bg-[#a31545]/5 border border-[#a31545]/20 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-bold text-[#a31545] uppercase block"><i className="fas fa-shield-alt mr-1"></i> Resolution OTP</span>
                            <span className="text-[10px] text-gray-500">Provide to technician ONLY after repair:</span>
                          </div>
                          <span className="text-lg font-black font-mono text-[#a31545] bg-white px-3 py-1 rounded border border-[#a31545]/30">{t.otp}</span>
                        </div>
                      )}

                      {/* Warden Action */}
                      {userData?.role === 'WARDEN' && (
                        <div className="pt-2 border-t border-gray-100 flex space-x-2">
                          {t.status === 'PENDING' && (
                            <button onClick={() => handleWardenAction(t.id, 'APPROVED')} className="flex-1 bg-amber-600 text-white font-bold py-1.5 rounded text-xs">Approve Requisition</button>
                          )}
                          {t.status === 'APPROVED' && (
                            <button onClick={() => handleWardenAction(t.id, 'DISPATCHED')} className="flex-1 bg-[#a31545] text-white font-bold py-1.5 rounded text-xs">Dispatch Technician</button>
                          )}
                          {t.status === 'DISPATCHED' && <span className="text-xs text-cyan-700 font-bold py-1 text-center w-full">Staff dispatched. Awaiting Student OTP.</span>}
                        </div>
                      )}

                      {/* Worker OTP Enter */}
                      {userData?.role === 'WORKER' && t.status !== 'RESOLVED' && (
                        <div className="pt-2 border-t border-gray-100">
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Enter Student's 4-Digit OTP to Complete:</label>
                          <div className="flex space-x-2">
                            <input type="text" maxLength="4" placeholder="e.g. 4821" value={otpInputs[t.id] || ''} onChange={(e) => setOtpInputs({ ...otpInputs, [t.id]: e.target.value })} className="w-28 text-center font-mono font-bold text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1" />
                            <button onClick={() => handleVerifyOtp(t.id)} className="bg-emerald-600 text-white font-bold px-3 py-1 rounded text-xs">Verify & Close</button>
                          </div>
                          {otpFeedback[t.id] && <p className={`text-[10px] mt-1 font-bold ${otpFeedback[t.id].type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{otpFeedback[t.id].text}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: GATE PASS (DIGITAL OUT-PASS WITH QR & REAL FORM) */}
          {activeView === 'GATEPASS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-800">Apply for Campus Out-Pass / Day Pass</h3>
                <p className="text-xs text-gray-500">Official digital gate clearance verified at Main Security Gates 1 & 2.</p>

                {gpSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center">
                    <i className="fas fa-check-circle mr-2 text-emerald-600"></i> {gpSuccess}
                  </div>
                )}

                <form onSubmit={handleSubmitGatePass} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Destination</label>
                    <input type="text" required placeholder="e.g. Coimbatore Town / Gandhipuram" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]" />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Reason for Leaving</label>
                    <input type="text" required placeholder="e.g. Medical Consultation / Library supplies" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Out Time</label>
                      <input type="text" value={outTime} onChange={(e) => setOutTime(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Return Time</label>
                      <input type="text" value={inTime} onChange={(e) => setInTime(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#a31545]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#a31545] hover:bg-[#8e123c] text-white font-bold py-3 rounded-lg transition shadow">
                    Generate Digital Gate Pass
                  </button>
                </form>
              </div>

              {/* Active Gate Passes with Barcodes */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-800">Active Gate Passes ({gatePasses.length})</h3>
                {gatePasses.map(gp => (
                  <div key={gp.id} className="bg-white border-2 border-[#a31545]/20 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-white bg-[#a31545] px-2 py-0.5 rounded">
                          AMRITA MAIN GATE CLEARANCE
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-1">{gp.destination}</h4>
                        <p className="text-xs text-gray-500">{gp.studentName} ({gp.rollNo})</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        WARDEN APPROVED
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 mb-4 border border-gray-100">
                      <p><strong>Reason:</strong> {gp.reason}</p>
                      <p><strong>Permitted Out:</strong> {gp.outTime} • <strong>Return By:</strong> {gp.inTime}</p>
                    </div>

                    {/* Digital Gate Pass Barcode Simulation */}
                    <div className="border-t border-dashed border-gray-300 pt-3 text-center">
                      <p className="text-[10px] font-mono text-gray-400 tracking-widest mb-1">{gp.id} • {gp.qrCode}</p>
                      <div className="flex justify-center space-x-1 h-8 items-end">
                        {[4,8,2,6,10,3,7,2,8,5,9,3,7,4,9,2,6,8,4].map((h, i) => (
                          <div key={i} className="bg-gray-800 w-1 rounded-sm" style={{ height: `${h * 3}px` }}></div>
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-500 block mt-1">Scan at Security Turnstile Gate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: PAYMENTS & NO-DUES CLEARANCE */}
          {activeView === 'PAYMENTS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Tuition Fee (Sem 7)</span>
                  <p className="text-2xl font-black text-emerald-800 mt-1">₹1,45,000</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded mt-2 inline-block">✓ PAID & VERIFIED</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Hostel & Mess Fee</span>
                  <p className="text-2xl font-black text-emerald-800 mt-1">₹48,000</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded mt-2 inline-block">✓ PAID & VERIFIED</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                  <span className="text-xs font-bold text-purple-700 uppercase">No-Dues Status</span>
                  <p className="text-2xl font-black text-purple-800 mt-1">6 / 6 Clear</p>
                  <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded mt-2 inline-block">CLEARANCE COMPLETE</span>
                </div>
              </div>

              {/* Multi-Department No-Dues Clearance Table */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                  <i className="fas fa-stamp text-[#a31545] mr-2"></i> Automated Parallel No-Dues Clearance Engine
                </h3>
                <p className="text-xs text-gray-500 mb-4">Eliminates physical clearance paper stamps across all 6 university administrative nodes:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { dept: 'Central Library', status: 'CLEARED', note: '0 Books Overdue' },
                    { dept: 'Computing Labs', status: 'CLEARED', note: 'Assets Accounted' },
                    { dept: 'Boys Hostel 1', status: 'CLEARED', note: 'Room Inventory Intact' },
                    { dept: 'Physical Education / Sports', status: 'CLEARED', note: 'Equipment Returned' },
                    { dept: 'Finance & Accounts', status: 'CLEARED', note: 'Zero Balance' },
                    { dept: 'Academic Department (CSE)', status: 'CLEARED', note: 'Credits Complete' }
                  ].map((d, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <strong className="block text-gray-800">{d.dept}</strong>
                        <span className="text-[10px] text-gray-500">{d.note}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        ✓ {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: PROFILE (COMPLETE DOSSIER) */}
          {activeView === 'PROFILE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              <div className="lg:col-span-4 bg-gray-50 border border-gray-200 p-6 rounded-xl text-center">
                <div className="w-24 h-24 rounded-full bg-[#a31545] text-white flex items-center justify-center font-bold text-3xl mx-auto mb-3 shadow">
                  PK
                </div>
                <h3 className="text-lg font-bold text-gray-900">Pranav K</h3>
                <p className="text-gray-500 font-mono">CB.EN.U4CSE21104</p>
                <span className="bg-[#a31545]/10 text-[#a31545] font-bold px-3 py-1 rounded-full text-[10px] mt-2 inline-block">
                  B.Tech Computer Science (2021-2025)
                </span>
                <div className="mt-4 pt-4 border-t border-gray-200 text-left space-y-2">
                  <p><strong>Hostel:</strong> Boys Hostel 1 (Room B-204)</p>
                  <p><strong>Mess:</strong> Annapoorna Dining Hall</p>
                  <p><strong>Faculty Advisor:</strong> Dr. Preethi N.</p>
                </div>
              </div>

              <div className="lg:col-span-8 bg-white border border-gray-200 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-gray-800">Academic & Conduct Record</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-center">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Current CGPA</span>
                    <p className="text-xl font-black text-blue-800 mt-1">8.62</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-center">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Attendance</span>
                    <p className="text-xl font-black text-emerald-800 mt-1">89.2%</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg text-center">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Semester</span>
                    <p className="text-xl font-black text-purple-800 mt-1">7th Sem</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-center">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Conduct</span>
                    <p className="text-xl font-black text-amber-800 mt-1">Exemplary</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p><strong>Permanent Address:</strong> 14/B Gandhi Road, Coimbatore, Tamil Nadu - 641001</p>
                  <p><strong>Guardian Contact:</strong> +91 98401 23456 (SMS Gate Pass Alerts Enabled)</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: DOWNLOADS & OFFICIAL CIRCULARS */}
          {activeView === 'DOWNLOADS' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-gray-800">Official Campus Handbook & Circular Downloads</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Amrita Academic Calendar 2026-2027', size: '1.2 MB', ext: 'PDF' },
                  { title: 'Hostel Code of Conduct & Curfew Policy', size: '850 KB', ext: 'PDF' },
                  { title: 'ICT Network Wi-Fi Configuration Protocol', size: '420 KB', ext: 'PDF' },
                  { title: 'University Examination Ordinance & Rules', size: '2.1 MB', ext: 'PDF' }
                ].map((doc, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 transition">
                    <div>
                      <strong className="text-gray-800 block">{doc.title}</strong>
                      <span className="text-gray-400 text-[11px]">{doc.size} • Verified Publication</span>
                    </div>
                    <button onClick={() => alert(`Downloading verified: ${doc.title}`)} className="bg-[#a31545] text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center shadow">
                      <i className="fas fa-download mr-1"></i> {doc.ext}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: DOCUMENTS & BONAFIDE GENERATOR */}
          {activeView === 'DOCUMENTS' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Digitally Verified University Certificates</h3>
              <p className="text-gray-500">Official bonafide and fee receipts signed with Amrita Digital Seal:</p>

              <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-xl max-w-xl mx-auto shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#a31545] text-white flex items-center justify-center mx-auto text-xl font-bold">
                  <i className="fas fa-university"></i>
                </div>
                <h4 className="text-sm font-bold text-[#a31545] uppercase tracking-wide">AMRITA VISHWA VIDYAPEETHAM</h4>
                <p className="text-gray-500 text-[11px]">COIMBATORE CAMPUS • OFFICE OF THE REGISTRAR</p>
                <div className="border-t border-b border-gray-100 py-4 my-2 text-left space-y-1.5 text-gray-700">
                  <p>This is to certify that <strong>Pranav K (CB.EN.U4CSE21104)</strong> is a bona fide student of this institution, currently enrolled in the 7th Semester of the B.Tech Computer Science & Engineering program during the academic year 2026-2027.</p>
                  <p className="text-[10px] text-gray-400 mt-2">Issued for: Passport / Education Loan / Internship Verification</p>
                </div>
                <button onClick={() => alert("Digital Certificate downloaded with Amrita SHA-256 seal.")} className="bg-[#a31545] text-white px-5 py-2 rounded-lg font-bold shadow">
                  <i className="fas fa-print mr-1"></i> Download Verified PDF
                </button>
              </div>
            </div>
          )}

          {/* VIEW 8: INCIDENTS (EMERGENCY SOS & WHISTLEBLOWER) */}
          {activeView === 'INCIDENTS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl space-y-3">
                <div className="flex items-center space-x-3 text-red-700">
                  <i className="fas fa-truck-medical text-2xl"></i>
                  <h3 className="text-sm font-bold">Emergency Medical Buggy Dispatch</h3>
                </div>
                <p className="text-red-600 text-[11px]">Immediate transit dispatch to Amrita Health Centre for sick/injured students at night.</p>
                <button onClick={() => alert("Medical Buggy Dispatched to Boys Hostel 1! Driver arriving in 4 mins.")} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg shadow">
                  <i className="fas fa-phone mr-1"></i> Summon Medical Buggy
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-white space-y-3">
                <div className="flex items-center space-x-3 text-amber-400">
                  <i className="fas fa-shield-halved text-2xl"></i>
                  <h3 className="text-sm font-bold">Zero-Identity Grievance Channel</h3>
                </div>
                <p className="text-slate-400 text-[11px]">Strictly encrypted reporting for anti-ragging and campus security issues directly to the Proctorial Board.</p>
                <button onClick={() => alert("Confidential grievance ledger opened.")} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow">
                  <i className="fas fa-lock mr-1"></i> File Confidential Report
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// THE SIGNATURE AMRITA ACTION TILE COMPONENT
function AmritaTile({ title, icon, onClick, active = false }) {
  return (
    <div 
      onClick={onClick}
      className={`relative bg-white shadow-sm rounded-md flex justify-between items-center overflow-hidden transition cursor-pointer border h-16 group ${
        active ? 'ring-2 ring-[#a31545] shadow-md bg-pink-50/20' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      <span className="font-semibold text-xs tracking-wider pl-4 text-[#a31545]">
        {title}
      </span>
      <div 
        className={`h-full flex items-center justify-center pl-6 pr-4 transition-all duration-300 ${
          active ? 'bg-[#840f36]' : 'bg-[#a31545] group-hover:bg-[#8e123c]'
        }`}
        style={{ clipPath: 'polygon(32% 0%, 100% 0%, 100% 100%, 0% 100%)', width: '72px' }}
      >
        <i className={`fas ${icon} text-white text-base ml-2`}></i>
      </div>
    </div>
  );
}
