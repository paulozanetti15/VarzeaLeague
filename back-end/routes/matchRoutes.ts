import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Match from '../models/Match';
import User from '../models/User';

const router = express.Router();

// Criar uma nova partida
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, location, complement, maxPlayers, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    // Concatenar endereço e complemento, se existir
    const fullLocation = complement ? `${location} - ${complement}` : location;

    const match = await Match.create({
      title,
      description,
      date,
      location: fullLocation,
      maxPlayers,
      price,
      organizerId: userId,
      status: 'open'
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ message: 'Erro ao criar partida' });
  }
});

// Listar todas as partidas
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Listando partidas com SQL nativo...');
    
    // Usar SQL nativo para evitar problemas com associações
    const [matches] = await (Match.sequelize?.query(`
      SELECT 
        m.id, m.title, m.date, m.location, m.max_players as maxPlayers,
        m.status, m.description, m.price, m.organizer_id as organizerId,
        m.created_at as createdAt, m.updated_at as updatedAt,
        u.id as organizerId, u.name as organizerName, u.email as organizerEmail
      FROM 
        matches m
      LEFT JOIN 
        users u ON m.organizer_id = u.id
      ORDER BY 
        m.date ASC
    `) || []) as [any[], any];
    
    // Obter jogadores para cada partida
    const matchesWithPlayers = await Promise.all(
      matches.map(async (match: any) => {
        // Consulta SQL para obter os jogadores
        const [players] = await (Match.sequelize?.query(`
          SELECT 
            u.id, u.name, u.email
          FROM 
            users u
          JOIN 
            match_players mp ON u.id = mp.user_id
          WHERE 
            mp.match_id = ?
        `, {
          replacements: [match.id]
        }) || [[], null]) as [any[], any];
        
        // Formatar o objeto organizer
        const organizer = {
          id: match.organizerId,
          name: match.organizerName,
          email: match.organizerEmail
        };
        
        // Remover campos extras
        delete match.organizerName;
        delete match.organizerEmail;
        
        return {
          ...match,
          organizer,
          players: players || []
        };
      })
    );
    
    console.log(`Encontradas ${matches.length} partidas`);
    res.json(matchesWithPlayers);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ message: 'Erro ao listar partidas' });
  }
});

// Buscar uma partida específica
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Buscando partida com ID:', req.params.id);
    
    // Usar SQL nativo para evitar problemas com associações
    const [matches] = await (Match.sequelize?.query(`
      SELECT 
        m.id, m.title, m.date, m.location, m.max_players as maxPlayers,
        m.status, m.description, m.price, m.organizer_id as organizerId,
        m.created_at as createdAt, m.updated_at as updatedAt,
        u.id as organizerId, u.name as organizerName, u.email as organizerEmail
      FROM 
        matches m
      LEFT JOIN 
        users u ON m.organizer_id = u.id
      WHERE
        m.id = ?
    `, {
      replacements: [req.params.id]
    }) || []) as [any[], any];
    
    if (!matches || matches.length === 0) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    
    const match = matches[0] as {
      id: number;
      organizerId: number;
      organizerName: string;
      organizerEmail: string;
      [key: string]: any;
    };
    
    // Obter jogadores para a partida
    const [players] = await (Match.sequelize?.query(`
      SELECT 
        u.id, u.name, u.email
      FROM 
        users u
      JOIN 
        match_players mp ON u.id = mp.user_id
      WHERE 
        mp.match_id = ?
    `, {
      replacements: [match.id]
    }) || [[], null]) as [any[], any];
    
    // Formatar o objeto organizer
    const organizer = {
      id: match.organizerId,
      name: match.organizerName,
      email: match.organizerEmail
    };
    
    // Remover campos extras
    delete match.organizerName;
    delete match.organizerEmail;
    
    const matchWithPlayers = {
      ...match,
      organizer,
      players: players || []
    };
    
    console.log('Partida encontrada:', match.id);
    res.json(matchWithPlayers);
  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    res.status(500).json({ message: 'Erro ao buscar partida' });
  }
});

// Entrar em uma partida
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Tentando entrar na partida:', req.params.id);
    const match = await Match.findByPk(req.params.id);
    const userId = req.user?.id;

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (match.status !== 'open') {
      res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
      return;
    }

    const playerCount = await match.countPlayers();
    if (playerCount >= match.maxPlayers) {
      res.status(400).json({ message: 'Esta partida já está cheia' });
      return;
    }

    await match.addPlayer(userId);
    console.log('Usuário', userId, 'entrou na partida', match.id);
    res.json({ message: 'Inscrição realizada com sucesso' });
  } catch (error) {
    console.error('Erro ao entrar na partida:', error);
    res.status(500).json({ message: 'Erro ao entrar na partida' });
  }
});

// Sair de uma partida
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Tentando sair da partida:', req.params.id);
    const match = await Match.findByPk(req.params.id);
    const userId = req.user?.id;

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    // Remove o usuário da partida
    const user = await User.findByPk(userId);
    if (user) {
      await (match as any).removePlayers(user);
      console.log('Usuário', userId, 'saiu da partida', match.id);
      res.json({ message: 'Você saiu da partida com sucesso' });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao sair da partida:', error);
    res.status(500).json({ message: 'Erro ao sair da partida' });
  }
});

export default router; 