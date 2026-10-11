import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function AmritaServices() {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);

  // Student Navigation Tabs
  const [currentTab, setCurrentTab] = useState('REQUEST'); // 'REQUEST', 'TRACKING', 'DIRECTORY'

  // Service Request Form State
  const [category, setCategory] = useState('Plumbing');
  const [zone, setZone] = useState('Boys Hostel 1');
  const [exactRoom, setExactRoom] = useState('');
  const [description, setDescription] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 AM - 12:00 PM)');
  const [successMsg, setSuccessMsg] = useState(null);

  // Student Tickets & Campus Directory
  const [myTickets, setMyTickets] = useState([]);
  const [directory, setDirectory] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Authenticate Strictly as Student
  useEffect(() => {
    const authStudent = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'STUDENT' })
        });
        const data = await res.json();
        setToken(data.token);
        setUserData(data.user);
      } catch (err) {
        console.error(err);
      }
    };
    authStudent();
  }, []);

  // 2. Fetch Student Tickets & Directory
  const loadStudentData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const tRes = await fetch(`${API_BASE}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tRes.ok) setMyTickets(await tRes.json());

      const dRes = await fetch(`${API_BASE}/network/directory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dRes.ok) setDirectory(await dRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) loadStudentData();
  }, [token]);

  // 3. Submit Requisition
  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!exactRoom || !description) return;

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zone,
          exactRoom,
          description: `[${category} - ${timeSlot}] ${description}`
        })
      });

      if (res.ok) {
        setSuccessMsg(`Your service request for ${category} has been submitted!`);
        setExactRoom('');
        setDescription('');
        loadStudentData();
        setCurrentTab('TRACKING');
      }
    } catch (err) {
      setSuccessMsg('Error submitting request.');
    }
  };

  // 6 Campus Service Departments
  const SERVICE_DEPARTMENTS = [
    { id: 'Plumbing', name: 'Water & Plumbing', icon: 'fa-faucet-drip', staff: 'Ramesh K. (Chief Plumber)', phone: 'Ext-4411' },
    { id: 'Electrical', name: 'Electrical & Power', icon: 'fa-bolt', staff: 'Suresh M. (Lead Electrician)', phone: 'Ext-4422' },
    { id: 'Carpentry', name: 'Carpentry & Furniture', icon: 'fa-hammer', staff: 'Murugan P. (Senior Carpenter)', phone: 'Ext-4433' },
    { id: 'Network', name: 'ICT, Wi-Fi & LAN', icon: 'fa-wifi', staff: 'Dinesh V. (Network Admin)', phone: 'Ext-4455' },
    { id: 'Sanitation', name: 'Sanitation & Housekeeping', icon: 'fa-broom', staff: 'Selvi R. (Sanitation Supervisor)', phone: 'Ext-4466' },
    { id: 'Civil', name: 'Civil & Masonry Works', icon: 'fa-trowel-bricks', staff: 'Rajan B. (Civil Works Engg)', phone: 'Ext-4477' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f7] font-sans text-gray-800 pb-20">
      
      {/* Official Amrita Maroon Header (Pure Student Portal) */}
      <header className="bg-[#a31545] shadow-md px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg text-white">
            <i className="fas fa-university text-xl"></i>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold tracking-tight">Amrita Student Services Portal</h1>
            <p className="text-pink-100 text-xs">Unified Campus Facility Requisition System</p>
          </div>
        </div>

        {/* Student Identity Badge */}
        <div className="flex items-center space-x-3 bg-black/15 px-3.5 py-1.5 rounded-lg border border-white/10">
          <div className="w-7 h-7 bg-white text-[#a31545] rounded-full flex items-center justify-center font-bold text-xs shadow-inner">
            PK
          </div>
          <div className="text-right">
            <span className="text-white text-xs font-bold block leading-tight">Pranav K</span>
            <span className="text-pink-200 text-[10px] font-mono block">CB.EN.U4CSE21104</span>
          </div>
        </div>
      </header>

      {/* Main Student Container */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-3 shadow-sm overflow-x-auto">
          <button 
            onClick={() => setCurrentTab('REQUEST')}
            className={`pb-3 px-5 text-sm font-bold border-b-2 transition flex items-center whitespace-nowrap ${
              currentTab === 'REQUEST' 
                ? 'border-[#a31545] text-[#a31545]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-plus-circle mr-2"></i> Book a Service
          </button>
          <button 
            onClick={() => setCurrentTab('TRACKING')}
            className={`pb-3 px-5 text-sm font-bold border-b-2 transition flex items-center whitespace-nowrap ${
              currentTab === 'TRACKING' 
                ? 'border-[#a31545] text-[#a31545]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-list-check mr-2"></i> My Active Requests & Verification OTPs ({myTickets.length})
          </button>
          <button 
            onClick={() => setCurrentTab('DIRECTORY')}
            className={`pb-3 px-5 text-sm font-bold border-b-2 transition flex items-center whitespace-nowrap ${
              currentTab === 'DIRECTORY' 
                ? 'border-[#a31545] text-[#a31545]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-address-book mr-2"></i> Campus Service Directory
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: BOOK A SERVICE                                     */}
        {/* ========================================================= */}
        {currentTab === 'REQUEST' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-md p-6 sm:p-8 border border-gray-200">
            
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-lg mb-6 flex items-center">
                <i className="fas fa-check-circle text-emerald-600 text-base mr-3"></i>
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitService} className="space-y-6">
              
              {/* Step 1: Select Service Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                  1. Select Campus Service Department
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {SERVICE_DEPARTMENTS.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => setCategory(dept.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition text-center flex flex-col items-center justify-center ${
                        category === dept.id
                          ? 'border-[#a31545] bg-[#a31545]/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <i className={`fas ${dept.icon} text-xl mb-2 ${category === dept.id ? 'text-[#a31545]' : 'text-gray-500'}`}></i>
                      <span className={`text-xs font-bold ${category === dept.id ? 'text-[#a31545]' : 'text-gray-700'}`}>
                        {dept.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    2. Campus Zone / Building
                  </label>
                  <select 
                    value={zone} 
                    onChange={(e) => setZone(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#a31545]"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    3. Room / Lab Number
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Room B-204" 
                    value={exactRoom} 
                    onChange={(e) => setExactRoom(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#a31545]"
                  />
                </div>
              </div>

              {/* Step 3: Preferred Visit Window */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  4. Preferred Visit Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Morning (09:00 AM - 12:00 PM)',
                    'Afternoon (01:00 PM - 04:00 PM)',
                    'Evening (04:00 PM - 07:00 PM)'
                  ].map((slot) => (
                    <label 
                      key={slot} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer text-xs transition ${
                        timeSlot === slot ? 'border-[#a31545] bg-[#a31545]/5 font-bold text-[#a31545]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="timeslot" 
                        checked={timeSlot === slot} 
                        onChange={() => setTimeSlot(slot)} 
                        className="mr-2 text-[#a31545] focus:ring-[#a31545]" 
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 4: Issue Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  5. Detailed Description of the Issue
                </label>
                <textarea 
                  rows="4" 
                  required 
                  placeholder="Please describe what needs repair or servicing in detail..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:border-[#a31545]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-[#a31545] hover:bg-[#890f38] text-white font-bold py-3.5 rounded-lg shadow-md transition text-sm flex items-center justify-center"
                >
                  <i className="fas fa-paper-plane mr-2"></i> Submit Service Requisition
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY ACTIVE REQUESTS & OTP HANDSHAKES                */}
        {/* ========================================================= */}
        {currentTab === 'TRACKING' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-md p-6 sm:p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">My Active Requisitions & Resolution OTPs</h3>
                <p className="text-xs text-gray-500">Give your 4-Digit OTP to the technician ONLY after inspecting the completed repair.</p>
              </div>
              <button onClick={loadStudentData} className="text-xs text-[#a31545] font-bold hover:underline flex items-center">
                <i className="fas fa-sync mr-1"></i> Refresh Requests
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <i className="fas fa-inbox text-3xl mb-2 text-gray-300"></i>
                <p className="text-xs font-medium">You have no active service requests at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myTickets.map(t => (
                  <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-[#a31545] bg-pink-50 px-2.5 py-0.5 rounded border border-pink-200">
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
                    <p className="text-xs text-gray-600 my-2.5 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                      "{t.description}"
                    </p>

                    <div className="text-[11px] text-gray-500 mb-3 flex items-center justify-between">
                      <span><i className="fas fa-user-gear mr-1 text-[#a31545]"></i> Assigned Staff: <strong>{t.allocatedWorker}</strong></span>
                    </div>

                    {/* TWO-PARTY VERIFICATION OTP (STUDENT ONLY) */}
                    {t.status !== 'RESOLVED' ? (
                      <div className="bg-[#a31545]/5 border border-[#a31545]/20 rounded-lg p-3.5 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-bold text-[#a31545] uppercase block">
                            <i className="fas fa-shield-alt mr-1"></i> Two-Party Verification OTP
                          </span>
                          <span className="text-[10px] text-gray-500">Provide to technician only after work is complete:</span>
                        </div>
                        <span className="text-xl font-black font-mono text-[#a31545] bg-white px-3 py-1 rounded border border-[#a31545]/30 shadow-sm">
                          {t.otp}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center">
                        <i className="fas fa-check-circle mr-2 text-emerald-600"></i>
                        Work verified and closed with your student OTP.
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CAMPUS SERVICE DIRECTORY                           */}
        {/* ========================================================= */}
        {currentTab === 'DIRECTORY' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-md p-6 sm:p-8 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Amrita Campus Facility Staff Directory</h3>
            <p className="text-xs text-gray-500 mb-6">Dedicated department personnel assigned to service requests across the university.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICE_DEPARTMENTS.map((dept) => (
                <div key={dept.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#a31545]/10 text-[#a31545] flex items-center justify-center text-lg flex-shrink-0">
                    <i className={`fas ${dept.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900">{dept.name}</h4>
                    <p className="text-xs text-[#a31545] font-semibold mt-0.5">{dept.staff}</p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">Internal Phone: {dept.phone}</span>
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
