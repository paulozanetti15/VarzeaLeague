import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchModel from '../models/MatchModel';
import UserModel from '../models/UserModel';

// Criar uma nova partida
export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, date, location, complement, maxPlayers, description, price } = req.body;
    const organizerId = req.user?.id;
    
    if (!organizerId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const match = await MatchModel.create({
      title,
      date,
      location,
      complement,
      maxPlayers,
      description,
      price,
      organizerId
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ message: 'Erro ao criar partida' });
  }
   try {
      const { title, description, date, location, complement, maxPlayers, price } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      const fullLocation = complement ? `${location} - ${complement}` : location;
      const match = await MatchModel.create({
        title,
        description,
        date,
        location: fullLocation,
        maxPlayers,
        price,
        organizerId: userId,
        status: 'open'
      });
      await UserModel.update({ userTypeId:2 }, { where: { id: userId } });
      res.status(201).json(match);
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      res.status(500).json({ message: 'Erro ao criar partida' });
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
        'complement',
        'maxPlayers',
        'status',
        'description',
        'price',
        'organizerId',
        'createdAt',
        'updatedAt'
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
    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
};
  
      
 
      


// Obter detalhes de uma partida específica
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = await MatchModel.findByPk(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    res.json(match);
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