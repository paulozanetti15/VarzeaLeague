import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/FriendlyMatchesModel';
import MatchGoal from '../models/FriendlyMatchGoalModel';
import MatchCard from '../models/FriendlyMatchCardModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';

export const finalizeMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ message: 'Usuário não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const user = await User.findByPk(userId);
    const isAdmin = (user as any)?.userTypeId === 1;
    if (match.organizerId !== userId && !isAdmin) { res.status(403).json({ message: 'Você não tem permissão para finalizar esta partida' }); return; }
    if (match.status === 'finalizada') { res.status(400).json({ message: 'Esta partida já foi finalizada' }); return; }
    await match.update({ status: 'finalizada' });
    res.status(200).json({ message: 'Partida finalizada com sucesso', match });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao finalizar partida' });
  }
};

export const addGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { playerId, userId, email, minute } = req.body as { playerId?: number; userId?: number; email?: string; minute?: number };
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    
    if (match.organizerId !== req.user.id && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para registrar eventos nesta partida' });
      return;
    }
    
    let resolvedUserId: number | null = null;
    let resolvedPlayerId: number | null = null;
    
    if (playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) {
        res.status(404).json({ message: 'Jogador não encontrado' });
        return;
      }
      resolvedPlayerId = playerId;
    } else if (userId) {
      resolvedUserId = userId;
    } else if (email) {
      const userByEmail = await User.findOne({ where: { email } });
      if (!userByEmail) {
        res.status(404).json({ message: 'Usuário com este e-mail não encontrado' });
        return;
      }
      resolvedUserId = (userByEmail as any).id;
    }
    
    const goal = await MatchGoal.create({
      match_id: matchId,
      user_id: resolvedUserId,
      player_id: resolvedPlayerId,
      minute: minute || 0
    });
    
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar gol' });
  }
};

export const addCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { playerId, userId, email, cardType, minute } = req.body as {
      playerId?: number;
      userId?: number;
      email?: string;
      cardType: 'yellow' | 'red';
      minute?: number;
    };
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    if (!['yellow', 'red'].includes(cardType)) {
      res.status(400).json({ message: 'Tipo de cartão inválido. Use "yellow" ou "red"' });
      return;
    }
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    
    if (match.organizerId !== req.user.id && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para registrar eventos nesta partida' });
      return;
    }
    
    let resolvedUserId: number | null = null;
    let resolvedPlayerId: number | null = null;
    
    if (playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) {
        res.status(404).json({ message: 'Jogador não encontrado' });
        return;
      }
      resolvedPlayerId = playerId;
    } else if (userId) {
      resolvedUserId = userId;
    } else if (email) {
      const userByEmail = await User.findOne({ where: { email } });
      if (!userByEmail) {
        res.status(404).json({ message: 'Usuário com este e-mail não encontrado' });
        return;
      }
      resolvedUserId = (userByEmail as any).id;
    }
    
    const card = await MatchCard.create({
      match_id: matchId,
      user_id: resolvedUserId,
      player_id: resolvedPlayerId,
      card_type: cardType,
      minute
    });
    
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registrar cartão' });
  }
};

export const listEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    
    const goals = await MatchGoal.findAll({
      where: { match_id: matchId },
      order: [['id', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Player, as: 'player', attributes: ['id', 'nome'] }
      ]
    });
    
    const cards = await MatchCard.findAll({
      where: { match_id: matchId },
      order: [['id', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Player, as: 'player', attributes: ['id', 'nome'] }
      ]
    });

    res.status(200).json({ goals, cards });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar eventos' });
  }
};

export const deleteGoalEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const goalId = Number(req.params.goalId);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    
    if (match.organizerId !== req.user.id && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para remover eventos desta partida' });
      return;
    }
    
    const goal = await MatchGoal.findOne({ where: { id: goalId, match_id: matchId } });
    if (!goal) {
      res.status(404).json({ message: 'Gol não encontrado' });
      return;
    }
    
    await goal.destroy();
    res.status(200).json({ message: 'Gol removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover gol' });
  }
};

export const deleteCardEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const cardId = Number(req.params.cardId);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    
    if (match.organizerId !== req.user.id && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para remover eventos desta partida' });
      return;
    }
    
    const card = await MatchCard.findOne({ where: { id: cardId, match_id: matchId } });
    if (!card) {
      res.status(404).json({ message: 'Cartão não encontrado' });
      return;
    }
    
    await card.destroy();
    res.status(200).json({ message: 'Cartão removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover cartão' });
  }
};

export const clearGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    
    if (match.organizerId !== req.user.id && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para limpar eventos desta partida' });
      return;
    }
    
    await MatchGoal.destroy({ where: { match_id: matchId } });
    res.status(200).json({ message: 'Todos os gols foram removidos com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao limpar gols' });
  }
};

export const clearCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await Match.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    
    if (match.organizerId !== req.user.id && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para limpar eventos desta partida' });
      return;
    }
    
    await MatchCard.destroy({ where: { match_id: matchId } });
    res.status(200).json({ message: 'Todos os cartões foram removidos com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao limpar cartões' });
  }
};
