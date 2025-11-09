import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import User from '../models/UserModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import TeamModel from '../models/TeamModel';
import FriendlyMatchesRulesModel from '../models/FriendlyMatchesRulesModel';
import { Op } from 'sequelize';
import MatchEvaluation from '../models/FriendlyMatchEvaluationModel';
import FriendlyMatchCard from '../models/FriendlyMatchCardModel';
import FriendlyMatchGoal from '../models/FriendlyMatchGoalModel';
import FriendlyMatchPenalty from '../models/FriendlyMatchPenaltyModel';
import MatchReport from '../models/FriendlyMatchReportModel';
import { 
  updateAllMatchStatuses,
  checkAndSetMatchesInProgress,
  checkAndConfirmFullMatches,
  checkAndStartConfirmedMatches,
  checkAndSetSemVagas
} from '../services/FriendlyMatchStatusService';

require('dotenv').config(); 

interface UserWithType extends User {
  userTypeId: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

const parseDurationToMinutes = (duration?: string): number => {
  if (!duration) return 90;
  const minutes = parseInt(duration, 10);
  return isNaN(minutes) || minutes <= 0 ? 90 : minutes;
};

const computeMatchEnd = (startDate: Date, duration?: string): Date => {
  const minutes = parseDurationToMinutes(duration);
  return new Date(startDate.getTime() + minutes * 60000);
};

export const checkAndCancelMatchesWithInsufficientTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const matches = await FriendlyMatchesModel.findAll({
      where: { status: 'aberta' },
      include: [{
        model: FriendlyMatchesRulesModel,
        as: 'rules',
        where: {
          registrationDeadline: { [Op.lt]: now }
        },
        required: true
      }]
    });

    const cancelledMatches = [];

    for (const match of matches) {
      const teamsCount = await FriendlyMatchTeamsModel.count({
        where: { matchId: match.id }
      });

      if (teamsCount < 2) {
        const cancelReason = teamsCount === 0 
          ? 'Nenhum time inscrito após prazo de inscrição'
          : 'Apenas um time inscrito após prazo de inscrição';
        
        await match.update({ status: 'cancelada' });
        
        cancelledMatches.push({
          id: match.id,
          title: match.title,
          teamsCount,
          reason: cancelReason
        });
      }
    }

    res.status(200).json({ 
      message: 'Verificação concluída com sucesso',
      cancelledCount: cancelledMatches.length,
      cancelled: cancelledMatches
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar partidas com times insuficientes' });
  }
};

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title, 
      description, 
      date, 
      time,
      duration, 
      location, 
      price, 
      matchType, 
      square,
      Cep,
      Uf
    } = req.body;

    if (!title?.trim() || !date || !location?.trim() || !matchType?.trim() || !square?.trim()) {
      res.status(400).json({ 
        message: 'Campos obrigatórios: título, data, localização, modalidade e nome da quadra' 
      });
      return;
    }

    let matchDate: Date;
    try {
      matchDate = new Date(date);
      
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          matchDate.setHours(hours, minutes, 0, 0);
        }
      }
      
      if (isNaN(matchDate.getTime())) {
        res.status(400).json({ message: 'Formato de data inválido' });
        return;
      }
    } catch (error) {
      res.status(400).json({ message: 'Formato de data inválido' });
      return;
    }

    if (matchDate <= new Date()) {
      res.status(400).json({ message: 'A data da partida deve ser futura' });
      return;
    }

    if (duration) {
      const durationNum = parseInt(duration);
      if (isNaN(durationNum) || durationNum <= 0) {
        res.status(400).json({ 
          message: 'Duração deve ser um número positivo de minutos' 
        });
        return;
      }
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user.id;

    const user = await User.findByPk(userId) as UserWithType | null;
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    const existingMatch = await FriendlyMatchesModel.findOne({
      where: {
        title: title.trim()
      }
    });

    if (existingMatch) {
      res.status(409).json({ 
        message: 'Já existe uma partida com este nome',
        hint: 'Escolha um nome diferente para criar uma nova partida'
      });
      return;
    }

    const safeCep = Cep?.replace(/\D/g, '') || '';
    const safeUf = Uf?.trim()?.toUpperCase() || '';
    const safeSquare = square?.trim() || '';
    const safePrice = price ? parseFloat(price) : 0;
    const safeDuration = duration ? parseInt(duration) : 90;

    const match = await FriendlyMatchesModel.create({
      title: title.trim(),
      description: description?.trim(),
      date: matchDate,
      duration: String(safeDuration),
      location: location.trim(),
      price: safePrice,
      organizerId: Number(userId),
      status: 'aberta',
      Uf: safeUf,
      square: safeSquare,
      matchType: matchType.trim(),
      Cep: safeCep
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ message: 'Erro ao criar partida amistosa' });
  }
};

