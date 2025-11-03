import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchEvaluation from '../models/FriendlyMatchEvaluationModel';
import Match from '../models/FriendlyMatchesModel';
import MatchTeams from '../models/FriendlyMatchTeamsModel';
import TeamUser from '../models/TeamUserModel';
import User from '../models/UserModel';

export const listMatchEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const evaluations = await MatchEvaluation.findAll({ 
      where: { match_id: matchId }, 
      include: [{
        model: User,
        as: 'evaluator',
        attributes: ['id', 'name']
      }],
      order: [['id','DESC']] 
    });
    res.status(200).json(evaluations);
  } catch (err: any) {
    res.status(500).json({ message: 'Erro ao listar avaliações', detalhe: err?.message });
  }
};

export const upsertMatchEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { rating, comment } = req.body as { rating: number; comment?: string };
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ message: 'Não autenticado' }); return; }
    if (!rating || rating < 1 || rating > 5) { res.status(400).json({ message: 'Rating deve ser 1-5' }); return; }

  const match = await Match.findByPk(matchId);
  if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }
    let participated = match.organizerId === userId;
    if (!participated) {
      const matchTeams = await MatchTeams.findAll({ where: { matchId }, attributes: ['teamId'] });
      const teamIds = matchTeams.map((t: any) => t.teamId);
      if (teamIds.length) {
        const membership = await TeamUser.findOne({ where: { teamId: teamIds, userId } as any });
        if (membership) participated = true;
      }
    }
    if (!participated) { res.status(403).json({ message: 'Apenas participantes podem avaliar' }); return; }

    const existing = await MatchEvaluation.findOne({ where: { match_id: matchId, evaluator_id: userId } });
    if (existing) {
      existing.set({ rating, comment });
      await existing.save();
      res.json(existing);
      return;
    }
    const created = await MatchEvaluation.create({ match_id: matchId, evaluator_id: userId, rating, comment });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar avaliação' });
  }
};

export const getMatchEvaluationSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const list = await MatchEvaluation.findAll({ where: { match_id: matchId } });
    const count = list.length;
    const avg = count ? list.reduce((acc: number, e: any) => acc + e.rating, 0) / count : 0;
    res.status(200).json({ average: Number(avg.toFixed(2)), count });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter resumo' });
  }
};
