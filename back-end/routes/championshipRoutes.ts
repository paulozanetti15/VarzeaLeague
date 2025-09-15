import express from 'express';
import { createChampionship, listChampionships, getChampionship, updateChampionship, deleteChampionship, joinTeamInChampionship, getChampionshipTeams, leaveTeamFromChampionship } from '../controllers/championshipController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, createChampionship);
// List and get must be public so non-authenticated users can see championships
router.get('/', listChampionships);
router.get('/:id', getChampionship);
router.put('/:id', authenticateToken, updateChampionship);
router.delete('/:id', authenticateToken, deleteChampionship);
router.post('/:id/join-team', authenticateToken, joinTeamInChampionship);
router.get('/:id/join-team', authenticateToken, getChampionshipTeams);
router.delete('/:id/join-team/:teamId', authenticateToken, leaveTeamFromChampionship);

export default router;
