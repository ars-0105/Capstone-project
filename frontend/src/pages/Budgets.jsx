import React, { useEffect, useState } from 'react';
import { api } from '../api';
const currencyMap = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
function currencySymbol(code) {
  return currencyMap[code] || code;
}

export default function Budgets({ user }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ category: '', month: '', limit: '' });

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const categories = [
    "Car",
    "Household",
    "Shopping",
    "Miscellaneous",
    "Food",
    "Travel",
    "Health",
    "Education"
  ];

  async function load() {
    const { data } = await api.get('/budgets', { params: { userId: user.id } });
    setList(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    await api.delete(`/budgets/${id}`);
    await load();
  }

  async function add(e) {
    e.preventDefault();
    if (!form.category.trim()) {
      alert("Please select a category");
      return;
    }
    await api.post('/budgets', {
      ...form,
      userId: user.id,
      limit: Number(form.limit || 0)
    });
    setForm({ category: '', month: '', limit: '' });
    await load();
  }

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {/* Set Budget Panel */}
      <div className="panel" style={{ width: '100%' }}>
        <h2 style={{ marginTop: 0 }}>Set Budget</h2>
        <form onSubmit={add} style={{ display: 'grid', gap: 10 }}>
          <select
            className="input"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            className="input"
            value={form.month}
            onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Limit"
            value={form.limit}
            onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
          />
          <button className="button">Add</button>
        </form>
      </div>

      {/* Budgets Panel */}
      <div className="panel" style={{ width: '100%' }}>
        <h2 style={{ marginTop: 0 }}>Budgets</h2>
        {list.length === 0 ? (
          <p style={{ color: '#fcf3f3ff', textAlign: 'center' }}>No budgets yet.</p>
        ) : (
          <ul className="list">
            {list.map(b => {
              const monthLabel = months.find(m => m.value === b.month)?.label || b.month;
              return (
                <li key={b.id} style={{ padding: '8px 0', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ paddingLeft: '10px' }}>
                    <div><strong>Category:</strong> {b.category || "N/A"}</div>
                    <div><strong>Month:</strong> {monthLabel}</div>
                    <div><strong>Limit:</strong> {currencySymbol(user.currency)} {b.limit}</div>
                  </div>
                  <button
                    className="icon-delete"
                    style={{ color: "red", border: "none", background: "transparent", cursor: "pointer", fontSize: "16px" }}
                    onClick={() => remove(b.id)}
                    title="Delete"
                  >
                    ✖
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
