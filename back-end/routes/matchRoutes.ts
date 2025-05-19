import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {joinMatchByTeam,getMatchTeams, deleteTeamMatch,getTeamsAvailable} from '../controllers/MatchTeamsController';
import { createMatch, listMatches, getMatch } from '../controllers/matchController';

const router = express.Router();
router.get('/available', getTeamsAvailable, authenticateToken); // <-- Coloque antes das rotas com :id
router.post('/', createMatch, authenticateToken);
router.get('/', listMatches, authenticateToken);
router.get('/:id', getMatch, authenticateToken);
router.post('/:id/join-team', joinMatchByTeam, authenticateToken);
router.get('/:id/join-team', getMatchTeams, authenticateToken);
router.delete('/:id/join-team/:teamId', deleteTeamMatch, authenticateToken);


export default router; 