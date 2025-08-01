// === FILE: Header.jsx ===
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import nlcLogo from './assets/nlc_logo.webp';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="Navbar">
      <div className="header-left">
        <img src={nlcLogo} alt="NLC India Ltd Logo" className="nlc-logo" />
        <h1>Document Expiry Tracker</h1>
      </div>
      <ul>
        <li onClick={() => navigate('/')}>Home</li>
        <li onClick={() => navigate('/alerts')}>Alerts</li>
        <li onClick={() => navigate('/upload')}>Upload</li>
        {user ? (
          <>
            <li className="user-info" onClick={handleDashboardClick}>
              Welcome, {user.username}
            </li>
            <li className="logout-btn" onClick={onLogout}>
              Logout
            </li>
          </>
        ) : (
          <li className="login-btn" onClick={handleLoginClick}>Login</li>
        )}
      </ul>
    </div>
  );
}

export default Header;
