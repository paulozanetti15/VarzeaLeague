import { Request, Response } from 'express';
import Player from '../models/PlayerModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export class PlayerController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nome, sexo, ano, posicao, teamId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verificar se o time existe e se o usuário é o capitão
      if (teamId) {
        const team = await Team.findByPk(teamId);
        
        if (!team) {
          res.status(404).json({ error: 'Time não encontrado' });
          return;
        }
        
        if (team.captainId !== userId) {
          res.status(403).json({ error: 'Apenas o capitão pode adicionar jogadores ao time' });
          return;
        }
      }

      // Criar o jogador
      const player = await Player.create({
        nome,
        sexo,
        ano,
        posicao,
        isDeleted: false
      });

      // Se o teamId foi fornecido, adicionar o jogador ao time
      if (teamId) {
        await TeamPlayer.create({
          teamId,
          playerId: player.id,
          userId: null // Pode ser nulo se o jogador não estiver associado a um usuário do sistema
        });
      }

      res.status(201).json(player);
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      res.status(500).json({ error: 'Erro ao criar jogador' });
    }
  }

  static async addToTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, playerId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verificar se o time existe e se o usuário é o capitão
      const team = await Team.findByPk(teamId);
      
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }
      
      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode adicionar jogadores ao time' });
        return;
      }

      // Verificar se o jogador existe
      const player = await Player.findByPk(playerId);
      
      if (!player) {
        res.status(404).json({ error: 'Jogador não encontrado' });
        return;
      }

      // Verificar se o jogador já está no time
      const existingTeamPlayer = await TeamPlayer.findOne({
        where: {
          teamId,
          playerId
        }
      });

      if (existingTeamPlayer) {
        res.status(400).json({ error: 'Jogador já está no time' });
        return;
      }

      // Adicionar o jogador ao time
      await TeamPlayer.create({
        teamId,
        playerId,
        userId: null // Pode ser nulo se o jogador não estiver associado a um usuário do sistema
      });

      res.status(201).json({ message: 'Jogador adicionado ao time com sucesso' });
    } catch (error) {
      console.error('Erro ao adicionar jogador ao time:', error);
      res.status(500).json({ error: 'Erro ao adicionar jogador ao time' });
    }
  }

  static async getPlayersFromTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verificar se o time existe
      const team = await Team.findByPk(teamId, {
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { isDeleted: false }
          }
        ]
      });
      
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }

      res.json(team.players);
    } catch (error) {
      console.error('Erro ao buscar jogadores do time:', error);
      res.status(500).json({ error: 'Erro ao buscar jogadores do time' });
    }
  }

  static async removeFromTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, playerId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verificar se o time existe e se o usuário é o capitão
      const team = await Team.findByPk(teamId);
      
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }
      
      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode remover jogadores do time' });
        return;
      }

      // Remover o jogador do time
      const deleted = await TeamPlayer.destroy({
        where: {
          teamId,
          playerId
        }
      });

      if (deleted === 0) {
        res.status(404).json({ error: 'Jogador não encontrado no time' });
        return;
      }

      res.status(200).json({ message: 'Jogador removido do time com sucesso' });
    } catch (error) {
      console.error('Erro ao remover jogador do time:', error);
      res.status(500).json({ error: 'Erro ao remover jogador do time' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, sexo, ano, posicao } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verificar se o jogador existe
      const player = await Player.findByPk(id);
      
      if (!player) {
        res.status(404).json({ error: 'Jogador não encontrado' });
        return;
      }

      // Verificar se o usuário é capitão de algum time que contenha este jogador
      const teams = await Team.findAll({
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { id: id }
          }
        ],
        where: {
          captainId: userId
        }
      });

      if (teams.length === 0) {
        res.status(403).json({ error: 'Apenas o capitão do time pode atualizar os dados do jogador' });
        return;
      }

      // Atualizar o jogador
      await player.update({
        nome,
        sexo,
        ano,
        posicao
      });

      res.json(player);
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      res.status(500).json({ error: 'Erro ao atualizar jogador' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verificar se o jogador existe
      const player = await Player.findByPk(id);
      
      if (!player) {
        res.status(404).json({ error: 'Jogador não encontrado' });
        return;
      }

      // Verificar se o usuário é capitão de algum time que contenha este jogador
      const teams = await Team.findAll({
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { id: id }
          }
        ],
        where: {
          captainId: userId
        }
      });

      if (teams.length === 0) {
        res.status(403).json({ error: 'Apenas o capitão do time pode excluir o jogador' });
        return;
      }

      // Marcar o jogador como excluído, mas manter no banco
      await player.update({ isDeleted: true });

      res.status(200).json({ message: 'Jogador excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir jogador:', error);
      res.status(500).json({ error: 'Erro ao excluir jogador' });
    }
  }
} 