import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/MatchModel';
import MatchGoal from '../models/MatchGoalModel';
import MatchCard from '../models/MatchCardModel';
import User from '../models/UserModel';

export const finalizeMatch = async (req: AuthRequest, res: Response) => {
  try {
    const matchId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const user = await User.findByPk(userId);
    const isAdmin = (user as any)?.userTypeId === 1;
    if (match.organizerId !== userId && !isAdmin) { res.status(403).json({ message: 'Sem permissão para finalizar' }); return; }
    if (match.status === 'completed') { res.status(400).json({ message: 'Partida já finalizada' }); return; }
    await match.update({ status: 'completed' });
    res.json({ message: 'Partida finalizada', match });
  } catch (err) {
    console.error('Erro ao finalizar partida:', err);
    res.status(500).json({ message: 'Erro ao finalizar partida' });
  }
};

export const addGoal = async (req: AuthRequest, res: Response) => {
  try {
    const matchId = Number(req.params.id);
    const { userId, email } = req.body as { userId?: number; email?: string };
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    let resolvedUserId: number | null = null;
    if (userId) {
      resolvedUserId = userId;
    } else if (email) {
      const userByEmail = await User.findOne({ where: { email } });
      if (!userByEmail) { return res.status(400).json({ message: 'Email não encontrado' }); }
      resolvedUserId = (userByEmail as any).id;
    }
    const goal = await MatchGoal.create({ match_id: matchId, user_id: resolvedUserId });
    res.status(201).json(goal);
  } catch (err) {
    console.error('Erro ao registrar gol:', err);
    res.status(500).json({ message: 'Erro ao registrar gol' });
  }
};

export const addCard = async (req: AuthRequest, res: Response) => {
  try {
    const matchId = Number(req.params.id);
    const { userId, email, cardType, minute } = req.body as { userId?: number; email?: string; cardType: 'yellow' | 'red'; minute?: number };
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    if (!['yellow','red'].includes(cardType)) { res.status(400).json({ message: 'Tipo de cartão inválido' }); return; }
    const match = await Match.findByPk(matchId);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    const requester = await User.findByPk(req.user.id);
    const isAdmin = (requester as any)?.userTypeId === 1;
    if (match.organizerId !== req.user.id && !isAdmin) { res.status(403).json({ message: 'Sem permissão' }); return; }
    let resolvedUserId: number | null = null;
    if (userId) {
      resolvedUserId = userId;
    } else if (email) {
      const userByEmail = await User.findOne({ where: { email } });
      if (!userByEmail) { return res.status(400).json({ message: 'Email não encontrado' }); }
      resolvedUserId = (userByEmail as any).id;
    }
    const card = await MatchCard.create({ match_id: matchId, user_id: resolvedUserId, card_type: cardType, minute });
    res.status(201).json(card);
  } catch (err) {
    console.error('Erro ao registrar cartão:', err);
    res.status(500).json({ message: 'Erro ao registrar cartão' });
  }
};

export const listEvents = async (req: AuthRequest, res: Response) => {
  try {
    const matchId = Number(req.params.id);
    const goals = await MatchGoal.findAll({ where: { match_id: matchId }, order: [['id','ASC']] });
    const cards = await MatchCard.findAll({ where: { match_id: matchId }, order: [['id','ASC']] });
    const goalsByUser: Record<string, number> = {};
    const yellowByUser: Record<string, number> = {};
    const redByUser: Record<string, number> = {};
    goals.forEach((g: any) => { goalsByUser[g.user_id] = (goalsByUser[g.user_id] || 0) + 1; });
    cards.forEach((c: any) => {
      if (c.card_type === 'yellow') yellowByUser[c.user_id] = (yellowByUser[c.user_id] || 0) + 1;
      if (c.card_type === 'red') redByUser[c.user_id] = (redByUser[c.user_id] || 0) + 1;
    });
    res.json({ goals, cards, tallies: { goalsByUser, yellowByUser, redByUser } });
  } catch (err) {
    console.error('Erro ao listar eventos:', err);
    res.status(500).json({ message: 'Erro ao listar eventos' });
  }
};
