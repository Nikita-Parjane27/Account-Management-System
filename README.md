# FinTrack — Account Management System

A full stack money transfer web application built with React, Node.js, Express, and Supabase.

---

## Features

- Signup and Login with JWT authentication
- ₹10,000 welcome balance on signup
- Send money to any registered user
- Live user search by name or email
- Account statement with credit and debit history
- Protected routes using Context API

---

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Frontend | React 18, React Router v6, Axios   |
| Backend  | Node.js, Express.js                |
| Database | Supabase (PostgreSQL)              |
| Auth     | JWT + bcryptjs                     |

---

## Project Structure
```
FinTrack/
├── frontend/          → React application
│   └── src/
│       ├── pages/     → Signup, Login, Dashboard, SendMoney, Statement
│       ├── components/→ Navbar, ProtectedRoute
│       ├── context/   → AuthContext
│       └── utils/     → api.js (Axios instance)
│
└── backend/           → Node.js API
    ├── controllers/   → authController, accountController
    ├── routes/        → authRoutes, accountRoutes
    ├── middlewares/   → authMiddleware (JWT)
    ├── config/        → supabaseClient
    └── utils/         → generateToken
```

---

## Getting Started

### 1. Supabase Setup
- Create a free project at [supabase.com](https://supabase.com)
- Go to SQL Editor and run this:
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance NUMERIC(12, 2) DEFAULT 10000.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  balance_after NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

- Copy your **Project URL** and **anon key** from Project Settings → API

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside backend folder:
```
PORT=5000
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```
```bash
npm run dev
```

Backend runs on → http://localhost:5000

---

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on → http://localhost:5173

---

## API Routes

| Method | Route                    | Protected | Description        |
|--------|--------------------------|-----------|--------------------|
| POST   | /api/auth/signup         | No        | Register new user  |
| POST   | /api/auth/login          | No        | Login user         |
| GET    | /api/account/balance     | Yes       | Get balance        |
| GET    | /api/account/statement   | Yes       | Get transactions   |
| POST   | /api/account/transfer    | Yes       | Send money         |
| GET    | /api/account/users       | Yes       | Search users       |

---

## Developer

**Nikita**
B.Tech Computer Science & Design
MIT Aurangabad
