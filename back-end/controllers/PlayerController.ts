import { Request, Response } from 'express';
import Player from '../models/PlayerModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import { AuthRequest } from '../middleware/auth';
import { where, Op } from 'sequelize';

export class PlayerController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nome, sexo, ano, posicao, teamId } = req.body;
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      console.log(req.body)
      
      // Verificar se já existe um jogador com o mesmo nome
      if (nome) {
        const existingPlayer = await Player.findOne({
          where: { 
            nome: nome,
            isDeleted: false
          }
        });
      
        if (existingPlayer) {
          res.status(400).json({ error: `Já existe um jogador com o nome "${nome}"` });
          return;
        }
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
          playerId: player.id
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
        playerId
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

      // Busca o jogador atual para comparar nomes
      const currentPlayer = await Player.findByPk(id);
      if (!currentPlayer) {
        res.status(404).json({ error: 'Jogador não encontrado' });
        return;
      }

      // Se o nome está sendo alterado, verifica se já existe
      if (nome && nome !== currentPlayer.nome) {
        const nomeNormalizado = nome.trim().toLowerCase();
        const playerExists = await Player.findOne({
          where: {
            nome: nomeNormalizado,
            isDeleted: false
          }
        });

        if (playerExists) {
          res.status(400).json({ error: `Já existe um jogador com o nome "${nome}"` });
          return;
        }
      }

      // Verifica se o usuário é capitão de algum time que contenha este jogador
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

      

      // Se passou nas validações, atualiza o jogador
      await Player.update(
        {
          nome,
          sexo,
          ano,
          posicao
        },
        {
          where: { id, isDeleted: false }
        }
      );

      res.status(200).json({ message: 'Jogador atualizado com sucesso' });
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

  // Método para criar/atualizar múltiplos jogadores de uma vez (usado ao criar/editar times)
  static async batchCreateOrUpdate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, jogadores } = req.body;
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
        res.status(403).json({ error: 'Apenas o capitão pode gerenciar jogadores do time' });
        return;
      }

      const createdOrUpdatedPlayers = [];
      const errors = [];

      // Processar cada jogador
      for (const jogadorData of jogadores || []) {
        try {
          if (jogadorData.id) {
            // Atualizar jogador existente
            const player = await Player.findByPk(jogadorData.id);
            
            if (!player || player.isDeleted) {
              errors.push({ jogador: jogadorData, erro: 'Jogador não encontrado' });
              continue;
            }

            // Validar nome duplicado se estiver alterando o nome
            const nomeNormalizado = jogadorData.nome.trim().toLowerCase();
            const nomeAtualNormalizado = player.nome.trim().toLowerCase();
            
            if (nomeNormalizado !== nomeAtualNormalizado) {
              const duplicado = await Player.findOne({
                where: { 
                  nome: nomeNormalizado,
                  isDeleted: false,
                  id: { [Op.ne]: jogadorData.id }
                }
              });
              
              if (duplicado) {
                errors.push({ 
                  jogador: jogadorData, 
                  erro: `Já existe um jogador com o nome "${jogadorData.nome}"` 
                });
                continue;
              }
            }

            // Atualizar jogador
            await player.update({
              nome: jogadorData.nome,
              sexo: jogadorData.sexo,
              ano: jogadorData.ano,
              posicao: jogadorData.posicao
            });

            createdOrUpdatedPlayers.push(player);
          } else {
            // Criar novo jogador
            const nomeNormalizado = jogadorData.nome.trim().toLowerCase();
            
            // Validar nome duplicado
            const duplicado = await Player.findOne({
              where: { 
                nome: nomeNormalizado,
                isDeleted: false
              }
            });
            
            if (duplicado) {
              errors.push({ 
                jogador: jogadorData, 
                erro: `Já existe um jogador com o nome "${jogadorData.nome}"` 
              });
              continue;
            }

            // Criar jogador
            const newPlayer = await Player.create({
              nome: jogadorData.nome,
              sexo: jogadorData.sexo,
              ano: jogadorData.ano,
              posicao: jogadorData.posicao,
              isDeleted: false
            });

            // Associar ao time
            await TeamPlayer.create({
              teamId: teamId,
              playerId: newPlayer.id
            });

            createdOrUpdatedPlayers.push(newPlayer);
          }
        } catch (error) {
          console.error('Erro ao processar jogador:', error);
          errors.push({ jogador: jogadorData, erro: 'Erro ao processar jogador' });
        }
      }

      // Se houver erros, retornar com status 400
      if (errors.length > 0) {
        res.status(400).json({ 
          error: 'Alguns jogadores não puderam ser processados',
          errors: errors,
          success: createdOrUpdatedPlayers
        });
        return;
      }

      res.status(200).json({ 
        message: 'Jogadores processados com sucesso',
        players: createdOrUpdatedPlayers 
      });
    } catch (error) {
      console.error('Erro ao processar jogadores em lote:', error);
      res.status(500).json({ error: 'Erro ao processar jogadores em lote' });
    }
  }
} 