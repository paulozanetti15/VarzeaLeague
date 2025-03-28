import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rotas de autenticação
router.post('/register', (req, res) => {
  // TODO: Implementar registro
});

router.post('/login', (req, res) => {
  // TODO: Implementar login
});

// Rotas protegidas
router.get('/profile', authenticateToken, (req, res) => {
  // TODO: Implementar perfil
});

export default router; 