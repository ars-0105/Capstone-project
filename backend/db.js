import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://aadityaraj1473_db_user:Aadi1234@budgettracker.lqytqaf.mongodb.net/budgettracker?retryWrites=true&w=majority&appName=BudgetTracker"
    );
    console.log("✅ MongoDB connected");
    console.log("Connected to DB:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

// --- Schemas ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  currency: { type: String, default: "INR" },
});

const transactionSchema = new mongoose.Schema({
  id: String,
  userId: String,
  type: String,
  amount: Number,
  date: String,
  category: String,
  groupId: String,
});

const budgetSchema = new mongoose.Schema({
  id: String,
  userId: String,
  category: String,
  month: String,
  limit: Number,
});

const groupSchema = new mongoose.Schema({
  id: String,
  userId: String, // Groups now linked to a specific user
  name: String,
  members: [
    {
      id: String,
      name: String,
      contribution: Number,
    },
  ],
});

// --- Models ---
export const User = mongoose.model("User", userSchema);
export const Transaction = mongoose.model("Transaction", transactionSchema);
export const Budget = mongoose.model("Budget", budgetSchema);
export const Group = mongoose.model("Group", groupSchema);
