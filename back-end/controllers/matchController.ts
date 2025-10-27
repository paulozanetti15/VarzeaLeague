import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchModel from '../models/MatchModel';
import User from '../models/UserModel';
import jwt from 'jsonwebtoken';
import MatchTeamsModel from '../models/MatchTeamsModel';
import TeamModel from "../models/TeamModel"
import Rules from '../models/RulesModel';
import MatchChampionship from '../models/MatchChampionshipModel';
import { Op } from 'sequelize';

// Helper: parse duration string (minutes) into minutes
const parseDurationToMinutes = (duration?: string): number => {
  if (!duration) return 90; // default 1h30
  const minutes = parseInt(duration, 10);
  return isNaN(minutes) || minutes <= 0 ? 90 : minutes;
};

// Compute match end date from start date and duration
const computeMatchEnd = (startDate: Date, duration?: string): Date => {
  const minutes = parseDurationToMinutes(duration);
  return new Date(startDate.getTime() + minutes * 60000);
};

// Scan matches and set status to 'em_andamento' when current time is within [start, end)
export const checkAndSetMatchesInProgress = async (): Promise<void> => {
  try {
    const now = new Date();
    // find candidate matches that are not finalized or canceled (include em_andamento so we can finalize them)
    const candidates = await MatchModel.findAll({
      where: {
        status: { [Op.notIn]: ['finalizada', 'cancelada'] }
      }
    });

    for (const match of candidates) {
      if (!match.date) continue;
      const start = new Date((match as any).date);
      const end = computeMatchEnd(start, (match as any).duration);

      if (now >= start && now < end) {
        // Only update if not already em_andamento
        if (String((match as any).status) !== 'em_andamento') {
          await match.update({ status: 'em_andamento' });
        }
      }

      // Auto-finish matches that have passed their end time (finalize regardless of previous status)
      if (now >= end) {
        if (String((match as any).status) !== 'finalizada') {
          await match.update({ status: 'finalizada' });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar partidas em andamento:', error);
  }
};

// Confirm matches that are full (sem_vagas) after registration deadline
export const checkAndConfirmFullMatches = async (): Promise<void> => {
  try {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    // Consider matches in any status except finalized, cancelled or already confirmed
    const candidates = await MatchModel.findAll({
      where: {
        status: { [Op.notIn]: ['finalizada', 'cancelada', 'confirmada'] }
      },
      include: [{ model: Rules, as: 'rules', required: false }]
    });

    for (const match of candidates) {
      const regras = (match as any).rules;
      const deadlineRaw = regras?.dataLimite || regras?.dataValues?.dataLimite;
      if (!deadlineRaw) {
        // no deadline defined, skip
        continue;
      }

      const deadline = new Date(deadlineRaw);
      deadline.setHours(23, 59, 59, 999);

      if (now > deadline) {
        const matchId = (match as any).id;
        const teamsCount = await MatchTeamsModel.count({ where: { matchId } });
        const maxTimes = Number(regras?.dataValues?.quantidade_times ?? regras?.quantidade_times) || 2;

        if (teamsCount >= maxTimes) {
          if (String((match as any).status) !== 'confirmada') {
            await match.update({ status: 'confirmada' });
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao confirmar partidas cheias após prazo:', error);
  }
};

// Set matches to 'sem_vagas' when they have enough teams and the registration deadline hasn't passed
export const checkAndSetSemVagas = async (): Promise<void> => {
  try {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const candidates = await MatchModel.findAll({
      where: {
        status: { [Op.notIn]: ['finalizada', 'cancelada', 'sem_vagas'] }
      },
      include: [{ model: Rules, as: 'rules', required: false }]
    });

    for (const match of candidates) {
      const regras = (match as any).rules;
      const deadlineRaw = regras?.dataLimite || regras?.dataValues?.dataLimite;
      const hasDeadline = !!deadlineRaw;
      let deadline: Date | null = null;
      if (hasDeadline) {
        deadline = new Date(deadlineRaw as any);
        deadline.setHours(23, 59, 59, 999);
      }

      // If deadline exists and is already passed, skip setting sem_vagas here
      if (hasDeadline && now > deadline!) continue;

      const matchId = (match as any).id;
      const teamsCount = await MatchTeamsModel.count({ where: { matchId } });
      const maxTimes = Number(regras?.dataValues?.quantidade_times ?? regras?.quantidade_times) || 2;

      if (teamsCount >= maxTimes) {
        if (String((match as any).status) !== 'sem_vagas') {
          await match.update({ status: 'sem_vagas' });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao marcar partidas como sem_vagas:', error);
  }
};

// Start matches that are 'confirmada' when current time is within [start, end)
export const checkAndStartConfirmedMatches = async (): Promise<void> => {
  try {
    const now = new Date();
    const candidates = await MatchModel.findAll({
      where: { status: 'confirmada' }
    });

    for (const match of candidates) {
      if (!match.date) continue;
      const start = new Date((match as any).date);
      const end = computeMatchEnd(start, (match as any).duration);

      if (now >= start && now < end) {
        if (String((match as any).status) !== 'em_andamento') {
          await match.update({ status: 'em_andamento' });
        }
      }

      // If the confirmed match already passed its end, finalize it
      if (now >= end) {
        if (String((match as any).status) !== 'finalizada') {
          await match.update({ status: 'finalizada' });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao iniciar partidas confirmadas:', error);
  }
};

interface UserWithType extends User {
  userTypeId: number;
}

require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const checkAndCancelMatchesWithInsufficientTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const matches = await MatchModel.findAll({
      where: {
        status: 'aberta'
      },
      include: [{
        model: Rules,
        as: 'rules',
        where: {
          dataLimite: {
            [Op.lt]: now
          }
        },
        required: true
      }]
    });

    const cancelledMatches = [];

    for (const match of matches) {
      const teamsCount = await MatchTeamsModel.count({
        where: { matchId: match.id }
      });

      if (teamsCount < 2) {
        const cancelReason = teamsCount === 0 
          ? 'Nenhum time inscrito após prazo de inscrição'
          : 'Apenas um time inscrito após prazo de inscrição';
        
        await match.update({ 
          status: 'cancelada'
        });
        
        cancelledMatches.push({
          id: match.id,
          title: match.title,
          teamsCount,
          reason: cancelReason
        });
      }
    }

    res.json({ 
      message: 'Verificação concluída',
      cancelledCount: cancelledMatches.length,
      cancelled: cancelledMatches
    });
  } catch (error) {
    console.error('Erro ao verificar partidas:', error);
    res.status(500).json({ message: 'Erro ao verificar partidas com times insuficientes' });
  }
};

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
      const { title, description, date, location, complement, price, UF, Cep, duration, namequadra, modalidade, quadra, cep } = req.body;
      console.log(req.body); 
      if (!title || !date || !location) {
        res.status(400).json({ message: 'Campos obrigatórios faltando' });
        return;
      }

      let matchDate: Date;
      try {
        // Try parsing as ISO date first, then as BR format
        if (date.includes('-')) {
          matchDate = new Date(date);
        } else {
          // Parse dd/MM/yyyy format
          const [day, month, year] = date.split('/').map(Number);
          matchDate = new Date(year, month - 1, day);
        }
        
        if (isNaN(matchDate.getTime())) {
          res.status(400).json({ message: 'Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD' });
          return;
        }
      } catch (error) {
        res.status(400).json({ message: 'Formato de data inválido. Use DD/MM/YYYY ou YYYY-MM-DD' });
        return;
      }

      if (matchDate <= new Date()) {
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }

      if (duration) {
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
          res.status(400).json({ message: 'Duração deve ser um número positivo de minutos' });
          return;
        }
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const userId = req.user.id;

      
      const user = await User.findByPk(userId) as UserWithType | null;
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const fullLocation = complement ? `${location} - ${complement}` : location;

      // Provide safe defaults for fields that may be required at the DB level
      const safeNomeQuadra = (namequadra || quadra || 'Não informado').toString();
      const safeCep = (Cep || cep || '00000-000').toString();
      const safeUf = (UF || 'XX').toString();

      const match = await MatchModel.create({
        title: title.trim(),
        description: description?.trim(),
        date: matchDate,
        duration: duration ? String(duration) : null,
        location: fullLocation,
        price: price || null,
        organizerId: Number(userId),
        status: 'aberta',
        Uf: safeUf,
        nomequadra: safeNomeQuadra,
        modalidade: modalidade,
        Cep: safeCep
      });

      res.status(201).json(match);
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Erro ao criar partida',
          error: error.message 
        });
      } else {
        res.status(500).json({ message: 'Erro ao criar partida' });
      }
    }
};

export const listMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure statuses are up-to-date for matches that should be in progress
    await checkAndSetMatchesInProgress();
    // Confirm full matches after registration deadline
    await checkAndConfirmFullMatches();
  // Start confirmed matches when their start time arrives
  await checkAndStartConfirmedMatches();
    // Check and set matches to 'sem_vagas' when they reach maximum teams
    await checkAndSetSemVagas();

    const { from, to, status, search, sort, matchDateFrom, registrationDateFrom, searchMatches, searchChampionships, friendlyOnly, myMatches } = req.query;

    const whereClause: any = {};

    // Filtro por status
    if (status) {
      const statusArray = Array.isArray(status) ? status : status.toString().split(',');
      whereClause.status = { [Op.in]: statusArray };
    }

    // Filtro para partidas criadas pelo usuário logado
    if (myMatches === 'true') {
      const authReq = req as any;
      if (authReq.user && authReq.user.id) {
        whereClause.organizerId = authReq.user.id;
      }
    }

    // Filtro por data da partida
    if (matchDateFrom) {
      const fromDate = new Date(matchDateFrom.toString());
      if (!isNaN(fromDate.getTime())) {
        whereClause.date = { ...whereClause.date, [Op.gte]: fromDate };
      }
    }

    // Filtro por data de inscrição (através das regras)
    let rulesWhereClause: any = {};
    if (registrationDateFrom) {
      rulesWhereClause = { rules: {} };
      const fromDate = new Date(registrationDateFrom.toString());
      if (!isNaN(fromDate.getTime())) {
        rulesWhereClause.rules.dataLimite = { ...rulesWhereClause.rules.dataLimite, [Op.gte]: fromDate };
      }
    }

    // Filtro por busca (search)
    let searchWhereClause: any = {};
    if (searchMatches) {
      const searchTerm = searchMatches.toString().toLowerCase();
      searchWhereClause = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { location: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };
    }

    // Determinar ordenação
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

    // Determinar a condição where final
    const finalWhereClause = friendlyOnly === 'true' ? {
      ...whereClause,
      ...searchWhereClause,
      '$matchChampionship.id$': null // Apenas partidas que não têm associação com campeonato
    } : {
      ...whereClause,
      ...searchWhereClause
    };

    const matches = await MatchModel.findAll({
      where: finalWhereClause,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Rules,
          as: 'rules',
          attributes: ['dataLimite'],
          required: Object.keys(rulesWhereClause).length > 0,
          where: rulesWhereClause.rules || undefined
        },
        // Incluir MatchChampionship para filtrar partidas amistosas
        {
          model: MatchChampionship,
          as: 'matchChampionship',
          required: false,
          attributes: []
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
        'nomequadra',
        'modalidade',
      ],
      order
    });

    const payload = matches.map((match: any) => {
      const obj = match.toJSON ? match.toJSON() : match;
      return {
        ...obj,
        registrationDeadline: obj.rules ? obj.rules.dataLimite || null : null
      };
    });

    res.json(payload);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
};
  
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    // Update in-progress statuses before returning a single match
    await checkAndSetMatchesInProgress();
    await checkAndConfirmFullMatches();
  await checkAndStartConfirmedMatches();
    // Check and set matches to 'sem_vagas' when they reach maximum teams
    await checkAndSetSemVagas();
    const match = await MatchModel.findByPk(req.params.id,{
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
        'status',
        'description',
        'price',
        'organizerId',
        'duration',
        'Uf',
        'Cep',
        'nomequadra',
        'modalidade',
      ]
    });
    
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    // Extra safety: if match end time already passed, finalize it before returning
    try {
      if (match.date) {
        const start = new Date((match as any).date);
        const end = computeMatchEnd(start, (match as any).duration);
        const now = new Date();
        if (now >= end && String((match as any).status) !== 'finalizada') {
          await match.update({ status: 'finalizada' });
          await match.reload();
        }
      }
    } catch (err) {
      console.error('Erro ao verificar finalização da partida no getMatch:', err);
    }
    
    const countTeams = await MatchTeamsModel.count({
      where: {
        matchId: req.params.id
      }
    });
    
    const MaxTeams = await Rules.findOne({
      where: {
        partidaId: req.params.id
      }
    });

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    const deadline = MaxTeams?.dataValues?.dataLimite 
      ? new Date(MaxTeams.dataValues.dataLimite)
      : null;
    
    if (deadline) {
      deadline.setHours(23, 59, 59, 999);
    }
    
    const isPastDeadline = deadline ? now > deadline : false;

    if (isPastDeadline && countTeams < 2 && match.status === 'aberta') {
      await match.update({ 
        status: 'cancelada'
      });
      await match.reload();
    }
    
    const dados = {
      ...match.toJSON(),
      countTeams: countTeams,
      maxTeams: MaxTeams?.dataValues?.quantidade_times || 2,
      registrationDeadline: MaxTeams?.dataValues?.dataLimite || null
    };
    
    res.status(200).json(dados);
  } catch (error) {
    console.error('Erro ao obter partida:', error);
    res.status(500).json({ message: 'Erro ao obter partida' });
  }
};

export const updateMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const match = await MatchModel.findByPk(id);
    
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (req.body.date) {
      const newMatchDate = new Date(req.body.date);
      if (newMatchDate <= new Date()) {
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }
    }

    await match.update(req.body);

    const rules = await Rules.findOne({ where: { partidaId: id } });
    
    if (rules && rules.dataValues?.dataLimite) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      const deadline = new Date(rules.dataValues.dataLimite);
      deadline.setHours(23, 59, 59, 999);
      
      const teamsCount = await MatchTeamsModel.count({
        where: { matchId: id }
      });

      await match.reload();

      if (now > deadline) {
        if (teamsCount < 2 && (match.status === 'aberta' || match.status === 'sem_vagas')) {
          await match.update({ 
            status: 'cancelada'
          });
        } else if (teamsCount >= 2 && match.status !== 'finalizada' && match.status !== 'cancelada') {
          await match.update({
            status: 'confirmada'
          });
        }
      } else {
        if (match.status === 'cancelada') {
          await match.update({ 
            status: 'aberta'
          });
        }
      }
    }

    await match.reload();
    res.json(match.toJSON());
  } catch (error) {
    console.error('Erro ao atualizar partida:', error);
    res.status(500).json({ message: 'Erro ao atualizar partida' });
  }
};

