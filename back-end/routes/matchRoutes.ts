import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {joinMatchByTeam,getMattchTeams } from '../controllers/MatchPlayerController';
import {getMatch,listMatches,createMatch} from '../controllers/matchController';
const router = express.Router();
// Criar uma nova partida
router.post('/',createMatch,authenticateToken)
router.get('/',listMatches,authenticateToken)
router.get('/:id',getMatch,authenticateToken)
router.post('/:id/join-team',joinMatchByTeam,authenticateToken)
router.get('/:id/join-team',getMattchTeams,authenticateToken)

export default router; 