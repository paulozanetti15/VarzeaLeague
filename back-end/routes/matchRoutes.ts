import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Match from '../models/Match';
import User from '../models/User';

const router = express.Router();

// Criar uma nova partida
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, location, maxPlayers, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const match = await Match.create({
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
    const matches = await Match.findAll({
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'players', attributes: ['id', 'name', 'email'] }
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
    const match = await Match.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'players', attributes: ['id', 'name', 'email'] }
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
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
    res.json({ message: 'Inscrição realizada com sucesso' });
  } catch (error) {
    console.error('Erro ao entrar na partida:', error);
    res.status(500).json({ message: 'Erro ao entrar na partida' });
  }
});

export default router; 