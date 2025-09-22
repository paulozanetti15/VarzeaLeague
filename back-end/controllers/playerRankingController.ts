import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import MatchGoal from '../models/MatchGoalModel';
import MatchCard from '../models/MatchCardModel';
import MatchEvaluation from '../models/MatchEvaluationModel';
import User from '../models/UserModel';
import TeamUser from '../models/TeamUserModel';
import Team from '../models/TeamModel';

export const getPlayerRanking = async (req: Request, res: Response) => {
  try {
    const goals = await MatchGoal.findAll({
      attributes: ['user_id', [fn('COUNT', col('id')), 'gols']],
      where: { user_id: { [Op.ne]: null } },
      group: ['user_id']
    });
    const yellowCards = await MatchCard.findAll({
      attributes: ['user_id', [fn('COUNT', col('id')), 'amarelos']],
      where: { user_id: { [Op.ne]: null }, card_type: 'yellow' },
      group: ['user_id']
    });
    const redCards = await MatchCard.findAll({
      attributes: ['user_id', [fn('COUNT', col('id')), 'vermelhos']],
      where: { user_id: { [Op.ne]: null }, card_type: 'red' },
      group: ['user_id']
    });
    const ratings = await MatchEvaluation.findAll({
      attributes: ['evaluator_id', [fn('AVG', col('rating')), 'media_rating'], [fn('COUNT', col('id')), 'total_avaliacoes']],
      group: ['evaluator_id']
    });

    const goalsMap: Record<string, number> = {};
    goals.forEach((g: any) => { goalsMap[g.user_id] = Number(g.get('gols')); });
    const yMap: Record<string, number> = {};
    yellowCards.forEach((c: any) => { yMap[c.user_id] = Number(c.get('amarelos')); });
    const rMap: Record<string, number> = {};
    redCards.forEach((c: any) => { rMap[c.user_id] = Number(c.get('vermelhos')); });
    const ratingMap: Record<string, { media: number; count: number }> = {};
    ratings.forEach((r: any) => { ratingMap[r.evaluator_id] = { media: Number(r.get('media_rating')).toFixed ? Number(Number(r.get('media_rating')).toFixed(2)) : Number(r.get('media_rating')), count: Number(r.get('total_avaliacoes')) }; });

    const userIds = Array.from(new Set([
      ...Object.keys(goalsMap),
      ...Object.keys(yMap),
      ...Object.keys(rMap),
      ...Object.keys(ratingMap)
    ].filter(id => id)));

    const users = await User.findAll({ where: { id: userIds } });

    // Fetch team memberships for these users
    const teamUsers = await TeamUser.findAll({
      where: { userId: userIds },
      include: [{ model: Team, as: 'team', attributes: ['id','name'] }]
    });
    const userTeamMap: Record<string, { teamId: number; teamName: string }[]> = {};
    teamUsers.forEach((tu: any) => {
      if (!userTeamMap[tu.userId]) userTeamMap[tu.userId] = [];
      if (tu.team) {
        userTeamMap[tu.userId].push({ teamId: tu.team.id, teamName: tu.team.name });
      }
    });
    const userMap: Record<string, any> = {};
    users.forEach(u => { userMap[(u as any).id] = u; });

    const ranking = userIds.map(uid => {
      const gols = goalsMap[uid] || 0;
      const amarelos = yMap[uid] || 0;
      const vermelhos = rMap[uid] || 0;
      const mediaRating = ratingMap[uid]?.media || 0;
      const avaliacoes = ratingMap[uid]?.count || 0;
      const score = (gols * 4) - amarelos - (vermelhos * 3) + (mediaRating * 2);
      const teams = userTeamMap[uid] || [];
      const primaryTeam = teams.sort((a,b)=> a.teamName.localeCompare(b.teamName))[0];
      return {
        userId: Number(uid),
        nome: userMap[uid]?.name || 'N/A',
        teamId: primaryTeam?.teamId || null,
        time: primaryTeam?.teamName || null,
        gols,
        amarelos,
        vermelhos,
        mediaRating,
        avaliacoes,
        score: Number(score.toFixed(2))
      };
    }).sort((a,b) => b.score - a.score);

    res.json({ total: ranking.length, ranking });
  } catch (err) {
    console.error('Erro ao gerar ranking jogadores:', err);
    res.status(500).json({ message: 'Erro ao gerar ranking' });
  }
};
