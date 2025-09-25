import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchEvaluation from '../models/MatchEvaluationModel';
import Match from '../models/MatchModel';
import MatchTeams from '../models/MatchTeamsModel';
import TeamUser from '../models/TeamUserModel';

export const listMatchEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const evaluations = await MatchEvaluation.findAll({ where: { match_id: matchId }, order: [['id','DESC']] });
    res.json(evaluations);
  } catch (err: any) {
    console.error('Erro ao listar avaliações:', err?.message, err);
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
    console.error('Erro ao salvar avaliação:', err);
    res.status(500).json({ message: 'Erro ao salvar avaliação' });
  }
};

export const getMatchEvaluationSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const list = await MatchEvaluation.findAll({ where: { match_id: matchId } });
    const count = list.length;
    const avg = count ? list.reduce((acc: number, e: any) => acc + e.rating, 0) / count : 0;
    res.json({ average: Number(avg.toFixed(2)), count });
  } catch (err) {
    console.error('Erro ao obter resumo avaliações:', err);
    res.status(500).json({ message: 'Erro ao obter resumo' });
  }
};
