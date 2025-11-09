import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import Team from '../models/TeamModel';
import FriendlyMatchesRulesModel from '../models/FriendlyMatchesRulesModel';
import jwt from 'jsonwebtoken';
import Player from '../models/PlayerModel';
import TeamPlayer from '../models/TeamPlayerModel';
import User from '../models/UserModel';
import { Op } from 'sequelize';
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

const checkScheduleConflict = async (teamId: number, matchId: number): Promise<{ hasConflict: boolean; conflictDetails?: string }> => {
  const newMatch = await FriendlyMatchesModel.findByPk(matchId);
  if (!newMatch) {
    return { hasConflict: false };
  }

  const newMatchDate = new Date(newMatch.date);
  const newMatchDuration = (newMatch as any).duration || '01:30';
  const [hours, minutes] = newMatchDuration.split(':').map(Number);
  const durationInMinutes = (hours * 60) + minutes;
  
  const newMatchEnd = new Date(newMatchDate.getTime() + (durationInMinutes * 60000));

  const existingMatches = await FriendlyMatchTeamsModel.findAll({
    where: { teamId },
    include: [{
      model: FriendlyMatchesModel,
      as: 'friendlyMatch',
      where: {
        id: { [Op.ne]: matchId },
        status: { [Op.in]: ['aberta', 'confirmada'] }
      }
    }]
  });

  for (const matchTeam of existingMatches) {
    const existingMatch = (matchTeam as any).friendlyMatch;
    const existingMatchDate = new Date(existingMatch.date);
    
    const sameDay = 
      newMatchDate.getFullYear() === existingMatchDate.getFullYear() &&
      newMatchDate.getMonth() === existingMatchDate.getMonth() &&
      newMatchDate.getDate() === existingMatchDate.getDate();

    if (!sameDay) continue;

    const existingDuration = existingMatch.duration || '01:30';
    const [exHours, exMinutes] = existingDuration.split(':').map(Number);
    const exDurationInMinutes = (exHours * 60) + exMinutes;
    const existingMatchEnd = new Date(existingMatchDate.getTime() + (exDurationInMinutes * 60000));

    const hasOverlap = 
      (newMatchDate >= existingMatchDate && newMatchDate < existingMatchEnd) ||
      (newMatchEnd > existingMatchDate && newMatchEnd <= existingMatchEnd) ||
      (newMatchDate <= existingMatchDate && newMatchEnd >= existingMatchEnd);

    if (hasOverlap) {
      const formatDateTime = (date: Date) => {
        return date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      return {
        hasConflict: true,
        conflictDetails: `Conflito de horário com a partida "${existingMatch.title}" em ${formatDateTime(existingMatchDate)}`
      };
    }
  }

  return { hasConflict: false };
};

export const joinMatchByTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { teamId } = req.body;
    const matchId = parseInt(req.params.id, 10);
    
    console.log('Tentando inscrever time:', { teamId, matchId, params: req.params, body: req.body });
    
    if (!matchId || isNaN(matchId)) {
      res.status(400).json({ message: 'ID da partida inválido' });
      return;
    }
    
    if (!teamId) {
      res.status(400).json({ message: 'ID do time é obrigatório' });
      return;
    }
    
    const match = await FriendlyMatchesModel.findByPk(matchId, {
      attributes: ['title', 'date', 'location', 'status', 'description', 'price', 'organizerId', 'duration']
    });
    
    console.log('Partida encontrada:', match ? 'Sim' : 'Não', match?.toJSON());
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    if (match.status === 'cancelada') {
      res.status(400).json({ message: 'Esta partida foi cancelada e não aceita mais inscrições' });
      return;
    }
    
    if (!token) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = Number(decoded.id);
    
    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (match.status !== 'aberta') {
      res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
      return;
    }
    
    const regras = await FriendlyMatchesRulesModel.findOne({ where: { matchId } });
    
    if (regras) {
      const registrationDeadline = regras.get('registrationDeadline');
      
      if (registrationDeadline) {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        const deadline = new Date(registrationDeadline as string);
        deadline.setHours(23, 59, 59, 999);
        
        if (now > deadline) {
          res.status(400).json({ message: 'O prazo de inscrição para esta partida já encerrou' });
          return;
        }
      }
    }

    const scheduleCheck = await checkScheduleConflict(teamId, matchId);
    if (scheduleCheck.hasConflict) {
      res.status(409).json({ 
        message: scheduleCheck.conflictDetails || 'Time já possui outra partida agendada neste horário' 
      });
      return;
    }
    
    const team = await Team.findOne({
      where: {
        id: teamId,
        isDeleted: false
      },
      attributes: ['id', 'name', 'captainId']
    });
    
    if (!team) {
      res.status(404).json({ message: 'Time não encontrado ou foi removido' });
      return;
    }
    
    const teamIsAlreadyInMatch = await FriendlyMatchTeamsModel.findOne({ where: { matchId, teamId } });
    if (teamIsAlreadyInMatch) {
      res.status(409).json({ message: 'Time já está inscrito nesta partida' });
      return;
    }
    
    const requester = await User.findByPk(userId).catch(() => null) as any;
    const isAdmin = requester && Number(requester.userTypeId) === 1;
    
    if (!isAdmin && Number((team as any).captainId) !== Number(userId)) {
      res.status(403).json({ message: 'Apenas o criador do time pode inscrever este time na partida' });
      return;
    }
    
    const currentTeamsCount = await FriendlyMatchTeamsModel.count({ where: { matchId } });
    const maxTimes = 2;
    
    if (currentTeamsCount >= maxTimes) {
      res.status(400).json({ message: 'Partida já está completa' });
      return;
    }
    
    if (regras) {
      const gender = regras.get('gender');
      
      console.log('Verificando regras de gênero:', { gender });
      
      if (gender && gender !== 'Ambos') {
        const isGenderValid = await verifyTeamsGenderRules(teamId, gender as string);
        
        console.log('Validação de gênero:', { isGenderValid });
        
        if (!isGenderValid) {
          res.status(403).json({ message: 'Time não se qualifica nas regras de gênero da partida' });
          return;
        }
      }
    }
    
    console.log('Verificando categoria...');
    const isCategoryValid = await isTimePossuiCategoriaValido(teamId, matchId);
    console.log('Validação de categoria:', { isCategoryValid });
    
    if (!isCategoryValid) {
      res.status(403).json({ message: 'Time não se qualifica nas regras de categoria da partida' });
      return;
    }
    
    console.log('Criando vínculo time-partida...');
    await FriendlyMatchTeamsModel.create({
      matchId: matchId,
      teamId: teamId
    });
    
    console.log('Time inscrito com sucesso na partida');
    
    const newCount = await FriendlyMatchTeamsModel.count({ where: { matchId } });
    if (newCount >= maxTimes) {
      await FriendlyMatchesModel.update({ status: 'sem_vagas' }, { where: { id: matchId } as any });
    }
    
    res.status(201).json({ message: 'Time inscrito na partida com sucesso' });
  } catch (error) {
    console.error('Erro ao inscrever time na partida:', error);
    res.status(500).json({ 
      message: 'Erro ao inscrever time na partida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}; 
const isTimePossuiCategoriaValido = async (teamId: number, matchId: number): Promise<boolean> => {
  return true;
};

export const verifyTeamsGenderRules = async (teamId: number, requiredGender: string): Promise<boolean> => {
  try {
    const teamPlayers = await TeamPlayer.findAll({
      where: { teamId: teamId },
      attributes: ['playerId'],
    });
    
    const playerIds = teamPlayers.map((team: any) => team.playerId);
    
    if (playerIds.length === 0) {
      console.log('Time não possui jogadores');
      return true;
    }
    
    const playersWithDifferentGender = await Player.findAll({
      where: {
        id: {
          [Op.in]: playerIds
        },
        gender: {
          [Op.ne]: requiredGender
        }
      },
      attributes: ['gender']
    });
    
    console.log('Jogadores com gênero diferente:', playersWithDifferentGender.length);
    
    return playersWithDifferentGender.length === 0;
  } catch (error) {
    console.error('Erro ao verificar regras de gênero:', error);
    throw error;
  }
}; 
export const getMatchTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = parseInt(req.params.id, 10);
    
    const matchTeams = await FriendlyMatchTeamsModel.findAll({
      where: { matchId },
      include: [{
        model: Team,
        as: 'matchTeam',
        attributes: ['id', 'name', 'captainId', 'banner', 'primaryColor', 'secondaryColor'],
        where: { isDeleted: false },
        required: false
      }]
    }) as any[];
    
    const formattedTeams = matchTeams
      .filter(mt => mt.matchTeam) // Remove times deletados
      .map(mt => ({
        id: mt.matchTeam.id,
        name: mt.matchTeam.name,
        captainId: mt.matchTeam.captainId,
        banner: mt.matchTeam.banner,
        primaryColor: mt.matchTeam.primaryColor,
        secondaryColor: mt.matchTeam.secondaryColor
      }));
    
    res.status(200).json(formattedTeams);
  } catch (error) {
    console.error('Erro ao obter times da partida:', error);
    res.status(500).json({ 
      message: 'Erro ao obter times da partida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const getTeamsAvailable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const Teams = await FriendlyMatchTeamsModel.findAll({
      attributes: ['teamId'],
      where: {
        matchId: req.params.id
      },
      raw: true,
    });
    
    const teamIds = Teams.map((team: any) => team.teamId);
    
    const Avaiableteams = await Team.findAll({
      where: {
        id: {
          [Op.notIn]: teamIds
        },
        isDeleted: false
      }
    });
    
    res.status(200).json(Avaiableteams);
  } catch (error) {
    console.error('Erro ao obter times disponíveis:', error);
    res.status(500).json({ 
      message: 'Erro ao obter times disponíveis',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};  
export const deleteTeamMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, teamId } = req.params;
    const matchIdNum = parseInt(String(id), 10);
    const teamIdNum = parseInt(String(teamId), 10);
    
    if (isNaN(matchIdNum) || isNaN(teamIdNum)) {
      res.status(400).json({ message: 'IDs inválidos para partida ou time' });
      return;
    }

    const match = await FriendlyMatchesModel.findByPk(matchIdNum);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const team = await Team.findByPk(teamIdNum);
    if (!team) {
      res.status(404).json({ message: 'Time não encontrado' });
      return;
    }
    
    try {
      const authHeader = req.headers.authorization as string | undefined;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined;
      
      if (!token) {
        res.status(401).json({ message: 'Não autenticado' });
        return;
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const requesterId = decoded.id;
  const isOrganizer = Number((match as any).organizerId) === requesterId;
      
      let requesterIsAdmin = false;
      const requester = await User.findByPk(requesterId).catch(() => null) as any;
      if (requester && Number(requester.userTypeId) === 1) requesterIsAdmin = true;
      
  const isTeamCaptain = Number((team as any).captainId) === requesterId;
      const matchStatus = String((match as any).status || '').toLowerCase();
      
      if (matchStatus === 'finalizada' && isTeamCaptain && !isOrganizer && !requesterIsAdmin) {
        res.status(403).json({ message: 'Não é permitido desvincular o time de uma partida finalizada' });
        return;
      }
      
      if (!isTeamCaptain && !isOrganizer && !requesterIsAdmin) {
        res.status(403).json({ message: 'Sem permissão para remover este time da partida' });
        return;
      }
    } catch (e) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
    
    const existing = await FriendlyMatchTeamsModel.findOne({ where: { matchId: matchIdNum, teamId: teamIdNum } });
    if (!existing) {
      res.status(404).json({ message: 'Time não está inscrito nesta partida' });
      return;
    }

    await FriendlyMatchTeamsModel.destroy({ where: { matchId: matchIdNum, teamId: teamIdNum } });
    
    try {
  const remainingCount = await FriendlyMatchTeamsModel.count({ where: { matchId: matchIdNum } });
      const maxTimes = 2;
      
      if (String((match as any).status) === 'sem_vagas' && remainingCount < maxTimes) {
        await match.update({ status: 'aberta' });
      }
    } catch (e) {
      // Não bloqueia a remoção bem-sucedida se a atualização de status falhar
    }

    res.status(200).json({ message: 'Time removido da partida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover time da partida:', error);
    res.status(500).json({ 
      message: 'Erro ao remover time da partida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
export const checkTeamsRuleCompliance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const matchId = parseInt(id, 10);
    
    console.log('Verificando conformidade para partida:', matchId);
    console.log('Usuário autenticado:', req.userId);
    
    const rules = await FriendlyMatchesRulesModel.findOne({ where: { matchId } });
    
    if (!rules) {
      res.status(404).json({ message: 'Regras da partida não encontradas' });
      return;
    }
    
    const matchTeams = await FriendlyMatchTeamsModel.findAll({
      where: { matchId: matchId },
      attributes: ['teamId']
    });
    
    console.log(`Times inscritos: ${matchTeams.length}`);
    
    const gender = rules.get('gender');
    
    for (const matchTeam of matchTeams) {
      const teamId = matchTeam.teamId;
      const team = await Team.findByPk(teamId, {
        attributes: ['name']
      });
      
      const teamName = team?.get('name') || 'Time desconhecido';
      
      if (gender && gender !== 'Ambos') {
        const isCategoryValid = await isTimePossuiCategoriaValido(teamId, matchId);
        const isGenderValid = await verifyTeamsGenderRules(teamId, gender as string);
        
        console.log(`Time ${teamName}: categoria=${isCategoryValid}, gênero=${isGenderValid}`);
        
        if (!isCategoryValid || !isGenderValid) {
          await FriendlyMatchTeamsModel.destroy({
            where: {
              matchId: matchId,
              teamId: teamId
            }
          });
          
          console.log(`Time ${teamName} removido por não conformidade`);
          
          res.status(403).json({ message: `Time ${teamName} não se qualifica nas regras da partida` });
          return;
        }
      }
    }
    
    res.status(200).json({ message: 'Todos os times estão em conformidade com as regras' });
  } catch (error) {
    console.error('Erro ao verificar conformidade das regras:', error);
    res.status(500).json({ 
      message: 'Erro ao verificar conformidade das regras',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