export const cancelMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    await match.update({ status: 'cancelled' });
    res.json({ message: 'Partida cancelada' });
  } catch (error) {
    console.error('Erro ao cancelar partida:', error);
    res.status(500).json({ message: 'Erro ao cancelar partida' });
  }
};

export const deleteMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = req.params.id;
    const match = await MatchModel.findByPk(matchId);

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    const MatchEvaluation = require('../models/MatchEvaluationModel').default;
    
    await MatchEvaluation.destroy({
      where: { match_id: matchId }
    });

    await Rules.destroy({
      where: { partidaId: matchId }
    });

    await MatchTeamsModel.destroy({
      where: { matchId: matchId }
    });

    await match.destroy();

    res.status(200).json({ message: 'Partida excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
    res.status(500).json({ message: 'Erro ao excluir partida' });
  }
};
export const getMatchStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    // Verificar e atualizar status baseado na data/hora atual
    let updatedStatus = match.status;
    const now = new Date();

    if (match.date) {
      const start = new Date((match as any).date);
      const end = computeMatchEnd(start, (match as any).duration);

      // Se estiver confirmada e hora atual estiver dentro do intervalo -> em_andamento
      if (String(match.status) === 'confirmada' && now >= start && now < end) {
        updatedStatus = 'em_andamento';
        await match.update({ status: updatedStatus });
      }
      // Se estiver em_andamento ou confirmada e passou do fim -> finalizada
      else if ((String(match.status) === 'em_andamento' || String(match.status) === 'confirmada') && now >= end) {
        updatedStatus = 'finalizada';
        await match.update({ status: updatedStatus });
      }
    }

    res.status(200).json({
      id: match.id,
      status: updatedStatus
    });
  } catch (error) {
    console.error('Erro ao obter status da partida:', error);
    res.status(500).json({ message: 'Erro ao obter status da partida' });
  }
};
 