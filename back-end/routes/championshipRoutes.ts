import express from 'express';
import multer from 'multer';
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
  publishChampionship,
  uploadChampionshipLogo,
  createChampionshipMatch,
  getChampionshipMatches
} from '../controllers/championshipController';
import { busarPunicaoCampeonato, inserirPunicaoCampeonato, alterarPunicaoCampeonato, deletarPunicaoCampeonato } from '../controllers/PunicaoController';
import { authenticateToken } from '../middleware/auth';
import { uploadChampionship } from '../services/uploadService';

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
router.post('/:id/logo', authenticateToken, (req, res, next) => {
  uploadChampionship.single('logo')(req, res, (err: any) => {
    if (err) {
      console.error('Erro no multer:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Arquivo muito grande. Tamanho máximo: 5MB' });
        }
        return res.status(400).json({ message: `Erro no upload: ${err.message}` });
      }
      return res.status(400).json({ message: err.message || 'Erro ao processar arquivo' });
    }
    next();
  });
}, uploadChampionshipLogo);

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

// Agendamento de partidas
router.post('/:id/matches', authenticateToken, createChampionshipMatch);
router.get('/:id/matches', getChampionshipMatches);

export default router;
