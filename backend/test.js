import mongoose from "mongoose";

// Import your models and connectDB function
import { connectDB, User } from "./db.js"; // adjust the path if necessary

async function testDB() {
  await connectDB();

  try {
    // Create a new user
    const newUser = new User({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      currency: "USD",
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    console.log("✅ User saved:", savedUser);

    // Retrieve and print all users to confirm
    const users = await User.find();
    console.log("📂 All users:", users);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    mongoose.connection.close(); // close the connection after the test
  }
}

testDB();