export const listMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    await updateAllMatchStatuses();

    const matches = await FriendlyMatchesModel.findAll({
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: FriendlyMatchesRulesModel,
          as: 'rules',
          attributes: ['id', 'registrationDeadline', 'minimumAge', 'maximumAge', 'gender'],
          required: false
        },
        {
          model: FriendlyMatchTeamsModel,
          as: 'matchTeams',
          required: false,
          include: [
            {
              model: TeamModel,
              as: 'matchTeam',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'status',
        'description',
        'price',
        'organizerId',
        'duration',
        'square',
        'matchType',
        'Uf',
        'Cep'
      ],
      order: [['date', 'ASC']]
    });

    const payload = matches.map((match) => {
      const plainMatch = match.toJSON();
      return {
        id: plainMatch.id,
        title: plainMatch.title,
        date: plainMatch.date,
        location: plainMatch.location,
        status: plainMatch.status,
        description: plainMatch.description || '',
        price: plainMatch.price || 0,
        duration: plainMatch.duration || '90',
        square: plainMatch.square || '',
        matchType: plainMatch.matchType || '',
        Uf: plainMatch.Uf || '',
        Cep: plainMatch.Cep || '',
        organizerId: plainMatch.organizerId,
        organizer: plainMatch.organizer || null,
        registrationDeadline: plainMatch.rules?.registrationDeadline || null,
        countTeams: plainMatch.matchTeams?.length || 0,
        maxTeams: 2,
        matchTeams: plainMatch.matchTeams || []
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    console.error('Erro ao listar partidas amistosas:', error);
    res.status(500).json({ 
      message: 'Não foi possível carregar as partidas. Tente novamente mais tarde.',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erro desconhecido') : undefined
    });
  }
};
  
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    await checkAndSetMatchesInProgress();
    await checkAndConfirmFullMatches();
    await checkAndStartConfirmedMatches();
    await checkAndSetSemVagas();

    const match = await FriendlyMatchesModel.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: FriendlyMatchesRulesModel,
          as: 'rules',
          attributes: ['id', 'registrationDeadline', 'minimumAge', 'maximumAge', 'gender'],
          required: false
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'status',
        'description',
        'price',
        'organizerId',
        'duration',
        'Uf',
        'Cep',
        'square',
        'matchType'
      ]
    });
    
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    const countTeams = await FriendlyMatchTeamsModel.count({
      where: { matchId: req.params.id }
    });

    const registrationDeadlineValue = match.rules?.registrationDeadline 
      ? new Date(match.rules.registrationDeadline)
      : null;

    if (match.date) {
      const start = new Date(match.date);
      const end = computeMatchEnd(start, match.duration || undefined);
      const now = new Date();
      
      if (now >= end && match.status !== 'finalizada') {
        await match.update({ status: 'finalizada' });
        await match.reload();
      }
    }

    const matchDate = match.date ? new Date(match.date) : null;
    const now = new Date();
    const isPastDeadline = registrationDeadlineValue 
      ? now >= registrationDeadlineValue 
      : false;

    if (matchDate && 
        match.status !== 'cancelada' && 
        match.status !== 'finalizada' &&
        (now >= matchDate && isPastDeadline && countTeams < 2)) {
      await match.update({ status: 'cancelada' });
      await match.reload();
    }
    
    const dados = {
      id: match.id,
      title: match.title,
      date: match.date,
      location: match.location,
      status: match.status,
      description: match.description || '',
      price: match.price || 0,
      duration: match.duration || '90',
      square: match.square || '',
      matchType: match.matchType || '',
      Uf: match.Uf || '',
      Cep: match.Cep || '',
      organizerId: match.organizerId,
      organizer: match.organizer || null,
      countTeams,
      maxTeams: 2,
      registrationDeadline: registrationDeadlineValue || null
    };
    
    res.status(200).json(dados);
  } catch (error) {
    console.error('Erro ao buscar detalhes da partida:', error);
    res.status(500).json({ 
      message: 'Não foi possível carregar os detalhes da partida. Tente novamente mais tarde.',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erro desconhecido') : undefined
    });
  }
};

