import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getPlayerRanking } from '../controllers/playerRankingController';

const router = express.Router();

router.get('/players', authenticateToken, getPlayerRanking);

export default router;
