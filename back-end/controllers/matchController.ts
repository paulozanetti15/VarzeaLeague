import { Request, Response } from 'express';
import MatchModel from '../models/Match';
import UserModel from '../models/User';

// Criar uma nova partida
export const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, date, location, maxPlayers, description, price } = req.body;
    const organizerId = req.user?.id;

    if (!organizerId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const match = await MatchModel.create({
      title,
      date,
      location,
      maxPlayers,
      description,
      price,
      organizerId
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ message: 'Erro ao criar partida' });
  }
};

// Listar todas as partidas
export const listMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await MatchModel.findAll({
      include: [{
        model: UserModel,
        as: 'organizer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['date', 'ASC']]
    });

    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
};

// Obter detalhes de uma partida específica
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    res.json(match);
  } catch (error) {
    console.error('Erro ao obter partida:', error);
    res.status(500).json({ message: 'Erro ao obter partida' });
  }
};

// Atualizar uma partida
export const updateMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    await match.update(req.body);
    res.json(match);
  } catch (error) {
    console.error('Erro ao atualizar partida:', error);
    res.status(500).json({ message: 'Erro ao atualizar partida' });
  }
};

// Cancelar uma partida
export const cancelMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    await match.update({ status: 'cancelled' });
    res.json({ message: 'Partida cancelada' });
  } catch (error) {
    console.error('Erro ao cancelar partida:', error);
    res.status(500).json({ message: 'Erro ao cancelar partida' });
  }
}; 