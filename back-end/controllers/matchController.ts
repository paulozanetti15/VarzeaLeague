import MatchReport from '../models/MatchReportModel';
import MatchCard from '../models/MatchCardModel';
import MatchGoal from '../models/MatchGoalModel';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchModel from '../models/MatchModel';
import User from '../models/UserModel';
import jwt from 'jsonwebtoken';
import MatchTeamsModel from '../models/MatchTeamsModel';
import Rules from '../models/RulesModel';


export const getPendingSummaryMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: 'Não autenticado' }); return; }
    const matches = await MatchModel.findAll({
      where: { status: 'completed' },
      include: [
        {
          model: MatchReport,
          required: false,
          where: { created_by: userId }
        }
      ]
    });
    const pending = matches.filter((m: any) => !m.MatchReports || m.MatchReports.length === 0);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar partidas pendentes' });
  }
};
import { Op } from 'sequelize';

export const autoCompleteMatches = async (): Promise<void> => {
  const now = new Date();
  const matches = await MatchModel.findAll({
    where: {
      status: 'in_progress',
      date: { [Op.lte]: new Date(now.getTime() - 1000 * 60 * 5) }
    }
  });
  for (const match of matches) {
    const startDate = new Date(match.date);
  const duration = Number(match.duration) || 90; 
  const endDate = new Date(startDate.getTime() + duration * 60000);
    if (now >= endDate) {
      match.status = 'completed';
      await match.save();
    }
  }
};

export const finalizeReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = req.params.id;
    const { goals, yellowCards, redCards } = req.body;
    await MatchReport.create({
      match_id: matchId,
      team1_score: goals, 
      team2_score: 0, 
      created_by: req.user?.id || null,
    });
    for (let i = 0; i < goals; i++) {
      await MatchGoal.create({
        match_id: matchId,
        user_id: req.user?.id || null,
      });
    }
    for (let i = 0; i < yellowCards; i++) {
      await MatchCard.create({
        match_id: matchId,
        user_id: req.user?.id || null,
        card_type: 'yellow',
      });
    }
    for (let i = 0; i < redCards; i++) {
      await MatchCard.create({
        match_id: matchId,
        user_id: req.user?.id || null,
        card_type: 'red',
      });
    }
    res.status(201).json({ message: 'Relatório salvo com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    res.status(500).json({ message: 'Erro ao salvar relatório' });
  }
};

interface UserWithType extends User {
  userTypeId: number;
}

require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
   try {
      const { title, description, date, location, complement, price, Uf, Cep, duration } = req.body;
      
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

      // Verificar se o usuário está autenticado
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const userId = req.user.id;

      // Verificar se o usuário existe
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
        status: 'open',
        Uf: Uf,
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
        'duration'
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
        'Cep'
      ]
    });
    const countTeams = await MatchTeamsModel.count({
      where: {
        matchId: req.params.id
      }
    })
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    const MaxTeams= await Rules.findOne({
      where: {
        partidaId: req.params.id
      }
    })
    const dados={
       ...match.toJSON(),
      countTeams: countTeams,
      maxTeams: MaxTeams.dataValues.quantidade_times
    }
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
