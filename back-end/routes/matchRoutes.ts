import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getMatchPlayers,leaveMatchPlayer,joinMatchByTeam } from '../controllers/MatchPlayerController';
import {getMatch,listMatches,createMatch} from '../controllers/matchController';
const router = express.Router();
// Criar uma nova partida
router.post('/',createMatch,authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  
});

router.get('/',listMatches,authenticateToken, async (req: Request, res: Response): Promise<void> => {
});

router.get('/:id',getMatch,authenticateToken, async (req: Request, res: Response): Promise<void> => {
});

// Endpoint detalhado para jogadores da partida específica
router.get('/:id/players',getMatchPlayers,authenticateToken, async (req: Request, res: Response): Promise<void> => {
});

router.post('/:id/leave',leaveMatchPlayer ,authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
});

// Entrar em uma partida com um time
router.post('/:id/join-team',joinMatchByTeam,authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
});
router.post('/:id/leave-team',leaveMatchPlayer ,authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
});

export default router; 