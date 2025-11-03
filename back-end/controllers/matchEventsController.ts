import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/MatchModel';
import MatchGoal from '../models/MatchGoalModel';
import MatchCard from '../models/MatchCardModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';
import PlayerEligibilityService from '../services/PlayerEligibilityService';

export const finalizeMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const user = await User.findByPk(userId);
    const isAdmin = (user as any)?.userTypeId === 1;
    if (match.organizerId !== userId && !isAdmin) { res.status(403).json({ message: 'Sem permissão para finalizar' }); return; }
    if (match.status === 'finalizada') { res.status(400).json({ message: 'Partida já finalizada' }); return; }
    await match.update({ status: 'finalizada' });
    res.json({ message: 'Partida finalizada', match });
  } catch (err) {
    console.error('Erro ao finalizar partida:', err);
    res.status(500).json({ message: 'Erro ao finalizar partida' });
  }
};

export const addGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { playerId, userId, email, minute } = req.body as { playerId?: number; userId?: number; email?: string; minute?: number };
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    let resolvedUserId: number | null = null;
    let resolvedPlayerId: number | null = null;
    if (playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) { res.status(400).json({ message: 'Player não encontrado' }); return; }
      resolvedPlayerId = playerId;
    } else if (userId) {
      resolvedUserId = userId;
    } else if (email) {
      const userByEmail = await User.findOne({ where: { email } });
      if (!userByEmail) { res.status(400).json({ message: 'Email não encontrado' }); return; }
      resolvedUserId = (userByEmail as any).id;
    }
    const goal = await MatchGoal.create({ match_id: matchId, user_id: resolvedUserId, player_id: resolvedPlayerId, minute: minute || 0 });
    res.status(201).json(goal);
  } catch (err) {
    console.error('Erro ao registrar gol:', err);
    const anyErr: any = err;
    if (anyErr?.original?.code) {
      console.error('DB Code:', anyErr.original.code, 'SQL:', anyErr.original.sql);
    }
    res.status(500).json({ message: 'Erro ao registrar gol', detalhe: anyErr?.original?.code || anyErr?.message });
  }
};

export const addCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { playerId, userId, email, cardType, minute } = req.body as { playerId?: number; userId?: number; email?: string; cardType: 'yellow' | 'red'; minute?: number };
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    if (!['yellow','red'].includes(cardType)) { res.status(400).json({ message: 'Tipo de cartão inválido' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    let resolvedUserId: number | null = null;
    let resolvedPlayerId: number | null = null;
    if (playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) { res.status(400).json({ message: 'Player não encontrado' }); return; }
      resolvedPlayerId = playerId;
    } else if (userId) {
      resolvedUserId = userId;
    } else if (email) {
      const userByEmail = await User.findOne({ where: { email } });
      if (!userByEmail) { res.status(400).json({ message: 'Email não encontrado' }); return; }
      resolvedUserId = (userByEmail as any).id;
    }
    const card = await MatchCard.create({ match_id: matchId, user_id: resolvedUserId, player_id: resolvedPlayerId, card_type: cardType, minute });
    
    if (resolvedPlayerId) {
      const suspension = await PlayerEligibilityService.processCardAndCheckSuspension(
        resolvedPlayerId,
        matchId,
        cardType,
        false
      );
      
      if (suspension) {
        console.log(`Suspensão automática criada para jogador ${resolvedPlayerId}:`, suspension);
      }
    }
    
    res.status(201).json(card);
  } catch (err) {
    console.error('Erro ao registrar cartão:', err);
    const anyErr: any = err;
    if (anyErr?.original?.code) {
      console.error('DB Code:', anyErr.original.code, 'SQL:', anyErr.original.sql);
    }
    res.status(500).json({ message: 'Erro ao registrar cartão', detalhe: anyErr?.original?.code || anyErr?.message });
  }
};

