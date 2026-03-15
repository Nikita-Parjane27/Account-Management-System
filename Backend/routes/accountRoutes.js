import express from 'express';
import { getBalance, getStatement, transfer, getUsers } from '../controllers/accountController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/statement', protect, getStatement);
router.post('/transfer', protect, transfer);
router.get('/users', protect, getUsers);

export default router;