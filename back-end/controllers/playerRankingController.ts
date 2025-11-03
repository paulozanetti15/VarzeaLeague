import { Request, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import FriendlyMatchGoalModel from '../models/FriendlyMatchGoalModel';
import FriendlyMatchCardModel from '../models/FriendlyMatchCardModel';
import FriendlyMatchEvaluationModel from '../models/FriendlyMatchEvaluationModel';
import User from '../models/UserModel';
import TeamUser from '../models/TeamUserModel';
import Team from '../models/TeamModel';
import Player from '../models/PlayerModel';
import TeamPlayer from '../models/TeamPlayerModel';

export const getPlayerRanking = async (req: Request, res: Response) => {
  try {
    const goals = await FriendlyMatchGoalModel.findAll({
      attributes: ['user_id', [fn('COUNT', col('id')), 'gols']],
      where: { user_id: { [Op.ne]: null } },
      group: ['user_id'],
      raw: true
    });
    
    const yellowCards = await FriendlyMatchCardModel.findAll({
      attributes: ['user_id', [fn('COUNT', col('id')), 'amarelos']],
      where: { user_id: { [Op.ne]: null }, card_type: 'yellow' },
      group: ['user_id'],
      raw: true
    });
    
    const redCards = await FriendlyMatchCardModel.findAll({
      attributes: ['user_id', [fn('COUNT', col('id')), 'vermelhos']],
      where: { user_id: { [Op.ne]: null }, card_type: 'red' },
      group: ['user_id'],
      raw: true
    });
    
    const ratings = await FriendlyMatchEvaluationModel.findAll({
      attributes: ['evaluator_id', [fn('AVG', col('rating')), 'media_rating'], [fn('COUNT', col('id')), 'total_avaliacoes']],
      group: ['evaluator_id'],
      raw: true
    });

    const goalsMap: Record<number, number> = {};
    goals.forEach((g: any) => { 
      if (g.user_id) goalsMap[Number(g.user_id)] = Number(g.gols); 
    });
    
    const yMap: Record<number, number> = {};
    yellowCards.forEach((c: any) => { 
      if (c.user_id) yMap[Number(c.user_id)] = Number(c.amarelos); 
    });
    
    const rMap: Record<number, number> = {};
    redCards.forEach((c: any) => { 
      if (c.user_id) rMap[Number(c.user_id)] = Number(c.vermelhos); 
    });
    
    const ratingMap: Record<number, { media: number; count: number }> = {};
    ratings.forEach((r: any) => { 
      if (r.evaluator_id) {
        ratingMap[Number(r.evaluator_id)] = { 
          media: Number(Number(r.media_rating || 0).toFixed(2)), 
          count: Number(r.total_avaliacoes || 0) 
        };
      }
    });

    const playerGoals = await FriendlyMatchGoalModel.findAll({
      attributes: ['player_id', [fn('COUNT', col('id')), 'gols']],
      where: { player_id: { [Op.ne]: null } },
      group: ['player_id'],
      raw: true
    });
    
    const playerYellow = await FriendlyMatchCardModel.findAll({
      attributes: ['player_id', [fn('COUNT', col('id')), 'amarelos']],
      where: { player_id: { [Op.ne]: null }, card_type: 'yellow' },
      group: ['player_id'],
      raw: true
    });
    
    const playerRed = await FriendlyMatchCardModel.findAll({
      attributes: ['player_id', [fn('COUNT', col('id')), 'vermelhos']],
      where: { player_id: { [Op.ne]: null }, card_type: 'red' },
      group: ['player_id'],
      raw: true
    });
    
    const pGoalsMap: Record<number, number> = {};
    playerGoals.forEach((g: any) => { 
      if (g.player_id) pGoalsMap[Number(g.player_id)] = Number(g.gols); 
    });
    
    const pYMap: Record<number, number> = {};
    playerYellow.forEach((c: any) => { 
      if (c.player_id) pYMap[Number(c.player_id)] = Number(c.amarelos); 
    });
    
    const pRMap: Record<number, number> = {};
    playerRed.forEach((c: any) => { 
      if (c.player_id) pRMap[Number(c.player_id)] = Number(c.vermelhos); 
    });

    const userIds = Array.from(new Set([
      ...Object.keys(goalsMap).map(Number),
      ...Object.keys(yMap).map(Number),
      ...Object.keys(rMap).map(Number),
      ...Object.keys(ratingMap).map(Number)
    ]));
    
    const playerIds = Array.from(new Set([
      ...Object.keys(pGoalsMap).map(Number),
      ...Object.keys(pYMap).map(Number),
      ...Object.keys(pRMap).map(Number)
    ]));

    const users = await User.findAll({ 
      where: { id: userIds },
      attributes: ['id', 'name']
    });
    
    const players = await Player.findAll({ 
      where: { id: playerIds },
      attributes: ['id', 'name']
    });

    const teamUsers = await TeamUser.findAll({
      where: { userId: userIds },
      include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }]
    });
    
    const userTeamMap: Record<number, { teamId: number; teamName: string }[]> = {};
    teamUsers.forEach((tu: any) => {
      const userId = Number(tu.userId);
      if (!userTeamMap[userId]) userTeamMap[userId] = [];
      if (tu.team) {
        userTeamMap[userId].push({ 
          teamId: Number(tu.team.id), 
          teamName: tu.team.name 
        });
      }
    });
    
    const userMap: Record<number, any> = {};
    users.forEach(u => { 
      userMap[Number(u.id)] = u; 
    });

    const teamPlayers = await TeamPlayer.findAll({
      where: { playerId: playerIds },
      include: [{ model: Team, as: 'team', attributes: ['id', 'name'] }]
    });
    
    const playerTeamMap: Record<number, { teamId: number; teamName: string }[]> = {};
    teamPlayers.forEach((tp: any) => {
      const playerId = Number(tp.playerId);
      if (!playerTeamMap[playerId]) playerTeamMap[playerId] = [];
      if (tp.team) {
        playerTeamMap[playerId].push({ 
          teamId: Number(tp.team.id), 
          teamName: tp.team.name 
        });
      }
    });

    const playerMap: Record<number, any> = {};
    players.forEach(p => { 
      playerMap[Number(p.id)] = p; 
    });

    const userRanking = userIds.map(uid => {
      const gols = goalsMap[uid] || 0;
      const amarelos = yMap[uid] || 0;
      const vermelhos = rMap[uid] || 0;
      const mediaRating = ratingMap[uid]?.media || 0;
      const avaliacoes = ratingMap[uid]?.count || 0;
      const score = (gols * 4) - amarelos - (vermelhos * 3) + (mediaRating * 2);
      const teams = userTeamMap[uid] || [];
      const primaryTeam = teams.sort((a, b) => a.teamName.localeCompare(b.teamName))[0];
      
      return {
        type: 'user',
        userId: uid,
        playerId: null,
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
    });

    const playerRanking = playerIds.map(pid => {
      const gols = pGoalsMap[pid] || 0;
      const amarelos = pYMap[pid] || 0;
      const vermelhos = pRMap[pid] || 0;
      const mediaRating = 0;
      const avaliacoes = 0;
      const score = (gols * 4) - amarelos - (vermelhos * 3) + (mediaRating * 2);
      const teams = playerTeamMap[pid] || [];
      const primaryTeam = teams.sort((a, b) => a.teamName.localeCompare(b.teamName))[0];
      
      return {
        type: 'player',
        userId: null,
        playerId: pid,
        nome: playerMap[pid]?.name || 'N/A',
        teamId: primaryTeam?.teamId || null,
        time: primaryTeam?.teamName || null,
        gols,
        amarelos,
        vermelhos,
        mediaRating,
        avaliacoes,
        score: Number(score.toFixed(2))
      };
    });

    const rankingCombined = [...userRanking, ...playerRanking]
      .sort((a, b) => b.score - a.score);

    res.status(200).json({ 
      total: rankingCombined.length, 
      ranking: rankingCombined 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar ranking de jogadores' });
  }
};
