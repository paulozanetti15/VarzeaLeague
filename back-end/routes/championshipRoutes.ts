import express from 'express';
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
import { busarPunicaoCampeonato, inserirPunicaoCampeonato, alterarPunicaoCampeonato, deletarPunicaoCampeonato } from '../controllers/PunicaoController';
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

// Aplicações de campeonatos
router.post('/:championshipId/apply', authenticateToken, applyToChampionship);
router.get('/:championshipId/applications', authenticateToken, getChampionshipApplications);
router.put('/applications/:applicationId/status', authenticateToken, updateApplicationStatus);
router.put('/:championshipId/publish', authenticateToken, publishChampionship);

// Punição em Campeonato (WO etc.)
router.get('/:idCampeonato/punicao', authenticateToken, busarPunicaoCampeonato);
router.post('/:idCampeonato/punicao', authenticateToken, inserirPunicaoCampeonato);
router.put('/:idCampeonato/punicao', authenticateToken, alterarPunicaoCampeonato);
router.delete('/:idCampeonato/punicao', authenticateToken, deletarPunicaoCampeonato);

export default router;
