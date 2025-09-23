
# 📊 Personal Budget Tracker

Welcome! 🎉 This is your all-in-one **Personal Budget Tracker** app that helps you manage your finances easily. Whether you want to track income, expenses, budgets, or group contributions, this app has got you covered with a simple and intuitive interface powered by modern technologies like **Node.js**, **Express**, **React**, and **MongoDB**.

---

## 🚀 Features You'll Love

✔ Track your income and expenses by category  
✔ Set and manage budgets for each category  
✔ Create groups, manage members, and track contributions  
✔ Edit or delete transactions effortlessly  
✔ Real-time validations to keep your spending in check  
✔ Responsive UI that works beautifully on all devices  

---

## 📂 Project Structure at a Glance
```
personal-budget-tracker/
├── backend/         # Server-side code (Node.js + Express)
│ ├── server.js      # Main backend server file
│ ├── db.js          # MongoDB connection configuration
│ ├── data.json      # Local sample or data file
│ ├── package.json   # Backend dependencies and scripts
│ └── ...            # Other backend-related files and folders
├── frontend/        # Client-side code (React + Vite)
│ ├── index.html     # Main HTML template
│ ├── vite.config.js # Vite configuration
│ ├── package.json   # Frontend dependencies and scripts
│ ├── src/           # React source code files
│ └── ...            # Other frontend-related files and folders
└── README.md        # Project setup, instructions, and documentation

```
---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js, MongoDB  
- **Frontend:** React, Vite  
- **Styling:** CSS  
- **Package Management:** npm  

---

## 📥 Getting Started (Setup Guide)

### ✅ Prerequisites

Before we begin, make sure you have:

- [Node.js](https://nodejs.org/) installed  
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)  
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB setup  

---

### 🔧 Step 1 – Clone the Repository

```bash
git clone <your-repository-url>
cd personal-budget-tracker
```

---

### 🔧 Step 2 – Set up the Backend

1. Move to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your MongoDB connection:

   - Open `db.js`
   - Replace the connection string with your MongoDB URI:

   ```javascript
   const uri = "mongodb+srv://<username>:<password>@cluster.mongodb.net/<your-database>?retryWrites=true&w=majority";
   ```

4. Start the server:

   ```bash
   node server.js
   ```

   The backend will now be running on **http://localhost:5000**.

---

### 🔧 Step 3 – Set up the Frontend

1. Open a new terminal window and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

4. Open the link in your browser which will be shown in terminal use ctrl key to follow the link while clicking

---

## 🔗 How It Works

The frontend connects seamlessly with the backend through API requests. Once you've set up your database, you can start adding transactions, creating groups, managing members, and tracking budgets — all with instant feedback and validations.

---

## 📦 Available Commands

| Command             | Directory | What it does                  |
|-------------------|-----------|------------------------------|
| `npm install`     | backend   | Install server dependencies  |
| `node server.js`  | backend   | Run the backend server      |
| `npm install`     | frontend  | Install client dependencies  |
| `npm run dev`     | frontend  | Run the development server   |

---

Thank you for using the **Personal Budget Tracker**! 💖 Let's make managing finances simple and stress-free! 📈✨
