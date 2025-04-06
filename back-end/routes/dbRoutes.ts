import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Match from '../models/Match';
import MatchPlayer from '../models/match_players';
import User from '../models/User';

const router = express.Router();

// Rota para verificar e criar a tabela match_players
router.post('/create-match-players-table', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verificar se o usuário é administrador (exemplo)
    const userId = req.user?.id;
    if (!userId || userId !== 1) {
      res.status(403).json({ message: 'Permissão negada' });
      return;
    }

    // Criar a tabela match_players
    try {
      await MatchPlayer.sync({ force: false });
      
      // Executar consulta direta para garantir restrições
      await Match.sequelize?.query(`
        CREATE TABLE IF NOT EXISTS match_players (
          match_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (match_id, user_id),
          FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `);
      
      res.status(201).json({ message: 'Tabela match_players criada/verificada com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      res.status(500).json({ message: 'Erro ao criar tabela match_players' });
    }
  } catch (error) {
    console.error('Erro na rota:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 