export const updateMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const match = await FriendlyMatchesModel.findByPk(id);
    
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (req.body.title) {
      const existingMatch = await FriendlyMatchesModel.findOne({
        where: {
          title: req.body.title.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingMatch) {
        res.status(409).json({ 
          message: 'Já existe uma partida com este nome',
          hint: 'Escolha um nome diferente para atualizar a partida'
        });
        return;
      }
    }

    if (req.body.date) {
      const newMatchDate = new Date(req.body.date);
      if (newMatchDate <= new Date()) {
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }
    }

    await match.update(req.body);

    const rules = await FriendlyMatchesRulesModel.findOne({ 
      where: { matchId: id } 
    });
    
    const registrationDeadlineValue = rules?.get('registrationDeadline');
    if (registrationDeadlineValue) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      const deadline = new Date(registrationDeadlineValue as string);
      deadline.setHours(23, 59, 59, 999);
      
      const teamsCount = await FriendlyMatchTeamsModel.count({
        where: { matchId: id }
      });

      await match.reload();

      const matchDate = new Date(match.date);

      if ((now > deadline && teamsCount < 2 && 
          (match.status === 'aberta' || match.status === 'sem_vagas' || match.status === 'confirmada')) ||
          (now >= matchDate && now > deadline && teamsCount < 2)) {
        if (match.status !== 'cancelada') {
          await match.update({ status: 'cancelada' });
        }
      } else if (now > deadline && teamsCount >= 2 && 
                 match.status !== 'finalizada' && match.status !== 'cancelada') {
        await match.update({ status: 'confirmada' });
      }
    }

    await match.reload();
    res.status(200).json(match.toJSON());
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar partida' });
  }
};

