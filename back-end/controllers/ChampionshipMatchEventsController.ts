import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchChampionship from '../models/MatchChampionshipModel';
import MatchGoal from '../models/ChampionshipMatchGoalModel';
import MatchCard from '../models/ChampionshipMatchCardModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';
import Championship from '../models/ChampionshipModel';

export const listEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
    
    if (isNaN(matchId) || !matchId) {
      res.status(400).json({ message: 'ID da partida inválido' });
      return;
    }
    
    const goals = await MatchGoal.findAll({
      where: { match_id: matchId },
      order: [['id', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Player, as: 'player', attributes: ['id', 'name'] }
      ]
    });
    
    const cards = await MatchCard.findAll({
      where: { match_id: matchId },
      order: [['id', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Player, as: 'player', attributes: ['id', 'name'] }
      ]
    });

    res.status(200).json({ goals, cards });
  } catch (err) {
    console.error('Error in listEvents (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao listar eventos',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const addGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
    const { playerId, userId, email, minute } = req.body as { playerId?: number; userId?: number; email?: string; minute?: number };
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    if (isNaN(matchId) || !matchId) {
      res.status(400).json({ message: 'ID da partida inválido' });
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
    
    if (resolvedPlayerId) {
      const existingGoal = await MatchGoal.findOne({
        where: {
          match_id: matchId,
          player_id: resolvedPlayerId,
          minute: minute || 0
        }
      });
      
      if (existingGoal) {
        res.status(409).json({ message: 'Já existe um gol registrado para este jogador neste minuto' });
        return;
      }
    }
    
    if (resolvedUserId) {
      const existingGoal = await MatchGoal.findOne({
        where: {
          match_id: matchId,
          user_id: resolvedUserId,
          minute: minute || 0
        }
      });
      
      if (existingGoal) {
        res.status(409).json({ message: 'Já existe um gol registrado para este usuário neste minuto' });
        return;
      }
    }
    
    const goal = await MatchGoal.create({
      match_id: matchId,
      user_id: resolvedUserId,
      player_id: resolvedPlayerId,
      minute: minute || 0
    });
    
    res.status(201).json(goal);
  } catch (err) {
    console.error('Error in addGoal (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao registrar gol',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const addCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
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
    
    if (isNaN(matchId) || !matchId) {
      res.status(400).json({ message: 'ID da partida inválido' });
      return;
    }
    
    if (!['yellow', 'red'].includes(cardType)) {
      res.status(400).json({ message: 'Tipo de cartão inválido. Use "yellow" ou "red"' });
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
    
    if (resolvedPlayerId) {
      const existingCard = await MatchCard.findOne({
        where: {
          match_id: matchId,
          player_id: resolvedPlayerId,
          card_type: cardType,
          minute: minute || 0
        }
      });
      
      if (existingCard) {
        res.status(409).json({ message: 'Já existe um cartão deste tipo registrado para este jogador neste minuto' });
        return;
      }
    }
    
    if (resolvedUserId) {
      const existingCard = await MatchCard.findOne({
        where: {
          match_id: matchId,
          user_id: resolvedUserId,
          card_type: cardType,
          minute: minute || 0
        }
      });
      
      if (existingCard) {
        res.status(409).json({ message: 'Já existe um cartão deste tipo registrado para este usuário neste minuto' });
        return;
      }
    }
    
    const card = await MatchCard.create({
      match_id: matchId,
      user_id: resolvedUserId,
      player_id: resolvedPlayerId,
      card_type: cardType,
      minute: minute || 0
    });
    
    res.status(201).json(card);
  } catch (err) {
    console.error('Error in addCard (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao registrar cartão',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const deleteGoalEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
    const goalId = Number(req.params.goalId);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await MatchChampionship.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida de campeonato não encontrada' });
      return;
    }

    const championship = await Championship.findByPk((match as any).championship_id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    const isCreator = Number((championship as any).created_by) === req.user.id;
    
    if (!isCreator && !isAdmin) {
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
    console.error('Error in deleteGoalEvent (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao remover gol',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const deleteCardEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
    const cardId = Number(req.params.cardId);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await MatchChampionship.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida de campeonato não encontrada' });
      return;
    }

    const championship = await Championship.findByPk((match as any).championship_id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    const isCreator = Number((championship as any).created_by) === req.user.id;
    
    if (!isCreator && !isAdmin) {
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
    console.error('Error in deleteCardEvent (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao remover cartão',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const clearGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await MatchChampionship.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida de campeonato não encontrada' });
      return;
    }

    const championship = await Championship.findByPk((match as any).championship_id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    const isCreator = Number((championship as any).created_by) === req.user.id;
    
    if (!isCreator && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para limpar eventos desta partida' });
      return;
    }
    
    await MatchGoal.destroy({ where: { match_id: matchId } });
    res.status(200).json({ message: 'Todos os gols foram removidos com sucesso' });
  } catch (err) {
    console.error('Error in clearGoals (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao limpar gols',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const clearCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.matchId);
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const match = await MatchChampionship.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida de campeonato não encontrada' });
      return;
    }

    const championship = await Championship.findByPk((match as any).championship_id);
    if (!championship) {
      res.status(404).json({ message: 'Campeonato não encontrado' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    const isCreator = Number((championship as any).created_by) === req.user.id;
    
    if (!isCreator && !isAdmin) {
      res.status(403).json({ message: 'Você não tem permissão para limpar eventos desta partida' });
      return;
    }
    
    await MatchCard.destroy({ where: { match_id: matchId } });
    res.status(200).json({ message: 'Todos os cartões foram removidos com sucesso' });
  } catch (err) {
    console.error('Error in clearCards (Championship):', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).json({ 
      message: 'Erro ao limpar cartões',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
