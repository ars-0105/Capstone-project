import React, { useEffect, useState } from 'react';
import { api } from '../api';

const currencyMap = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
function currencySymbol(code) {
  return currencyMap[code] || code;
}

export default function Transactions({ user }) {
  const [list, setList] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: '',
  });

  const categories = [
    "Salary",
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
    const { data: transactions } = await api.get('/transactions', { params: { userId: user.id } });
    setList(transactions.sort((a, b) => new Date(b.date) - new Date(a.date)));

    const { data: budgetData } = await api.get('/budgets', { params: { userId: user.id } });
    setBudgets(budgetData);
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!form.category.trim()) {
      alert("Please select a category");
      return;
    }
    const amount = Number(form.amount || 0);
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    const date = form.date || new Date().toISOString().slice(0, 10);
    const month = date.slice(5, 7);

    if (form.type === 'expense') {
      const budget = budgets.find(b => b.category === form.category && b.month === month);
      if (budget) {
        const totalSpent = list
          .filter(t => t.category === form.category && t.type === 'expense' && t.date.slice(5, 7) === month)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        if (totalSpent + amount > budget.limit) {
          alert(`Warning: Adding this transaction exceeds the budget limit of ₹${budget.limit} for ${form.category}.`);
          return;
        }
      }
    }

    const body = {
      ...form,
      amount,
      userId: user.id,
      date,
    };
    await api.post('/transactions', body);
    window.dispatchEvent(new CustomEvent('transactions-updated'));
    setForm({ amount: '', type: 'expense', category: '', date: '' });
    load();
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    load();
  }

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* Add Transaction Panel */}
      <div className="panel" style={{ width: '380px', minWidth: '350px' }}>
        <h2 style={{ marginTop: 0 }}>Add Transaction</h2>
        <form onSubmit={add} style={{ display: 'grid', gap: 10 }}>
          <input
            className="input"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <button className="button">Add</button>
        </form>
      </div>

      {/* Your Transactions Panel */}
      <div className="panel" style={{ width: '500px', minWidth: '400px', overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0 }}>Your Transactions</h2>
        {list.length === 0 && <p>No transactions yet.</p>}
        <ul className="list" style={{ padding: 0 }}>
          {list.map((t) => (
            <li
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderBottom: '1px solid #444',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
                <div style={{ fontWeight: 600 }}>{t.category || 'Uncategorized'}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{t.date}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '120px' }}>
                <div style={{
                  fontWeight: 600,
                  color: t.type === 'income' ? '#22c55e' : '#ef4444',
                  wordBreak: 'break-word'
                }}>
                  {t.type === 'income' ? '+' : '-'}
                  {currencySymbol(user.currency)}
                  {Number(t.amount).toFixed(2)}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
