import { getPendingSummaryMatch } from '../controllers/matchController';
router.get('/pending-summary', authenticateToken, getPendingSummaryMatch);
import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {joinMatchByTeam,getMatchTeams, deleteTeamMatch,getTeamsAvailable, checkTeamsRuleCompliance} from '../controllers/MatchTeamsController';
import { createMatch, listMatches, getMatch, deleteMatch, updateMatch, finalizeReport } from '../controllers/matchController';

const router = express.Router();

// Aplicando middleware de autenticação antes dos controllers
router.get('/:id/available', authenticateToken, getTeamsAvailable);
router.post('/', authenticateToken, createMatch);
// Public read routes so listings and details are accessible to anonymous users
router.get('/', listMatches);
router.get('/:id', getMatch);
router.put('/:id', authenticateToken, updateMatch);
router.delete('/:id', authenticateToken, deleteMatch);
router.post('/:id/join-team', authenticateToken, joinMatchByTeam);
router.get('/:id/join-team', authenticateToken, getMatchTeams);
router.delete('/:id/join-team/:teamId', authenticateToken, deleteTeamMatch);

router.post('/:id/finalize-report', authenticateToken, finalizeReport);
router.get('/:id/check-teams-rule-compliance', authenticateToken, checkTeamsRuleCompliance);

export default router; 