import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import protect from './middlewares/authMiddleware.js';
import { getUsers } from './controllers/accountController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.get('/api/users', protect, getUsers);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'FinTrack API is running ' });
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});