import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { HistoryController } from '../controllers/history/HistoryController';

const router = express.Router();

router.get('/teams/:teamId/friendly-matches', authenticateToken, HistoryController.getFriendlyMatches);
router.get('/teams/:teamId/championship-matches', authenticateToken, HistoryController.getChampionshipMatches);

router.get('/friendly-matches/:matchId/report', authenticateToken, HistoryController.getFriendlyMatchReport);
router.post('/friendly-matches/report', authenticateToken, HistoryController.createFriendlyMatchReport);
router.put('/friendly-matches/:matchId/report', authenticateToken, HistoryController.updateFriendlyMatchReport);
router.delete('/friendly-matches/:matchId/report', authenticateToken, HistoryController.deleteFriendlyMatchReport);

router.get('/championship-matches/:matchId/report', authenticateToken, HistoryController.getChampionshipMatchReport);
router.put('/championship-matches/:matchId/report', authenticateToken, HistoryController.updateChampionshipMatchReport);
router.delete('/championship-matches/:matchId/report', authenticateToken, HistoryController.deleteChampionshipMatchReport);

export default router;
