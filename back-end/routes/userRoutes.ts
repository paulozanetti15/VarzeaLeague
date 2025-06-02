import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { index, store, update, remove, getById } from '../controllers/UserController';

const router = express.Router();

// Get all users
router.get('/', index, authenticateToken);

// Get user by ID
router.get('/:id', getById, authenticateToken);

// Create new user
router.post('/', store, authenticateToken);

// Update user
router.put('/:id', update, authenticateToken);

// Delete user
router.delete('/:id', remove, authenticateToken);

export default router;