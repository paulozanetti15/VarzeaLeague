import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import TeamUser from '../models/TeamUserModel';
import User from '../models/UserModel';
import Team from '../models/TeamModel';

export const getMatchPlayersForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const matchTeams = await FriendlyMatchTeamsModel.findAll({
      where: { matchId }
    });

    let teamIds = matchTeams.map(mt => mt.teamId);
    
    if (teamFilter && teamIds.includes(teamFilter)) {
      teamIds = [teamFilter];
    }

    if (teamIds.length === 0) {
      res.status(200).json({ players: [] });
      return;
    }

    const teamUsers = await TeamUser.findAll({
      where: { teamId: teamIds },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name']
        }
      ]
    });

    let filtered = teamUsers;
    
    if (isTeamAdmin && !isSystemAdmin && !isEventAdmin) {
      const myTeamMemberships = await TeamUser.findAll({
        where: { userId: req.user.id }
      });
      
      const myTeamIds = new Set(myTeamMemberships.map(tu => tu.teamId));
      filtered = teamUsers.filter(tu => myTeamIds.has(tu.teamId));
    }

    const seen = new Set<string>();
    const players = filtered
      .map((tu: any) => ({
        userId: tu.userId,
        nome: tu.user?.name || 'Sem nome',
        email: tu.user?.email || '',
        teamId: tu.teamId,
        time: tu.team?.name || 'Sem time'
      }))
      .filter(p => {
        const key = `${p.userId}:${p.teamId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));

    res.status(200).json({ players });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar jogadores da partida' });
  }
};
