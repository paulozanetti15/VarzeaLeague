import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import MatchModel from '../models/Match';
import UserModel from '../models/User';
import { Model } from 'sequelize';

interface MatchInstance extends Model {
  status: string;
  maxPlayers: number;
  addPlayer: (userId: number) => Promise<void>;
  countPlayers: () => Promise<number>;
}

const router = express.Router();

// Criar uma nova partida
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, date, location, maxPlayers, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const match = await MatchModel.create({
      title,
      description,
      date,
      location,
      maxPlayers,
      price,
      organizerId: userId,
      status: 'open'
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ message: 'Erro ao criar partida' });
  }
});

// Listar todas as partidas
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await MatchModel.findAll({
      include: [
        { model: UserModel, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: UserModel, as: 'players', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
});

// Buscar uma partida específica
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id, {
      include: [
        { model: UserModel, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: UserModel, as: 'players', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    res.json(match);
  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    res.status(500).json({ message: 'Erro ao buscar partida' });
  }
});

// Entrar em uma partida
router.post('/:id/join', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id) as MatchInstance;
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
      res.status(400).json({ message: 'Partida já está cheia' });
      return;
    }

    await match.addPlayer(userId);
    res.json({ message: 'Inscrição realizada com sucesso' });
  } catch (error) {
    console.error('Erro ao entrar na partida:', error);
    res.status(500).json({ message: 'Erro ao entrar na partida' });
  }
});

export default router; 