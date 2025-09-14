import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets from './pages/Budgets.jsx';
import Groups from './pages/Groups.jsx';
import Navbar from './components/Navbar.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  // On component mount, check localStorage for saved user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle logout by clearing localStorage and state
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // If user is not logged in, show login/register routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Handle login and save to localStorage
  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="page">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/transactions" element={<Transactions user={user} />} />
          <Route path="/budgets" element={<Budgets user={user} />} />
          <Route path="/groups" element={<Groups user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
