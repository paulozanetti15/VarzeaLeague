import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import TeamModel from '../models/TeamModel';
import PlayerModel from '../models/PlayerModel';
import FriendlyMatchGoalModel from '../models/FriendlyMatchGoalModel';
import FriendlyMatchCardModel from '../models/FriendlyMatchCardModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Optional filters
    const matchId = req.query.matchId ? Number(req.query.matchId) : undefined;
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;

    let matchIdsFilter: number[] | undefined;
    if (teamId) {
      const teamMatches = await FriendlyMatchTeamsModel.findAll({ where: { teamId }, attributes: ['matchId'], raw: true });
      matchIdsFilter = teamMatches.map((tm: any) => Number(tm.matchId)).filter(Boolean);
      if (matchIdsFilter.length === 0) {
        res.status(200).json({
          kpis: { totalMatches: 0, upcomingMatches: 0, pastMatches: 0, totalTeams: 0, totalPlayers: 0, totalGoals: 0, totalCards: 0 },
          matchesByMonth: [], goalsByMonth: [], cardsByMonth: [], statusBreakdown: [], nextMatches: [], recentMatches: []
        });
        return;
      }
    }

    const matchWhere: any = {};
    if (matchId) matchWhere.id = matchId;
    if (matchIdsFilter) matchWhere.id = { [Op.in]: matchIdsFilter };

    const totalGoalsWhere: any = {};
    const totalCardsWhere: any = {};
    if (matchId) { totalGoalsWhere.match_id = matchId; totalCardsWhere.match_id = matchId; }
    if (matchIdsFilter) { totalGoalsWhere.match_id = { [Op.in]: matchIdsFilter }; totalCardsWhere.match_id = { [Op.in]: matchIdsFilter }; }

    const goalsWhere: any = { created_at: { [Op.gte]: since as any } };
    if (matchId) goalsWhere.match_id = matchId;
    if (matchIdsFilter) goalsWhere.match_id = { [Op.in]: matchIdsFilter };

    const cardsWhere: any = { created_at: { [Op.gte]: since as any } };
    if (matchId) cardsWhere.match_id = matchId;
    if (matchIdsFilter) cardsWhere.match_id = { [Op.in]: matchIdsFilter };

    const matchesSinceWhere: any = { date: { [Op.gte]: since } };
    if (matchId) matchesSinceWhere.id = matchId;
    if (matchIdsFilter) matchesSinceWhere.id = { [Op.in]: matchIdsFilter };

    const upcomingWhere: any = { date: { [Op.gte]: now } };
    if (matchId) upcomingWhere.id = matchId;
    if (matchIdsFilter) upcomingWhere.id = { [Op.in]: matchIdsFilter };

    const pastWhere: any = { date: { [Op.lt]: now } };
    if (matchId) pastWhere.id = matchId;
    if (matchIdsFilter) pastWhere.id = { [Op.in]: matchIdsFilter };

    const [
      totalMatches,
      totalTeams,
      totalPlayers,
      totalGoals,
      totalCards,
      upcomingCount,
      pastCount,
      matches,
      goals,
      cards,
      nextMatches,
      recentMatches,
      statusRaw
    ] = await Promise.all([
      FriendlyMatchesModel.count({ where: matchWhere }),
      TeamModel.count(),
      PlayerModel.count(),
      FriendlyMatchGoalModel.count({ where: Object.keys(totalGoalsWhere).length ? totalGoalsWhere : undefined }).catch(()=>0),
      FriendlyMatchCardModel.count({ where: Object.keys(totalCardsWhere).length ? totalCardsWhere : undefined }).catch(()=>0),
      FriendlyMatchesModel.count({ where: upcomingWhere }),
      FriendlyMatchesModel.count({ where: pastWhere }),
      FriendlyMatchesModel.findAll({ where: matchesSinceWhere, attributes: ['id','date'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchGoalModel.findAll({ where: goalsWhere, attributes: ['id','created_at'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchCardModel.findAll({ where: cardsWhere, attributes: ['id','created_at','card_type'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchesModel.findAll({ where: upcomingWhere, order: [['date', 'ASC']], limit: 5, attributes: ['id','title','date','location','status'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchesModel.findAll({ where: pastWhere, order: [['date', 'DESC']], limit: 5, attributes: ['id','title','date','location','status'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchesModel.findAll({ attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']], where: matchWhere, group: ['status'], raw: true }).catch(()=>[] as any[])
    ]);

    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const months = (() => { const arr: string[] = []; const base = new Date(); base.setDate(1); for (let i = 11; i >= 0; i--) { const d = new Date(base.getFullYear(), base.getMonth() - i, 1); arr.push(monthKey(d)); } return arr; })();

    const matchesByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const r of matches as any[]) {
      const d = new Date((r as any).date);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) matchesByMonth[idx].count += 1;
    }

    const goalsByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const g of goals as any[]) {
      const d = new Date((g as any).created_at);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) goalsByMonth[idx].count += 1;
    }

    const cardsByMonth = months.map(m => ({ month: m, yellow: 0, red: 0 }));
    for (const c of cards as any[]) {
      const d = new Date((c as any).created_at);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) {
        if ((c as any).card_type === 'red') cardsByMonth[idx].red += 1; else cardsByMonth[idx].yellow += 1;
      }
    }

    const statusBreakdown = (statusRaw as any[]).map((s) => ({ status: (s as any).status || 'unknown', count: Number((s as any).count || 0) }));

    res.json({
      kpis: {
        totalMatches,
        upcomingMatches: upcomingCount,
        pastMatches: pastCount,
        totalTeams,
        totalPlayers,
        totalGoals,
        totalCards,
      },
      matchesByMonth,
      goalsByMonth,
      cardsByMonth,
      statusBreakdown,
      nextMatches,
      recentMatches
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter overview' });
  }
};

export const searchOverviewEntities = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) { res.json([]); return; }

    const like = { [Op.like]: `%${q}%` } as any;

    const [matches, teams] = await Promise.all([
      FriendlyMatchesModel.findAll({ where: { title: like }, attributes: ['id','title','date'], limit: 10, order: [['date','DESC']], raw: true }),
      TeamModel.findAll({ where: { name: like }, attributes: ['id','name'], limit: 10, order: [['name','ASC']], raw: true })
    ]);

    const results = [
      ...matches.map((m: any) => ({ type: 'match', id: m.id, label: m.title, date: m.date })),
      ...teams.map((t: any) => ({ type: 'team', id: t.id, label: t.name }))
    ];

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Erro na busca' });
  }
};