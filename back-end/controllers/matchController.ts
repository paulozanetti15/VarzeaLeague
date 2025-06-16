import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/MatchModel';
import Rules from '../models/RulesModel';
import User from '../models/UserModel';

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, date, location, description, price, rules } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    // Validar se as regras foram enviadas
    if (!rules) {
      res.status(400).json({ message: 'As regras da partida são obrigatórias' });
      return;
    }

    // Validar campos obrigatórios das regras
    if (rules.idade_minima === undefined || rules.idade_maxima === undefined) {
      res.status(400).json({ message: 'Idade mínima e máxima são obrigatórias' });
      return;
    }

    // Criar a partida
    const match = await Match.create({
      title,
      date,
      location,
      description,
      price,
      status: 'open',
      organizerId: userId
    });

    // Criar as regras associadas
    await Rules.create({
      partidaId: match.id,
      idade_minima: rules.idade_minima,
      idade_maxima: rules.idade_maxima,
      sexo: rules.sexo || null // sexo pode ser opcional
    });

    res.status(201).json({
      message: 'Partida criada com sucesso',
      match
    });

  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ message: 'Erro ao criar partida' });
  }
};

export const listMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await Match.findAll({
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).json(matches);

  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
};

export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await Match.findByPk(id, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['id', 'name']
      }]
    });

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    const rules = await Rules.findOne({
      where: { partidaId: id }
    });

    res.status(200).json({
      ...match.toJSON(),
      rules
    });

  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    res.status(500).json({ message: 'Erro ao buscar partida' });
  }
};

export const updateMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const match = await Match.findByPk(id);

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (match.organizerId !== userId) {
      res.status(403).json({ message: 'Apenas o organizador pode atualizar a partida' });
      return;
    }

    await match.update(updates);

    if (updates.rules) {
      await Rules.update(updates.rules, {
        where: { partidaId: id }
      });
    }

    res.status(200).json({
      message: 'Partida atualizada com sucesso',
      match
    });

  } catch (error) {
    console.error('Erro ao atualizar partida:', error);
    res.status(500).json({ message: 'Erro ao atualizar partida' });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const match = await Match.findByPk(id);

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (match.organizerId !== userId) {
      res.status(403).json({ message: 'Apenas o organizador pode deletar a partida' });
      return;
    }

    await Rules.destroy({
      where: { partidaId: id }
    });

    await match.destroy();

    res.status(200).json({ message: 'Partida deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar partida:', error);
    res.status(500).json({ message: 'Erro ao deletar partida' });
  }
}; 
