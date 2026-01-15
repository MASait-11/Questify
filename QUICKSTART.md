# Questify  - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- PostgreSQL v12+ ([Download](https://www.postgresql.org/download/))
- npm or yarn package manager

---

## 📋 Step 1: Database Setup

### 1.1 Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE goal_tracker;

# Exit
\q
```

### 1.2 Import Schema
```bash
# From the project root directory
cd backend
psql -U postgres -d goal_tracker -f db/schema.sql

# Verify tables created
psql -U postgres -d goal_tracker
\dt
```

---

## 🔧 Step 2: Backend Configuration

### 2.1 Install Dependencies
```bash
cd backend
npm install
```

### 2.2 Create and Configure .env
```bash
# Create .env file
touch .env
```

Edit `.env` with your values:
```
PORT=3000
DATABASE_USER=postgres
DATABASE_HOST=localhost
DATABASE_NAME=goal_tracker
DATABASE_PASSWORD=your_database_password
DATABASE_PORT=5432
SESSION_SECRET=your-super-secret-key-change-this
GEMINI_API_KEY=AIzaSyAJ3O5pclhPJirSysWHZUqvsQZk3cchxOM
```

**Note**: Get GEMINI_API_KEY from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2.3 Start Backend Server
```bash
# From backend directory
npm start

# Or use development mode with auto-reload
npm run dev
```

✅ Backend running at: **http://localhost:3000**

---

## 💻 Step 3: Frontend Configuration

### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

### 3.2 Start Frontend Server
```bash
# From frontend directory
npm start

# Browser will open automatically at http://localhost:3001
```

✅ Frontend running at: **http://localhost:3001**

---

## 🧪 Step 4: Test the Application

### 4.1 Create Account
1. Go to http://localhost:3001
2. Click "Register"
3. Enter username, email, password
4. Click "Register"

### 4.2 Login
1. Enter email and password
2. Click "Login"
3. Redirected to Dashboard

### 4.3 Create Goal
1. Navigate to "Goals"
2. Fill in goal details:
   - Title: "Morning Jog"
   - Category: "Health"
   - Frequency: "Daily"
   - Deadline: Choose a date
3. Click "Create Goal"

### 4.4 Complete Task
1. On Goals page, click "Complete" button
2. View updated progress bar
3. Check streak and points update on Dashboard

### 4.5 Add Friend
1. Navigate to "Friends"
2. Enter friend's username or email
3. Click "Add Friend"

### 4.6 View Leaderboard
1. Navigate to "Leaderboard"
2. See current month rankings
3. Switch to "History" for past months

---

**Happy Goal Tracking! 🎯**
