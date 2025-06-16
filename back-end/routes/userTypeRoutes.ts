import express from 'express';
import UserType from '../models/UserTypeModel';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userTypes = await UserType.findAll();
    res.json(userTypes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos de usuário' });
  }
});

export default router; 