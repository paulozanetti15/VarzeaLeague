import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as matchController from '../controllers/matchController';
import * as matchTeamsController from '../controllers/MatchTeamsController';

const router = express.Router();
router.get('/', authenticateToken, matchController.listMatches);
router.post('/', authenticateToken, matchController.createMatch);
router.get('/:id', authenticateToken, matchController.getMatch);
router.put('/:id', authenticateToken, matchController.updateMatch);
router.delete('/:id', authenticateToken, matchController.deleteMatch);
router.post('/:matchId/teams', authenticateToken, matchTeamsController.linkTeamToMatch);
router.delete('/:matchId/teams', authenticateToken, matchTeamsController.unlinkTeamFromMatch);
router.get('/:matchId/teams', authenticateToken, matchTeamsController.getMatchTeams);
router.get('/:matchId/team-players', authenticateToken, matchTeamsController.getTeamPlayers);

export default router; 