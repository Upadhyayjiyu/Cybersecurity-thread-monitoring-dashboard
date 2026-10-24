import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AlertsPanel from './components/AlertsPanel';
import Navbar from './components/Navbar';

// Connect to backend socket
export const socket = io('http://localhost:5001', {
  autoConnect: false,
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (token) {
      socket.connect();
      socket.on('new_alert', (alert) => {
        setAlerts((prev) => [alert, ...prev].slice(0, 50)); // Keep last 50
      });
    } else {
      socket.disconnect();
    }

    return () => {
      socket.off('new_alert');
    };
  }, [token]);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {token && <Navbar user={user} onLogout={handleLogout} />}
        <div className="flex-grow flex relative">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
            <Route 
              path="/dashboard" 
              element={token ? (user?.role === 'Admin' ? <AdminDashboard token={token} alerts={alerts} /> : <div className="p-8">User Dashboard (Limited View)</div>) : <Navigate to="/" />} 
            />
          </Routes>
          {token && user?.role === 'Admin' && <AlertsPanel alerts={alerts} />}
        </div>
      </div>
    </Router>
  );
}

export default App;
