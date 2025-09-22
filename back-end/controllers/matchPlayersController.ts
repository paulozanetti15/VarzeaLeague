import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/MatchModel';
import MatchTeams from '../models/MatchTeamsModel';
import TeamUser from '../models/TeamUserModel';
import User from '../models/UserModel';
import Team from '../models/TeamModel';

export const getMatchPlayersForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = Number(req.params.id);
    const teamFilter = req.query.teamId ? Number(req.query.teamId) : null;
    if (!req.user?.id) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const requester = await User.findByPk(req.user.id);
    const role = (requester as any)?.userTypeId;
    const isSystemAdmin = role === 1;
    const isEventAdmin = role === 2;
    const isTeamAdmin = role === 3;
    if (!isSystemAdmin && !isEventAdmin && !isTeamAdmin) { res.status(403).json({ message: 'Acesso restrito' }); return; }

  const match = await Match.findByPk(matchId);
  console.log('[players-for-admin] user', req.user.id, 'role', role, 'match', matchId, 'teamFilter', teamFilter);
    if (!match) { res.status(404).json({ message: 'Partida não encontrada' }); return; }

  const matchTeams = await MatchTeams.findAll({ where: { matchId } });
    let teamIds = matchTeams.map(t => t.teamId);
    if (teamFilter && teamIds.includes(teamFilter)) {
      teamIds = [teamFilter];
    }

    if (teamIds.length === 0) { res.json({ players: [] }); return; }

    const teamUsers = await TeamUser.findAll({
      where: { teamId: teamIds },
      include: [ { model: User, as: 'user', attributes: ['id','name','email'] }, { model: Team, as: 'team', attributes: ['id','name'] } ]
    });

    let filtered = teamUsers;
    if (isTeamAdmin && !isSystemAdmin && !isEventAdmin) {
      const myTeamMemberships = await TeamUser.findAll({ where: { userId: req.user.id } });
      const myTeamIds = new Set(myTeamMemberships.map(tu => tu.teamId));
      filtered = teamUsers.filter(tu => myTeamIds.has((tu as any).teamId));
    }
    const seen = new Set<string>();
    const players = filtered.map((tu: any) => ({
      userId: tu.userId,
      nome: tu.user?.name as string,
      email: tu.user?.email,
      teamId: tu.teamId,
      time: tu.team?.name as string
    })).filter(p => {
      const key = p.userId + ':' + p.teamId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a,b)=> a.nome.localeCompare(b.nome));

    res.json({ players });
  } catch (err) {
    console.error('Erro ao obter jogadores da partida:', err);
    res.status(500).json({ message: 'Erro ao listar jogadores' });
  }
};
