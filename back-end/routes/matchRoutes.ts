import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
 
import { Model, Op } from 'sequelize';

const router = express.Router();
// Criar uma nova partida
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
});

// Endpoint detalhado para jogadores da partida específica
router.get('/:id/players', async (req: Request, res: Response): Promise<void> => {
 
    
});

// Entrar em uma partida
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Tentando entrar na partida:', req.params.id);
    const match = await Match.findByPk(req.params.id);
    const userId = req.user?.id;

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (match.status !== 'open') {
      res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
      return;
    }

    const playerCount = await match.countPlayers();
    if (playerCount >= match.maxPlayers) {
      res.status(400).json({ message: 'Esta partida já está cheia' });
      return;
    }

    await match.addPlayer(userId);
    console.log('Usuário', userId, 'entrou na partida', match.id);
    res.json({ message: 'Inscrição realizada com sucesso' });
  } catch (error) {
    console.error('Erro ao entrar na partida:', error);
    res.status(500).json({ message: 'Erro ao entrar na partida' });
  }
});

// Sair de uma partida
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
   
});

// Entrar em uma partida com um time
router.post('/:id/join-team', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
});


export default router; 