import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import AmritaServices from './components/AmritaServices';
import HostelAdminPortal from './components/HostelAdminPortal';
import UniversityFinancePortal from './components/UniversityFinancePortal';

function App() {
  // Always start on the Login Page by default so the user can log in!
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.clear();
  };

  // IF NOT LOGGED IN: SHOW THE OFFICIAL AMRITA STUDENT LOGIN PAGE
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ONCE AUTHENTICATED: RENDER THE CORRESPONDING PORTAL WITH SIGN OUT
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Top Security Session Bar */}
      <div className="bg-[#111827] text-white px-6 py-2 flex justify-between items-center text-xs border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-gray-300">
            Authenticated Session: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 px-3 py-1 rounded-md text-[11px] font-bold transition flex items-center cursor-pointer"
        >
          <i className="fas fa-arrow-right-from-bracket mr-1.5"></i> Sign Out
        </button>
      </div>

      {/* Role-Protected Portal View */}
      <div className="flex-1">
        {currentUser.role === 'STUDENT' && <AmritaServices />}
        {currentUser.role === 'WARDEN' && <HostelAdminPortal />}
        {(currentUser.role === 'ESTATE' || currentUser.role === 'FINANCE') && <UniversityFinancePortal />}
      </div>

    </div>
  );
}

export default App;
