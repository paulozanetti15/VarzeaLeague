import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { index, store, update, remove, getById } from '../controllers/UserController';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, index);

// Get user by ID
router.get('/:id', authenticateToken, getById);

// Create new user
router.post('/', authenticateToken, store);

// Update user
router.put('/:id', authenticateToken, update);

// Delete user
router.delete('/:id', authenticateToken, remove);

export default router;