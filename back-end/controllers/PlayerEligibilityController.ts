import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PlayerEligibilityService from '../services/PlayerEligibilityService';
import PlayerSuspension from '../models/PlayerSuspensionModel';
import Player from '../models/PlayerModel';
import Championship from '../models/ChampionshipModel';

class PlayerEligibilityController {
  static async checkEligibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { playerId, matchId } = req.params;
      const { isChampionship } = req.query;

      if (!playerId || !matchId) {
        res.status(400).json({ error: 'playerId e matchId são obrigatórios' });
        return;
      }

      const result = await PlayerEligibilityService.checkPlayerEligibility(
        Number(playerId),
        Number(matchId),
        isChampionship === 'true'
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao verificar elegibilidade:', error);
      res.status(500).json({ error: 'Erro ao verificar elegibilidade do jogador' });
    }
  }

  static async getSuspensionHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { championshipId } = req.query;

      if (!playerId) {
        res.status(400).json({ error: 'playerId é obrigatório' });
        return;
      }

      const history = await PlayerEligibilityService.getPlayerSuspensionHistory(
        Number(playerId),
        championshipId ? Number(championshipId) : null
      );

      res.status(200).json(history);
    } catch (error: any) {
      console.error('Erro ao buscar histórico de suspensões:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico de suspensões' });
    }
  }

  static async createManualSuspension(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user || (user.userTypeId !== 1 && user.userTypeId !== 2)) {
        res.status(403).json({ error: 'Sem permissão para criar suspensão manual' });
        return;
      }

      const { playerId, championshipId, gamesToSuspend, notes } = req.body;

      if (!playerId || !gamesToSuspend) {
        res.status(400).json({ error: 'playerId e gamesToSuspend são obrigatórios' });
        return;
      }

      const suspension = await PlayerEligibilityService.createSuspension(
        Number(playerId),
        championshipId ? Number(championshipId) : null,
        'manual',
        0,
        Number(gamesToSuspend),
        notes || 'Suspensão manual aplicada por administrador'
      );

      res.status(201).json({
        message: 'Suspensão criada com sucesso',
        suspension,
      });
    } catch (error: any) {
      console.error('Erro ao criar suspensão:', error);
      res.status(500).json({ error: 'Erro ao criar suspensão' });
    }
  }

  static async getActiveSuspension(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { championshipId } = req.query;

      if (!playerId) {
        res.status(400).json({ error: 'playerId é obrigatório' });
        return;
      }

      const suspension = await PlayerEligibilityService.getActiveSuspension(
        Number(playerId),
        championshipId ? Number(championshipId) : null
      );

      if (!suspension) {
        res.status(200).json({ suspended: false });
        return;
      }

      res.status(200).json({
        suspended: true,
        suspension,
      });
    } catch (error: any) {
      console.error('Erro ao buscar suspensão ativa:', error);
      res.status(500).json({ error: 'Erro ao buscar suspensão ativa' });
    }
  }

  static async getAllSuspensions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user || (user.userTypeId !== 1 && user.userTypeId !== 2)) {
        res.status(403).json({ error: 'Sem permissão para visualizar suspensões' });
        return;
      }

      const suspensions = await PlayerSuspension.findAll({
        include: [
          {
            model: Player,
            as: 'player',
            attributes: ['id', 'nome'],
          },
          {
            model: Championship,
            as: 'championship',
            attributes: ['id', 'nome'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
      });

      res.status(200).json(suspensions);
    } catch (error: any) {
      console.error('Erro ao buscar todas as suspensões:', error);
      res.status(500).json({ error: 'Erro ao buscar suspensões' });
    }
  }
}

export default PlayerEligibilityController;
