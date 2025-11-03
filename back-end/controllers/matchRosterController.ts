import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import Player from '../models/PlayerModel';
import User from '../models/UserModel';

export const getMatchRosterPlayers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const teamFilter = req.query.teamId ? Number(req.query.teamId) : null;
    
    if (!req.user?.id) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }
    
    const requester = await User.findByPk(req.user.id);
    if (!requester) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    
    const role = (requester as any)?.userTypeId;
    const isSystemAdmin = role === 1;
    const isEventAdmin = role === 2;
    const isTeamAdmin = role === 3;
    
    if (!isSystemAdmin && !isEventAdmin && !isTeamAdmin) {
      res.status(403).json({ message: 'Acesso restrito a administradores' });
      return;
    }

    const match = await FriendlyMatchesModel.findByPk(matchId);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    const matchTeams = await FriendlyMatchTeamsModel.findAll({ where: { matchId } });
    let teamIds = matchTeams.map(t => t.teamId);
    
    if (teamFilter && teamIds.includes(teamFilter)) {
      teamIds = [teamFilter];
    }
    
    if (teamIds.length === 0) {
      res.status(200).json({ players: [] });
      return;
    }

    const teamPlayers = await TeamPlayer.findAll({
      where: { teamId: teamIds },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'position', 'gender'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] }
      ]
    });

    let filtered = teamPlayers;
    
    if (isTeamAdmin && !isSystemAdmin && !isEventAdmin) {
      const myTeamMemberships = await TeamPlayer.findAll({
        where: { teamId: teamIds }
      });
      
      const myTeamIds = new Set(myTeamMemberships.map(tp => tp.teamId));
      filtered = teamPlayers.filter(tp => myTeamIds.has(tp.teamId));
    }

    const seen = new Set<string>();
    const players = filtered
      .map((tp: any) => ({
        playerId: tp.playerId,
        nome: tp.player?.name || 'Sem nome',
        posicao: tp.player?.position || 'Não definida',
        sexo: tp.player?.gender || '',
        teamId: tp.teamId,
        time: tp.team?.name || 'Sem time'
      }))
      .filter(p => {
        const key = `${p.playerId}:${p.teamId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));

    res.status(200).json({ players });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar jogadores do roster' });
  }
};
