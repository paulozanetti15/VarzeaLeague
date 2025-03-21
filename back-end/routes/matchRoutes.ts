import express from 'express';
import { authenticateToken } from '../middleware/auth';
import MatchModel from '../models/Match';
import MatchParticipantModel from '../models/MatchParticipant';

const router = express.Router();

// Criar uma nova partida
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Recebendo requisição para criar partida:', req.body);
    console.log('Usuário autenticado:', req.user);

    const { title, date, location, maxPlayers, description, price } = req.body;

    if (!title || !date || !location || !maxPlayers) {
      console.log('Campos obrigatórios faltando');
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando',
        required: ['title', 'date', 'location', 'maxPlayers']
      });
    }

    console.log('Criando partida com os dados:', {
      title,
      date: new Date(date),
      location,
      maxPlayers,
      description,
      price,
      organizerId: req.user?.id
    });

    const match = await MatchModel.create({
      title,
      date: new Date(date),
      location,
      maxPlayers: parseInt(maxPlayers),
      description,
      price: price ? parseFloat(price) : null,
      organizerId: req.user?.id,
      status: 'pending'
    });

    console.log('Partida criada com sucesso:', match.toJSON());

    res.status(201).json({
      message: 'Partida criada com sucesso',
      match
    });
  } catch (error) {
    console.error('Erro detalhado ao criar partida:', error);
    res.status(500).json({ 
      message: 'Erro ao criar partida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Listar todas as partidas
router.get('/', async (req, res) => {
  try {
    const matches = await MatchModel.findAll({
      include: [
        { association: 'organizer', attributes: ['id', 'name'] },
        { association: 'participants', include: [{ association: 'User', attributes: ['id', 'name'] }] }
      ]
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar partidas' });
  }
});

// Obter uma partida específica
router.get('/:id', async (req, res) => {
  try {
    const match = await MatchModel.findByPk(req.params.id, {
      include: [
        { association: 'organizer', attributes: ['id', 'name'] },
        { association: 'participants', include: [{ association: 'User', attributes: ['id', 'name'] }] }
      ]
    });
    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar partida' });
  }
});

// Participar de uma partida
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    const alreadyJoined = await MatchParticipantModel.findOne({
      where: {
        matchId: parseInt(req.params.id),
        userId: req.user.id
      }
    });

    if (alreadyJoined) {
      return res.status(400).json({ error: 'Você já está participando desta partida' });
    }

    const participant = await MatchParticipantModel.create({
      matchId: parseInt(req.params.id),
      userId: req.user.id,
      team: req.body.team,
      position: req.body.position
    });

    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao participar da partida' });
  }
});

export default router; 