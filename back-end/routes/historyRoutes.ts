import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  buscarPartidasAmistosas,
  buscarPartidasCampeonato,
  adicionarSumulaPartidasAmistosas,
  buscarSumulaPartidaAmistosa,
  buscarSumulaPartidaCampeonato,
  deletarSumulaPartidaAmistosa,
  deletarSumulaPartidaCampeonato,
  atualizarSumulaPartidaAmistosa,
  atualizarSumulaPartidaCampeonato
} from '../controllers/historyController';

const router = express.Router();

router.get('/teams/:teamId/friendly-matches', authenticateToken, buscarPartidasAmistosas);
router.get('/teams/:teamId/championship-matches', authenticateToken, buscarPartidasCampeonato);

router.get('/friendly-matches/:matchId/report', authenticateToken, buscarSumulaPartidaAmistosa);
router.post('/friendly-matches/report', authenticateToken, adicionarSumulaPartidasAmistosas);
router.put('/friendly-matches/:matchId/report', authenticateToken, atualizarSumulaPartidaAmistosa);
router.delete('/friendly-matches/:matchId/report', authenticateToken, deletarSumulaPartidaAmistosa);

router.get('/championship-matches/:matchId/report', authenticateToken, buscarSumulaPartidaCampeonato);
router.put('/championship-matches/:matchId/report', authenticateToken, atualizarSumulaPartidaCampeonato);
router.delete('/championship-matches/:matchId/report', authenticateToken, deletarSumulaPartidaCampeonato);

export default router;
