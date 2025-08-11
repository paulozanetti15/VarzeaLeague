import express from 'express';
import { createChampionship, listChampionships, getChampionship, updateChampionship, deleteChampionship, joinTeamInChampionship } from '../controllers/championshipController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, createChampionship);
router.get('/', authenticateToken, listChampionships);
router.get('/:id', authenticateToken, getChampionship);
router.put('/:id', authenticateToken, updateChampionship);
router.delete('/:id', authenticateToken, deleteChampionship);
router.post('/:id/join-team', authenticateToken, joinTeamInChampionship);

export default router;
