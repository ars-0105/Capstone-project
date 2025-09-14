import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <strong>💸 Budget Tracker</strong>
      <Link to="/">Dashboard</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/budgets">Budgets</Link>
      <Link to="/groups">Groups</Link>
      <div className="nav-spacer" />
      <span style={{opacity:.9}}>{user?.name} · {user?.currency}</span>
      <button className="button" style={{width:'auto', padding:'8px 12px'}} onClick={onLogout}>Logout</button>
    </nav>
  );
}
