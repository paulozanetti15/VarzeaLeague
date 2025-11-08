import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import User from '../models/UserModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import TeamModel from '../models/TeamModel';
import FriendlyMatchesRulesModel from '../models/FriendlyMatchesRulesModel';
import { Op } from 'sequelize';
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
      location, 
      price, 
      UF, 
      Cep, 
      duration, 
      square,
      matchType, 
      cep, 
      number,
      complement 
    } = req.body;

    if (!title || !date || !location) {
      res.status(400).json({ 
        message: 'Campos obrigatórios faltando: título, data e localização são obrigatórios' 
      });
      return;
    }

    let matchDate: Date;
    try {
      if (date.includes('-')) {
        matchDate = new Date(date);
      } else {
        const [day, month, year] = date.split('/').map(Number);
        matchDate = new Date(year, month - 1, day);
      }
      
      if (isNaN(matchDate.getTime())) {
        res.status(400).json({ 
          message: 'Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD' 
        });
        return;
      }
    } catch (error) {
      res.status(400).json({ 
        message: 'Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD' 
        });
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

    if (!matchType?.trim()) {
      res.status(400).json({ message: 'Modalidade é obrigatória' });
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

    const fullLocation = complement ? `${location} - ${complement}` : location;
    const safeSquare = (square || 'Não informado').toString();
    const safeCep = (Cep || cep || '00000-000').toString();
    const safeUf = (UF || 'XX').toString();
    const safeNumber = (number || '').toString();
    console.log(req.body)
    const match = await FriendlyMatchesModel.create({
      title: title.trim(),
      description: description?.trim(),
      date: matchDate,
      duration: duration ? String(duration) : null,
      location: fullLocation,
      number: safeNumber,
      complement: complement?.trim() || '',
      price: price || null,
      organizerId: Number(userId),
      status: 'aberta',
      Uf: safeUf,
      square: safeSquare,
      matchType: matchType.trim(),
      Cep: safeCep
    });    res.status(201).json(match);
  } catch (error) {
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
          attributes: ['id', 'name', 'email']
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
          include: [
            {
              model: TeamModel,
              as: 'matchTeam',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'number',
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
        ...plainMatch,
        registrationDeadline: plainMatch.rules?.registrationDeadline || null,
        countTeams: plainMatch.matchTeams?.length || 0,
        maxTeams: 2
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    console.error('Erro ao listar partidas amistosas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas amistosas' });
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
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'number',
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

    if (match.date) {
      const start = new Date(match.date);
      const end = computeMatchEnd(start, match.duration || undefined);
      const now = new Date();
      
      if (now >= end && match.status !== 'finalizada') {
        await match.update({ status: 'finalizada' });
        await match.reload();
      }
    }
    
    const countTeams = await FriendlyMatchTeamsModel.count({
      where: { matchId: req.params.id }
    });
    
    const rules = await FriendlyMatchesRulesModel.findOne({
      where: { matchId: req.params.id }
    });

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    const registrationDeadlineValue = rules?.get('registrationDeadline');
    const deadline = registrationDeadlineValue 
      ? new Date(registrationDeadlineValue as string)
      : null;
    
    if (deadline) {
      deadline.setHours(23, 59, 59, 999);
    }
    
    const isPastDeadline = deadline ? now > deadline : false;
    const matchDate = new Date(match.date);

    if ((isPastDeadline && countTeams < 2 && (match.status === 'aberta' || match.status === 'sem_vagas')) ||
        (now >= matchDate && isPastDeadline && countTeams < 2)) {
      await match.update({ status: 'cancelada' });
      await match.reload();
    }
    
    const dados = {
      ...match.toJSON(),
      countTeams,
      maxTeams: 2,
      registrationDeadline: registrationDeadlineValue || null
    };
    
    res.status(200).json(dados);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar detalhes da partida' });
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

export const deleteMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = req.params.id;
    const match = await FriendlyMatchesModel.findByPk(matchId);

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    const MatchEvaluation = require('../models/MatchEvaluationModel').default;
    
    await MatchEvaluation.destroy({
      where: { match_id: matchId }
    });

    await FriendlyMatchesRulesModel.destroy({
      where: { matchId: matchId }
    });

    await FriendlyMatchTeamsModel.destroy({
      where: { matchId: matchId }
    });

    await match.destroy();

    res.status(200).json({ message: 'Partida excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir partida' });
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
          attributes: ['id', 'name', 'email']
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
          include: [
            {
              model: TeamModel,
              as: 'matchTeam',
              attributes: ['id', 'name', 'primaryColor', 'secondaryColor']
            }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'number',
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
        ...plainMatch,
        registrationDeadline: plainMatch.rules?.registrationDeadline || null
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar partidas do organizador' });
  }
};

export const getFilteredMatches = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (myMatches === 'true' && req.user?.id) {
      whereClause.organizerId = req.user.id;
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
          attributes: ['id', 'name', 'email']
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
          include: [
            {
              model: TeamModel,
              as: 'matchTeam',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      attributes: [
        'id',
        'title',
        'date',
        'location',
        'number',
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
        ...plainMatch,
        registrationDeadline: plainMatch.rules?.registrationDeadline || null
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar partidas filtradas' });
  }
};
