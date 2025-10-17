import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchModel from '../models/MatchModel';
import User from '../models/UserModel';
import jwt from 'jsonwebtoken';
import MatchTeamsModel from '../models/MatchTeamsModel';
import TeamModel from "../models/TeamModel"
import Rules from '../models/RulesModel';
import { Op } from 'sequelize';

interface UserWithType extends User {
  userTypeId: number;
}

require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const checkAndCancelMatchesWithInsufficientTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
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
          status: 'cancelada',
          description: match.description 
            ? `${match.description}\n\n[CANCELADA: ${cancelReason}]`
            : `[CANCELADA: ${cancelReason}]`
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
      const { title, description, date, location, complement, price, Uf, Cep, duration,namequadra,modalidade } = req.body;
      console.log(req.body); 
      if (!title || !date || !location) {
        res.status(400).json({ message: 'Campos obrigatórios faltando' });
        return;
      }

      const matchDate = new Date(date);
      if (matchDate <= new Date()) {
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }

      if (duration) {
        const durationRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
        if (!durationRegex.test(duration)) {
          res.status(400).json({ message: 'Formato de duração inválido. Use HH:MM' });
          return;
        }
        const [hours, minutes] = duration.split(':').map(Number);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          res.status(400).json({ message: 'Duração inválida' });
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

      const match = await MatchModel.create({
        title: title.trim(),
        description: description?.trim(),
        date: matchDate,
        duration: duration,
        location: fullLocation,
        price: price || null,
        organizerId: userId,
        status: 'aberta',
        Uf: Uf,
        nomequadra: namequadra,
        modalidade: modalidade,
        Cep: Cep
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
    const matches = await MatchModel.findAll({
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email']
        },
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
        'nomequadra',
        'modalidade',
      ],
      order: [['date', 'ASC']]
    });
    matches.map(async (match: any) => {
      const organizer = {
        id: match.organizerId,
        name: match.organizerName
      };
      return {
        ...match,
        organizer,
      };
    });
    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
};
  
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
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
    const isPastDeadline = MaxTeams?.dataValues?.dataLimite 
      ? new Date(MaxTeams.dataValues.dataLimite) < now 
      : false;

    if (isPastDeadline && countTeams < 2 && match.status === 'aberta') {
      const cancelReason = countTeams === 0 
        ? 'Nenhum time inscrito após prazo de inscrição'
        : 'Apenas um time inscrito após prazo de inscrição';
      
      await match.update({ 
        status: 'cancelada',
        description: match.description 
          ? `${match.description}\n\n[CANCELADA: ${cancelReason}]`
          : `[CANCELADA: ${cancelReason}]`
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
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    await match.update(req.body);
    res.json(match);
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
export const getMatchesByTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const rows = await MatchTeamsModel.findAll({
      where: { teamId: id },
      include: [
        {
          model: MatchModel,
          as: 'match',
          attributes: ['id', 'title', 'date', 'location']
        }
      ],
      order: [[{ model: MatchModel as any, as: 'match' } as any, 'date', 'ASC']]
    });

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar partidas por time:', error);
    res.status(500).json({ message: 'Erro ao listar partidas por time' });
  }
}
 