export const listEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const goals = await MatchGoal.findAll({ where: { match_id: matchId }, order: [['id','ASC']], include: [
      { model: User, as: 'user', attributes: ['id','name'] },
      { model: Player, as: 'player', attributes: ['id','nome'] }
    ] });
    const cards = await MatchCard.findAll({ where: { match_id: matchId }, order: [['id','ASC']], include: [
      { model: User, as: 'user', attributes: ['id','name'] },
      { model: Player, as: 'player', attributes: ['id','nome'] }
    ] });
    console.log('[listEvents] match', matchId, 'goals fetched', goals.length, 'cards fetched', cards.length);
    goals.forEach(g => console.log('[goal]', (g as any).id, 'user_id', (g as any).user_id, 'player_id', (g as any).player_id, 'user?', (g as any).user?.name, 'player?', (g as any).player?.nome));
    cards.forEach(c => console.log('[card]', (c as any).id, 'user_id', (c as any).user_id, 'player_id', (c as any).player_id, 'user?', (c as any).user?.name, 'player?', (c as any).player?.nome));
    const goalsByUser: Record<string, number> = {};
    const yellowByUser: Record<string, number> = {};
    const redByUser: Record<string, number> = {};
    const goalsByPlayer: Record<string, number> = {};
    const yellowByPlayer: Record<string, number> = {};
    const redByPlayer: Record<string, number> = {};
    goals.forEach((g: any) => {
      const key = g.player_id ? `player_${g.player_id}` : (g.user_id ? `user_${g.user_id}` : 'generic');
      goalsByUser[g.user_id] = (goalsByUser[g.user_id] || 0) + 1;
      goalsByPlayer[key] = (goalsByPlayer[key] || 0) + 1;
    });
    cards.forEach((c: any) => {
      const key = c.player_id ? `player_${c.player_id}` : (c.user_id ? `user_${c.user_id}` : 'generic');
      if (c.card_type === 'yellow') {
        yellowByUser[c.user_id] = (yellowByUser[c.user_id] || 0) + 1;
        yellowByPlayer[key] = (yellowByPlayer[key] || 0) + 1;
      }
      if (c.card_type === 'red') {
        redByUser[c.user_id] = (redByUser[c.user_id] || 0) + 1;
        redByPlayer[key] = (redByPlayer[key] || 0) + 1;
      }
    });
    res.json({ goals, cards, tallies: { goalsByUser, yellowByUser, redByUser, goalsByPlayer, yellowByPlayer, redByPlayer } });
  } catch (err) {
    console.error('Erro ao listar eventos:', err);
    res.status(500).json({ message: 'Erro ao listar eventos' });
  }
};

export const deleteGoalEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const goalId = Number(req.params.goalId);
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    const goal = await MatchGoal.findOne({ where: { id: goalId, match_id: matchId } });
    if (!goal) { res.status(404).json({ message: 'Gol não encontrado' }); return; }
    await goal.destroy();
    res.json({ message: 'Gol removido' });
  } catch (err) {
    console.error('Erro ao remover gol:', err);
    res.status(500).json({ message: 'Erro ao remover gol' });
  }
};

export const deleteCardEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const cardId = Number(req.params.cardId);
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    const card = await MatchCard.findOne({ where: { id: cardId, match_id: matchId } });
    if (!card) { res.status(404).json({ message: 'Cartão não encontrado' }); return; }
    await card.destroy();
    res.json({ message: 'Cartão removido' });
  } catch (err) {
    console.error('Erro ao remover cartão:', err);
    res.status(500).json({ message: 'Erro ao remover cartão' });
  }
};

export const clearGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    await MatchGoal.destroy({ where: { match_id: matchId } });
    res.json({ message: 'Gols removidos' });
  } catch (err) {
    console.error('Erro ao limpar gols:', err);
    res.status(500).json({ message: 'Erro ao limpar gols' });
  }
};

export const clearCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    await MatchCard.destroy({ where: { match_id: matchId } });
    res.json({ message: 'Cartões removidos' });
  } catch (err) {
    console.error('Erro ao limpar cartões:', err);
    res.status(500).json({ message: 'Erro ao limpar cartões' });
  }
};
