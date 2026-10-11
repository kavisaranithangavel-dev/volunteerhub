import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function LoginPage({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [username, setUsername] = useState('CB.EN.U4CSE21104');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'STUDENT') {
      setUsername('CB.EN.U4CSE21104');
      setPassword('student123');
    } else if (role === 'WARDEN') {
      setUsername('warden_bh1');
      setPassword('warden123');
    } else if (role === 'ESTATE') {
      setUsername('estate_finance');
      setPassword('estate123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please verify your roll number & password.');
      }
    } catch (err) {
      setErrorMsg('Cannot reach Amrita Authentication Server on port 5000.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f7] flex flex-col justify-center items-center px-4 py-8 font-sans">
      
      {/* Amrita University Branding */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#a31545] text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3 shadow-lg shadow-[#a31545]/30">
          <i className="fas fa-university"></i>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">AMRITA VISHWA VIDYAPEETHAM</h1>
        <p className="text-xs text-gray-500 uppercase font-mono tracking-widest mt-1">
          Student Portal • Secure Authentication Service
        </p>
      </div>

      {/* Main Amrita Login Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Maroon Header */}
        <div className="bg-[#a31545] px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold flex items-center">
              <i className="fas fa-lock mr-2 text-sm"></i> Student Portal Login
            </h2>
            <p className="text-pink-100 text-[11px]">Official Single Sign-On (SSO)</p>
          </div>
          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-mono">
            SECURE
          </span>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleRoleSelect('STUDENT')}
              className={`py-2 rounded-lg transition ${
                selectedRole === 'STUDENT' ? 'bg-[#a31545] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('WARDEN')}
              className={`py-2 rounded-lg transition ${
                selectedRole === 'WARDEN' ? 'bg-[#a31545] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏢 Warden
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('ESTATE')}
              className={`py-2 rounded-lg transition ${
                selectedRole === 'ESTATE' ? 'bg-[#a31545] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏛️ Finance
            </button>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl mb-4 flex items-center">
              <i className="fas fa-circle-exclamation text-rose-500 text-base mr-2.5 flex-shrink-0"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                {selectedRole === 'STUDENT' ? 'Student Roll Number' : 'Staff / Department ID'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <i className="fas fa-id-card"></i>
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. CB.EN.U4CSE21104"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-[#a31545]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <i className="fas fa-key"></i>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-[#a31545]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#a31545] hover:bg-[#890f38] text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs flex items-center justify-center disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <><i className="fas fa-circle-notch fa-spin mr-2"></i> Authenticating with Amrita CAS...</>
                ) : (
                  <><i className="fas fa-arrow-right-to-bracket mr-2"></i> Sign In to Student Portal</>
                )}
              </button>
            </div>
          </form>

          {/* Security Callout */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span><i className="fas fa-shield-halved text-emerald-600 mr-1"></i> 256-Bit SSL Encrypted</span>
            <span>AUMS SSO CAS v4.2</span>
          </div>

        </div>

      </div>

      {/* Demo Quick-Login Credentials */}
      <div className="mt-6 text-center max-w-md w-full">
        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block mb-2">
          Judge & Evaluator Demo Credentials:
        </span>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleRoleSelect('STUDENT')}
            className="bg-white border border-gray-200 text-gray-700 hover:text-[#a31545] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            🎓 Student Profile
          </button>
          <button
            onClick={() => handleRoleSelect('WARDEN')}
            className="bg-white border border-gray-200 text-gray-700 hover:text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            🏢 Hostel Warden
          </button>
          <button
            onClick={() => handleRoleSelect('ESTATE')}
            className="bg-white border border-gray-200 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            🏛️ Finance Board
          </button>
        </div>
      </div>

    </div>
  );
}
