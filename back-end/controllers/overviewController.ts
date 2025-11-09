import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import TeamModel from '../models/TeamModel';
import PlayerModel from '../models/PlayerModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import Championship from '../models/ChampionshipModel';
import TeamChampionship from '../models/TeamChampionshipModel';
import User from '../models/UserModel';

export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    const { period = '30d', startDate: startDateParam, endDate: endDateParam } = req.query;
    
    let startDate: Date;
    let endDate: Date;
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam as string);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateParam as string);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      
      switch(period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = new Date('2000-01-01');
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      }
      startDate.setHours(0, 0, 0, 0);
    }

    const matchId = req.query.matchId ? Number(req.query.matchId) : undefined;
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;

    console.log('overview:getOverview params', {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      matchId,
      teamId
    });

    let matchIdsFilter: number[] | undefined;
    if (teamId) {
      const teamMatches = await FriendlyMatchTeamsModel.findAll({ where: { teamId }, attributes: ['matchId'], raw: true });
      matchIdsFilter = teamMatches.map((tm: any) => Number(tm.matchId)).filter(Boolean);
      console.log('overview:getOverview team filter', { teamId, matchesVinculadas: matchIdsFilter.length, exemplos: matchIdsFilter.slice(0, 5) });
      if (matchIdsFilter.length === 0) {
        console.log('overview:getOverview retorno vazio por não haver partidas vinculadas ao time');
        res.status(200).json({
          kpis: {
            amistososPeriodo: 0,
            campeonatosPeriodo: 0,
            inscricoesAmistososPeriodo: 0,
            inscricoesCampeonatosPeriodo: 0,
            timesPeriodo: 0,
            totalTeams: 0,
            totalPlayers: 0
          },
          matchesByMonth: [],
          applicationsByMonth: [],
          teamsByMonth: [],
          championshipsByMonth: [],
          matchRegistrationsByMonth: [],
          statusBreakdown: [],
          championshipStatusBreakdown: []
        });
        return;
      }
    }

    const matchWhere: any = {};
    if (matchId) matchWhere.id = matchId;
    if (matchIdsFilter) matchWhere.id = { [Op.in]: matchIdsFilter };

    // Removed goals and cards metrics

    const matchesSinceWhere: any = { date: { [Op.gte]: startDate, [Op.lte]: endDate } };
    if (matchId) matchesSinceWhere.id = matchId;
    if (matchIdsFilter) matchesSinceWhere.id = { [Op.in]: matchIdsFilter };

    const upcomingWhere: any = { date: { [Op.gte]: now } };
    if (matchId) upcomingWhere.id = matchId;
    if (matchIdsFilter) upcomingWhere.id = { [Op.in]: matchIdsFilter };

    const pastWhere: any = { date: { [Op.lt]: now } };
    if (matchId) pastWhere.id = matchId;
    if (matchIdsFilter) pastWhere.id = { [Op.in]: matchIdsFilter };

  const cancelledWhere: any = { status: 'cancelada', date: { [Op.gte]: startDate, [Op.lte]: endDate } };
    if (matchId) cancelledWhere.id = matchId;
    if (matchIdsFilter) cancelledWhere.id = { [Op.in]: matchIdsFilter };

  const completedWhere: any = { status: 'finalizada', date: { [Op.gte]: startDate, [Op.lte]: endDate } };
    if (matchId) completedWhere.id = matchId;
    if (matchIdsFilter) completedWhere.id = { [Op.in]: matchIdsFilter };

    console.time('overview:getOverview:queries');
    const [
      matchesPeriodRaw,
      totalTeams,
      totalPlayers,
      totalUsers,
      statusRawPeriod,
      cancelledMatches,
      completedMatches,
      championshipApplications,
      championshipsCreatedRaw,
      matchRegistrationsRaw,
      newUsers,
      teamsCreatedRaw
    ] = await Promise.all([
      FriendlyMatchesModel.findAll({ where: matchesSinceWhere, attributes: ['id','date','status'], raw: true }).catch(()=>[] as any[]),
      TeamModel.count(),
      PlayerModel.count(),
      User.count(),
      FriendlyMatchesModel.findAll({ attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']], where: matchesSinceWhere, group: ['status'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchesModel.findAll({ where: cancelledWhere, attributes: ['id','date'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchesModel.findAll({ where: completedWhere, attributes: ['id','date'], raw: true }).catch(()=>[] as any[]),
      TeamChampionship.findAll({ 
        where: { 
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate } 
        }, 
        attributes: ['id','createdAt','teamId','championshipId'], 
        raw: true 
      }).catch(()=>[] as any[]),
      Championship.findAll({ where: { created_at: { [Op.gte]: startDate, [Op.lte]: endDate } }, attributes: ['id','created_at','status'], raw: true }).catch(()=>[] as any[]),
      FriendlyMatchTeamsModel.findAll({ where: matchIdsFilter ? { matchId: { [Op.in]: matchIdsFilter } } : {}, attributes: ['matchId'], raw: true }).catch(()=>[] as any[]),
      User.findAll({ where: { createdAt: { [Op.gte]: startDate, [Op.lte]: endDate } }, attributes: ['id','createdAt'], raw: true }).catch(()=>[] as any[]),
      TeamModel.findAll({ where: { created_at: { [Op.gte]: startDate, [Op.lte]: endDate } }, attributes: ['id','created_at'], raw: true }).catch(()=>[] as any[])
    ]);
    console.timeEnd('overview:getOverview:queries');

    console.log('overview:getOverview resultados', {
      totais: { amistososPeriodo: (matchesPeriodRaw as any[]).length, totalTeams, totalPlayers, totalUsers },
      listas: {
        cancelledMatches: (cancelledMatches as any[]).length,
        completedMatches: (completedMatches as any[]).length,
        championshipApplications: (championshipApplications as any[]).length,
        championshipsCriados: (championshipsCreatedRaw as any[]).length,
        inscricoesAmistososRegistros: (matchRegistrationsRaw as any[]).length,
        newUsers: (newUsers as any[]).length,
        teamsCreated: (teamsCreatedRaw as any[]).length
      },
      primeirosRegistros: {
        championship: (championshipsCreatedRaw as any[])[0],
        application: (championshipApplications as any[])[0]
      }
    });

    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const months = (() => {
      const arr: string[] = [];
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const limit = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      while (cursor <= limit) {
        arr.push(monthKey(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return arr.length ? arr : [monthKey(new Date())];
    })();
    console.log('overview:getOverview meses agregados', { inicio: months[0], fim: months[months.length - 1], totalMeses: months.length });

    const matchesByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const r of matchesPeriodRaw as any[]) {
      const d = new Date((r as any).date);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) matchesByMonth[idx].count += 1;
    }

    // Removed goalsByMonth and cardsByMonth

    const cancelledByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const r of cancelledMatches as any[]) {
      const d = new Date((r as any).date);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) cancelledByMonth[idx].count += 1;
    }

    const completedByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const r of completedMatches as any[]) {
      const d = new Date((r as any).date);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) completedByMonth[idx].count += 1;
    }

    const applicationsByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const a of championshipApplications as any[]) {
      const d = new Date((a as any).createdAt);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) applicationsByMonth[idx].count += 1;
    }

    const championshipsByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const c of championshipsCreatedRaw as any[]) {
      const d = new Date((c as any).created_at);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) championshipsByMonth[idx].count += 1;
    }

    const teamsByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const t of teamsCreatedRaw as any[]) {
      const d = new Date((t as any).created_at);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) teamsByMonth[idx].count += 1;
    }

    const matchIdToDate: Record<string,string> = {};
    for (const r of matchesPeriodRaw as any[]) matchIdToDate[String((r as any).id)] = (r as any).date;
    const matchRegistrationsByMonth = months.map(m => ({ month: m, count: 0 }));
    for (const reg of matchRegistrationsRaw as any[]) {
      const dStr = matchIdToDate[String((reg as any).matchId)];
      if (!dStr) continue;
      const d = new Date(dStr);
      const k = monthKey(d);
      const idx = months.indexOf(k);
      if (idx >= 0) matchRegistrationsByMonth[idx].count += 1;
    }

    const championshipStatusBreakdown = (() => {
      const map: Record<string, number> = {};
      for (const c of championshipsCreatedRaw as any[]) {
        const st = (c as any).status || 'unknown';
        map[st] = (map[st] || 0) + 1;
      }
      return Object.entries(map).map(([status,count]) => ({ status, count }));
    })();

    const championshipsInProgress = (championshipsCreatedRaw as any[]).filter(
      (c: any) => c.status === 'em_andamento' || c.status === 'inscricoes_abertas'
    ).length;

    const statusBreakdown = (statusRawPeriod as any[]).map((s) => ({ status: (s as any).status || 'unknown', count: Number((s as any).count || 0) }));
    const payload = {
      kpis: {
        amistososPeriodo: (matchesPeriodRaw as any[]).length,
        campeonatosPeriodo: (championshipsCreatedRaw as any[]).length,
        inscricoesAmistososPeriodo: matchRegistrationsByMonth.reduce((s, m) => s + m.count, 0),
        inscricoesCampeonatosPeriodo: (championshipApplications as any[]).length,
        cancelledMatches: (cancelledMatches as any[]).length,
        completedMatches: (completedMatches as any[]).length,
        championshipsInProgress,
        newUsers: (newUsers as any[]).length,
        totalUsers,
        totalTeams,
        totalPlayers
      },
      matchesByMonth,
      applicationsByMonth,
      teamsByMonth,
      championshipsByMonth,
      matchRegistrationsByMonth,
      statusBreakdown,
      championshipStatusBreakdown
    };
    console.log('overview:getOverview resposta', {
      kpis: payload.kpis,
      series: {
        matchesByMonth: payload.matchesByMonth.length,
        applicationsByMonth: payload.applicationsByMonth.length,
        teamsByMonth: payload.teamsByMonth.length,
        championshipsByMonth: payload.championshipsByMonth.length,
        matchRegistrationsByMonth: payload.matchRegistrationsByMonth.length,
        statusBreakdown: payload.statusBreakdown.length,
        championshipStatusBreakdown: payload.championshipStatusBreakdown.length
      }
    });
    res.json(payload);
  } catch (error) {
    console.error('overview:getOverview erro', error);
    res.status(500).json({ message: 'Erro ao obter overview' });
  }
};

export const searchOverviewEntities = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = String(req.query.search || '').trim();
    if (!q) { res.json([]); return; }

    const like = { [Op.like]: `%${q}%` } as any;

    const [matches, teams, players] = await Promise.all([
      FriendlyMatchesModel.findAll({ where: { title: like }, attributes: ['id','title','date'], limit: 10, order: [['date','DESC']], raw: true }),
      TeamModel.findAll({ where: { name: like }, attributes: ['id','name'], limit: 10, order: [['name','ASC']], raw: true }),
      PlayerModel.findAll({ where: { name: like }, attributes: ['id','name','position'], limit: 10, order: [['name','ASC']], raw: true })
    ]);

    const results = [
      ...matches.map((m: any) => ({ type: 'match', id: m.id, label: m.title, date: m.date })),
      ...teams.map((t: any) => ({ type: 'team', id: t.id, label: t.name })),
      ...players.map((p: any) => ({ type: 'player', id: p.id, label: p.name, position: p.position }))
    ];

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Erro na busca' });
  }
};