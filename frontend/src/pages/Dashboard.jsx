const currencyMap = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
function currencySymbol(code) {
  return currencyMap[code] || code;
}

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { api } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

function groupByPeriod(transactions, period) {
  const map = new Map();
  transactions.forEach((t) => {
    const d = new Date(t.date || new Date().toISOString().slice(0, 10));
    let key;
    if (period === "daily") key = d.toISOString().slice(0, 10);
    else if (period === "weekly") {
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    } else if (period === "monthly") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else key = `${d.getFullYear()}`;
    if (!map.has(key)) map.set(key, { income: 0, expense: 0, date: key });
    const rec = map.get(key);
    if (t.type === "income") rec.income += Number(t.amount || 0);
    else rec.expense += Number(t.amount || 0);
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export default function Dashboard({ user }) {
  const [period, setPeriod] = useState("monthly");
  const [points, setPoints] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });

  // ✅ Only use user.budget if it’s defined
  const budget = user.budget;

  async function load() {
    const { data } = await api.get("/transactions", { params: { userId: user.id } });
    const grouped = groupByPeriod(data, period);
    setPoints(grouped);
    const income = data
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = data
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    setTotals({ income, expense });
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("transactions-updated", handler);
    return () => window.removeEventListener("transactions-updated", handler);
  }, [period]);

  const labels = points.map((p) => p.date);
  const incomeData = points.map((p) => p.income);
  const expenseData = points.map((p) => p.expense);

  const data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
          g.addColorStop(0, "rgba(34,197,94,0.6)");
          g.addColorStop(1, "rgba(34,197,94,0.05)");
          return g;
        },
        borderColor: "#16a34a",
        tension: 0.4,
        pointRadius: 2,
      },
      {
        label: "Expense",
        data: expenseData,
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
          g.addColorStop(0, "rgba(239,68,68,0.6)");
          g.addColorStop(1, "rgba(239,68,68,0.05)");
          return g;
        },
        borderColor: "#ef4444",
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "top" }, tooltip: { mode: "index" } },
    animation: { duration: 800, easing: "easeOutQuart" },
    scales: {
      x: { ticks: { color: "#e5e7eb" } },
      y: { ticks: { color: "#e5e7eb" }, beginAtZero: true },
    },
  };

  return (
    <div>
      {/* ✅ Budget reminder only if user.budget is set */}
      {budget && totals.expense > budget && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: 12,
            borderRadius: 6,
            background: "#ef4444",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          ⚠️ You’ve crossed your budget limit ({currencySymbol(user.currency)}
          {budget}) — current expense: {currencySymbol(user.currency)}
          {totals.expense.toFixed(2)}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Total Income</h3>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {currencySymbol(user.currency)}
            {totals.income.toFixed(2)}
          </div>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Total Expense</h3>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {currencySymbol(user.currency)}
            {totals.expense.toFixed(2)}
          </div>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Savings</h3>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {currencySymbol(user.currency)}
            {(totals.income - totals.expense).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>Income vs Expense</h3>
          <div>
            {["daily", "weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                className="button"
                style={{
                  marginRight: p !== "yearly" ? 8 : 0,
                  padding: "6px 10px",
                  background: period === p ? "#22c55e" : undefined,
                }}
                onClick={() => setPeriod(p)}
              >
                {p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
