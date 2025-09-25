import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {joinMatchByTeam,getMatchTeams, deleteTeamMatch,getTeamsAvailable, checkTeamsRuleCompliance} from '../controllers/MatchTeamsController';
import { createMatch, listMatches, getMatch, deleteMatch, updateMatch } from '../controllers/matchController';

const router = express.Router();

router.get('/:id/available', authenticateToken, getTeamsAvailable);
router.post('/', authenticateToken, createMatch);

router.get('/', listMatches);
router.get('/:id', getMatch);
router.put('/:id', authenticateToken, updateMatch);
router.post('/:id/join-team', authenticateToken, joinMatchByTeam);
router.get('/:id/join-team', authenticateToken, getMatchTeams);
router.delete('/:id/join-team/:teamId', authenticateToken, deleteTeamMatch);

router.get('/:id/check-teams-rule-compliance', authenticateToken, checkTeamsRuleCompliance);

export default router; 