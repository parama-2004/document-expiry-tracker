import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Home from './pages/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './components/Dashboard/AdminDashboard.jsx';
import UploadPage from './pages/UploadPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import ShowDocuments from './pages/ShowDocuments.jsx';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced auth check with error handling
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

        if (!response.ok) throw new Error('Auth failed');
        
        const data = await response.json();
        if (data.username) {
          setUser(data);
          console.log('User authenticated:', data.username);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Use Navigate component instead of window.location
    return <Navigate to="/" replace />;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
          
            <Route 
              path="/upload" 
              element={user ? <UploadPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/alerts" 
              element={user ? <AlertsPage /> : <Navigate to="/login" replace />} 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/public-documents" element={<ShowDocuments />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;