export const cancelMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await FriendlyMatchesModel.findByPk(req.params.id);
    
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    await match.update({ status: 'cancelada' });
    res.status(200).json({ message: 'Partida cancelada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar partida' });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = req.params.id;
    const userId = req.user?.id;
    const userTypeId = req.user?.userTypeId;

    const match = await FriendlyMatchesModel.findByPk(matchId);

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    // Verifica se o usuário é o organizador ou admin
    if (match.organizerId !== userId && userTypeId !== 1) {
      res.status(403).json({ message: 'Sem permissão para excluir esta partida' });
      return;
    }

    // Usar transaction para garantir consistência
    const transaction = await match.sequelize.transaction();

    try {
      // Remover todas as relações em ordem
      await MatchEvaluation.destroy({ where: { match_id: matchId }, transaction });
      await FriendlyMatchesRulesModel.destroy({ where: { matchId }, transaction });
      await FriendlyMatchTeamsModel.destroy({ where: { matchId }, transaction });
      await FriendlyMatchCard.destroy({ where: { match_id: matchId }, transaction });
      await FriendlyMatchGoal.destroy({ where: { match_id: matchId }, transaction });
      await FriendlyMatchPenalty.destroy({ where: { id_match: matchId }, transaction });
      await MatchReport.destroy({ where: { match_id: matchId }, transaction });

      // Finalmente, excluir a partida
      await match.destroy({ transaction });
      
      // Commit da transaction
      await transaction.commit();
      res.status(200).json({ message: 'Partida excluída com sucesso' });
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
    res.status(500).json({ 
      message: 'Erro ao excluir partida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const getMatchesByOrganizer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user.id;

    await updateAllMatchStatuses();

    const matches = await FriendlyMatchesModel.findAll({
      where: { organizerId: userId },
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: FriendlyMatchesRulesModel,
          as: 'rules',
          attributes: ['id', 'registrationDeadline'],
          required: false
        },
        {
          model: FriendlyMatchTeamsModel,
          as: 'matchTeams',
          required: false,
          include: [
            {
              model: TeamModel,
              as: 'matchTeam',
              attributes: ['id', 'name', 'primaryColor', 'secondaryColor'],
              required: false
            }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'status',
        'description',
        'price',
        'organizerId',
        'duration',
        'square',
        'matchType',
        'Uf',
        'Cep'
      ],
      order: [['date', 'ASC']]
    });

    const payload = matches.map((match) => {
      const plainMatch = match.toJSON();
      return {
        id: plainMatch.id,
        title: plainMatch.title,
        date: plainMatch.date,
        location: plainMatch.location,
        status: plainMatch.status,
        description: plainMatch.description || '',
        price: plainMatch.price || 0,
        duration: plainMatch.duration || '90',
        square: plainMatch.square || '',
        matchType: plainMatch.matchType || '',
        Uf: plainMatch.Uf || '',
        Cep: plainMatch.Cep || '',
        organizerId: plainMatch.organizerId,
        organizer: plainMatch.organizer || null,
        registrationDeadline: plainMatch.rules?.registrationDeadline || null,
        countTeams: plainMatch.matchTeams?.length || 0,
        maxTeams: 2,
        matchTeams: plainMatch.matchTeams || []
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    console.error('Erro ao buscar partidas do organizador:', error);
    res.status(500).json({ 
      message: 'Não foi possível carregar suas partidas. Tente novamente mais tarde.',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erro desconhecido') : undefined
    });
  }
};

export const getFilteredMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    await updateAllMatchStatuses();

    const { 
      status, 
      matchDateFrom, 
      registrationDateFrom, 
      searchMatches, 
      friendlyOnly, 
      myMatches,
      sort 
    } = req.query;

    const whereClause: any = {};

    if (status) {
      const statusArray = Array.isArray(status) ? status : status.toString().split(',');
      whereClause.status = { [Op.in]: statusArray };
    }

    if (myMatches === 'true' && (req as AuthRequest).user?.id) {
      whereClause.organizerId = (req as AuthRequest).user.id;
    }

    if (matchDateFrom) {
      const fromDate = new Date(matchDateFrom.toString());
      if (!isNaN(fromDate.getTime())) {
        whereClause.date = { [Op.gte]: fromDate };
      }
    }

    let rulesWhereClause: any = undefined;
    if (registrationDateFrom) {
      const fromDate = new Date(registrationDateFrom.toString());
      if (!isNaN(fromDate.getTime())) {
        rulesWhereClause = {
          registrationDeadline: { [Op.gte]: fromDate }
        };
      }
    }

    if (searchMatches) {
      const searchTerm = searchMatches.toString().toLowerCase();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { location: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    let order: any = [['date', 'ASC']];
    if (sort) {
      switch (sort.toString()) {
        case 'date_desc':
          order = [['date', 'DESC']];
          break;
        case 'date_asc':
          order = [['date', 'ASC']];
          break;
        default:
          order = [['date', 'ASC']];
      }
    }

    const matches = await FriendlyMatchesModel.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: FriendlyMatchesRulesModel,
          as: 'rules',
          attributes: ['id', 'registrationDeadline'],
          required: !!rulesWhereClause,
          where: rulesWhereClause
        },
        {
          model: FriendlyMatchTeamsModel,
          as: 'matchTeams',
          required: false,
          include: [
            {
              model: TeamModel,
              as: 'matchTeam',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'status',
        'description',
        'price',
        'organizerId',
        'duration',
        'square',
        'matchType',
        'Uf',
        'Cep'
      ],
      order
    });

    const payload = matches.map((match) => {
      const plainMatch = match.toJSON();
      return {
        id: plainMatch.id,
        title: plainMatch.title,
        date: plainMatch.date,
        location: plainMatch.location,
        status: plainMatch.status,
        description: plainMatch.description || '',
        price: plainMatch.price || 0,
        duration: plainMatch.duration || '90',
        square: plainMatch.square || '',
        matchType: plainMatch.matchType || '',
        Uf: plainMatch.Uf || '',
        Cep: plainMatch.Cep || '',
        organizerId: plainMatch.organizerId,
        organizer: plainMatch.organizer || null,
        registrationDeadline: plainMatch.rules?.registrationDeadline || null,
        countTeams: plainMatch.matchTeams?.length || 0,
        maxTeams: 2,
        matchTeams: plainMatch.matchTeams || []
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    console.error('Erro ao buscar partidas filtradas:', error);
    res.status(500).json({ 
      message: 'Não foi possível carregar as partidas. Tente novamente mais tarde.',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Erro desconhecido') : undefined
    });
  }
};
