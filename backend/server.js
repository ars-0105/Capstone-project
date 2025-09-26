import express from "express";
import cors from "cors";
import { connectDB, User, Transaction, Budget, Group } from "./db.js";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ connect to MongoDB
connectDB();

// =========== AUTH ===========
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, currency = "INR" } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, email, password, currency });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency || "INR",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========== TRANSACTIONS ===========
app.get("/api/transactions", async (req, res) => {
  try {
    const { userId, from, to, type, category } = req.query;
    let filter = { userId };
    if (type) filter.type = type;
    if (category) filter.category = category;

    let list = await Transaction.find(filter);
    if (from) list = list.filter(t => new Date(t.date) >= new Date(from));
    if (to) list = list.filter(t => new Date(t.date) <= new Date(to));

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const t = { id: uuid(), ...req.body };
    const transaction = await Transaction.create(t);

    const month = t.date?.slice(5, 7) || "";
    const budget = await Budget.findOne({
      userId: t.userId,
      category: t.category,
      month: month
    });

    let warning = null;
    if (t.type === "expense" && budget) {
      const spent = (await Transaction.find({
        userId: t.userId,
        type: "expense",
        category: t.category
      }))
        .filter(tx => tx.date?.slice(5, 7) === month)
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      if (spent > Number(budget.limit)) {
        warning = `Warning: You have exceeded your budget for ${budget.category} (${budget.month})`;
      }
    }

    res.json({ ...transaction.toObject(), warning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/transactions/:id", async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.sendStatus(404);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========== BUDGETS ===========
app.get("/api/budgets", async (req, res) => {
  try {
    const { userId, month } = req.query;
    const filter = { userId };
    if (month) filter.month = month;
    const list = await Budget.find(filter);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/budgets", async (req, res) => {
  try {
    const b = { id: uuid(), ...req.body };
    const budget = await Budget.create(b);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/budgets/:id", async (req, res) => {
  try {
    const updated = await Budget.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/budgets/:id", async (req, res) => {
  try {
    const deleted = await Budget.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.sendStatus(404);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========== GROUPS ===========
app.post("/api/groups", async (req, res) => {
  try {
    const g = {
      id: uuid(),
      name: req.body.name,
      userId: req.body.userId,
      members: (req.body.members || []).map(m => ({
        id: m.id || uuid(),
        name: m.name,
        contribution: Number(m.contribution) || 0
      })),
    };
    const group = await Group.create(g);
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/groups", async (req, res) => {
  try {
    const { userId } = req.query;
    const groups = await Group.find({ userId });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/groups/:id", async (req, res) => {
  try {
    const updated = await Group.findOneAndUpdate(
      { id: req.params.id },
      {
        ...req.body,
        members: (req.body.members || []).map(m => ({
          id: m.id || uuid(),
          name: m.name,
          contribution: Number(m.contribution) || 0
        })),
      },
      { new: true }
    );
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/groups/:id", async (req, res) => {
  try {
    const deleted = await Group.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.sendStatus(404);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/groups/:id/balances", async (req, res) => {
  try {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) return res.sendStatus(404);

    const expenses = await Transaction.find({ groupId: req.params.id, type: "expense" });

    const paidBy = {};
    expenses.forEach(e => {
      paidBy[e.userId] = (paidBy[e.userId] || 0) + Number(e.amount || 0);
    });

    const members = group.members;
    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const totalContribution = members.reduce((sum, m) => sum + m.contribution, 0);

    const balances = members.map(m => {
      const share = totalContribution > 0 ? (m.contribution / totalContribution) * total : total / members.length;
      const paid = paidBy[m.id] || 0;
      return { user: m.name, paid, share, net: paid - share };
    });

    res.json({ total, balances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("✅ API listening on " + PORT));
