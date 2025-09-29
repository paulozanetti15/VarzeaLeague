import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/MatchModel';
import MatchGoal from '../models/MatchGoalModel';
import MatchCard from '../models/MatchCardModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';
import MatchReport from '../models/MatchReportModel';
import Team from "../models/TeamModel"
import TeamPlayer from '../models/TeamPlayerModel';
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
    if (match.status === 'completed') { res.status(400).json({ message: 'Partida já finalizada' }); return; }
    await match.update({ status: 'completed' });
    res.json({ message: 'Partida finalizada', match });
  } catch (err) {
    console.error('Erro ao finalizar partida:', err);
    res.status(500).json({ message: 'Erro ao finalizar partida' });
  }
};

export const addGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    console.log(req.body)
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const goal = await MatchGoal.create({ match_id: matchId,player_id: req.body.playerId,minuteGoal: req.body.minute, team_id:req.body.team_id });
    res.status(201).json(goal);
  } catch (err) {
    console.error('Erro ao registrar gol:', err);
    const anyErr: any = err;
    res.status(500).json({ message: 'Erro ao registrar gol', detalhe: anyErr?.original?.code || anyErr?.message });
  }
};

export const addCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const { playerId,team_id, cardType, minute } = req.body as { playerId?: number; team_id?: number; email?: string; cardType: 'yellow' | 'red'; minute?: number };
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    let resolvedPlayerId: number | null = null;
    if (playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) { res.status(400).json({ message: 'Player não encontrado' }); return; }
      resolvedPlayerId = playerId;
    }
    console.log(req.body)
    const card = await MatchCard.create({ match_id: matchId,team_id:team_id, player_id: resolvedPlayerId, card_type: cardType, minute });
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
    const goals = await MatchGoal.findAll({
      where: { match_id: matchId },
      order: [['id', 'ASC']],
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'nome'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name'],
        },
      ],
    });

    const cards = await MatchCard.findAll({ where: { match_id: matchId }, order: [['id','ASC']], 
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'nome'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['name'],
        },
      ],
    });
    const report = await MatchReport.findAll({ where: { match_id: matchId }, order: [['id','ASC']], include: [
      {
          model: Team,
          as:'teamHome',
          attributes: ['name']
      },
      {
          model: Team,
          as:'teamAway',
          attributes: ['name']
      }, 
      {
          model: Match,
          as:'match',
          attributes: ['date']
      }, 

    ]});

    const goalsByPlayer: Record<string, number> = {};
    const yellowByPlayer: Record<string, number> = {};
    const redByPlayer: Record<string, number> = {};
    goals.forEach((g: any) => {
      const key = g.player_id ? `player_${g.player_id}` : (g.user_id ? `user_${g.user_id}` : 'generic');
      goalsByPlayer[key] = (goalsByPlayer[key] || 0) + 1;
    });
    cards.forEach((c: any) => {
      const key = c.player_id ? `player_${c.player_id}` : (c.user_id ? `user_${c.user_id}` : 'generic');
      if (c.card_type === 'yellow') {
        yellowByPlayer[key] = (yellowByPlayer[key] || 0) + 1;
      }
      if (c.card_type === 'red') {
        redByPlayer[key] = (redByPlayer[key] || 0) + 1;
      }
    });
    res.status(200).json({ goals, cards, report, tallies: { goalsByPlayer, yellowByPlayer, redByPlayer } });
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
export const altualizarPlacar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    await MatchReport.update(
      {
        teamHome_score: req.body.teamHome_score,
        teamAway_score: req.body.teamAway_score,
      },
      {
        where: {
          matchId: matchId,
        },
      }
    );
    res.status(200).json({ message: 'Sumula atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao remover cartão:', err);
    res.status(500).json({ message: 'Erro ao remover cartão' });
  }
};