import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  insertRules,
  getAllRules,
  getRuleById,
  deleteRules,
  updateRules
} from '../controllers/FriendlyMatchesRulesController';

const router = express.Router();

router.post('/', authenticateToken, insertRules);
router.get('/:id', authenticateToken, getRuleById);
router.delete('/:id', authenticateToken, deleteRules);
router.put('/:id', authenticateToken, updateRules);
router.get('/ultimapartida', authenticateToken, getAllRules);

export default router;