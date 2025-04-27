import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchModel from '../models/MatchModel';
import UserModel from '../models/UserModel';
import jwt from 'jsonwebtoken';
import { where } from 'sequelize';
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
// Criar uma nova partida
export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
   try {
      const { title, description, date, location, complement,price,Category } = req.body;
      // Validações básicas
      if (!title || !date || !location) {
        res.status(400).json({ message: 'Campos obrigatórios faltando' });
        return;
      }

      // Validar data futura
      const matchDate = new Date(date);
      if (matchDate <= new Date()) {
        res.status(400).json({ message: 'A data da partida deve ser futura' });
        return;
      }
      const token = req.headers.authorization?.replace('Bearer ', '');
      try {
        const decodedPayload = jwt.decode(token);
        console.log('Estrutura do token (sem verificação):', decodedPayload);
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
          categories:Category
        });

        // Atualizar tipo do usuário para organizador
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
        {
          model: UserModel,
          as: 'players',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
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
        'organizerId'
      ],
      order: [['date', 'ASC']]
    });
    matches.map(async (match: any) => {
        // Formatar o objeto organizer antes de trabalhar com jogadores
        const organizer = {
          id: match.organizerId,
          name: match.organizerName || 'Organizador desconhecido',
          email: match.organizerEmail || ''
        };
        
        // Remover campos extras
        delete match.organizerName;
        delete match.organizerEmail;
        
        // Verificar se a partida tem jogadores com a contagem que já foi feita na consulta
        const actualPlayerCount = parseInt(match.playerCount || '0', 10);
        delete match.playerCount; // Remover do objeto final
        
        console.log(`Partida ${match.id} (${match.title}): ${actualPlayerCount} jogadores registrados diretamente`);
        
        // Se não há jogadores no banco, pular as consultas detalhadas
        if (actualPlayerCount === 0) {
          console.log(`Partida ${match.id} não possui jogadores, pulando consultas detalhadas`);
          return {
            ...match,
            organizer,
            players: [],
            playerStats: {
              totalIndividualPlayers: 0,
              totalTeams: 0,
              totalTeamPlayers: 0,
              totalPlayers: 0,
              isEmpty: true
            }
          };
        }
      }	
    );
    console.log('Partidas:', matches);
    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
};
  
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    res.status(200).json(match);
  } catch (error) {
    console.error('Erro ao obter partida:', error);
    res.status(500).json({ message: 'Erro ao obter partida' });
  }
};

// Atualizar uma partida
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
