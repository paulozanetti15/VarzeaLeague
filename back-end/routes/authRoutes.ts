import express, { Request, Response } from 'express';
import { register, login } from './../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Rota para verificar se o token é válido
router.get('/verify', authenticateToken, (req: Request, res: Response) => {
  res.json({ valid: true });
});

export default router;
