import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { index, store, update, remove, getById } from '../controllers/UserController';

const router = express.Router();

router.get('/', authenticateToken, index);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, store);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

export default router;