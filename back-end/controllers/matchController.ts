import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchModel from '../models/MatchModel';
import UserModel from '../models/UserModel';
import jwt from 'jsonwebtoken';
import MatchTeamsModel from '../models/MatchTeamsModel';
import Rules from '../models/RulesModel';
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
   try {
      const { title, description, date, location, complement,price,Uf,Cep } = req.body;
      if (!title || !date || !location) {
        res.status(400).json({ message: 'Campos obrigatórios faltando' });
        return;
      }
      const matchDate = new Date(date);
      if (matchDate <= new Date()) {
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }
      const token = req.headers.authorization?.replace('Bearer ', '');
      try {
        jwt.decode(token);
      } catch (decodeErr) {
        console.error('Erro ao decodificar token:', decodeErr);
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const userId = decoded.id;
        const fullLocation = complement ? `${location} - ${complement}` : location;
        const match = await MatchModel.create({
          title: title.trim(),
          description: description?.trim(),
          date: matchDate,
          location: fullLocation,
          price: price || null,
          organizerId: userId,
          status: 'open',
          Uf: Uf,
          Cep: Cep
        });
        await UserModel.update(
          { userTypeId: 2 }, 
          { 
            where: { id: userId },
            silent: true // Não dispara hooks
          }
        );

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
          model: UserModel,
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
        'organizerId'
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
          model: UserModel,
          as: 'organizer',
          attributes: ['id', 'name']
        }
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

// Cancelar uma partida
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
