import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createChampionship, 
  listChampionships, 
  getChampionship, 
  updateChampionship, 
  deleteChampionship, 
  joinTeamInChampionship, 
  getChampionshipTeams, 
  leaveTeamFromChampionship,
  applyToChampionship,
  getChampionshipApplications,
  updateApplicationStatus,
  publishChampionship
} from '../controllers/championshipController';
import {
  inserirPunicaoCampeonato,
  buscarPunicaoCampeonato,
  alterarPunicaoCampeonato,
  deletarPunicaoCampeonato
} from '../controllers/ChampionshipPunishmentController';

const router = express.Router();

router.post('/', authenticateToken, createChampionship);
router.get('/', listChampionships);
router.get('/:id', getChampionship);
router.put('/:id', authenticateToken, updateChampionship);
router.delete('/:id', authenticateToken, deleteChampionship);
router.put('/:id/publish', authenticateToken, publishChampionship);

router.post('/:id/teams', authenticateToken, joinTeamInChampionship);
router.get('/:id/teams', authenticateToken, getChampionshipTeams);
router.delete('/:id/teams/:teamId', authenticateToken, leaveTeamFromChampionship);

router.post('/:id/applications', authenticateToken, applyToChampionship);
router.get('/:id/applications', authenticateToken, getChampionshipApplications);
router.put('/:id/applications/:applicationId/status', authenticateToken, updateApplicationStatus);

router.get('/:id/penalty', authenticateToken, buscarPunicaoCampeonato);
router.post('/:id/penalty', authenticateToken, inserirPunicaoCampeonato);
router.put('/:id/penalty', authenticateToken, alterarPunicaoCampeonato);
router.delete('/:id/penalty', authenticateToken, deletarPunicaoCampeonato);

export default router;
