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
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      
      if (!nome || !sexo || !ano || !posicao) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
      }

      const normalizedName = nome.trim().toLowerCase();

      const existingLinkedPlayer = await Player.findOne({
        where: { 
          name: normalizedName,
          isDeleted: false
        },
        include: [
          {
            model: TeamPlayer,
            as: 'teamPlayers',
            required: true,
            attributes: ['id', 'teamId']
          }
        ]
      });

      if (existingLinkedPlayer) {
        res.status(409).json({ message: `Já existe um jogador com o nome "${nome}" vinculado a outro time` });
        return;
      }

      let player = await Player.findOne({
        where: { 
          name: normalizedName,
          isDeleted: false
        },
        include: [
          {
            model: TeamPlayer,
            as: 'teamPlayers',
            required: false,
            attributes: ['id']
          }
        ]
      });

      if (!player) {
        player = await Player.create({
          name: normalizedName,
          gender: sexo,
          year: ano,
          position: posicao,
          isDeleted: false
        });
      }

      if (teamId) {
        const team = await Team.findByPk(teamId);
        
        if (!team) {
          res.status(404).json({ message: 'Time não encontrado' });
          return;
        }
        
        if (team.captainId !== userId) {
          res.status(403).json({ message: 'Apenas o capitão pode adicionar jogadores ao time' });
          return;
        }

        const existingTeamPlayer = await TeamPlayer.findOne({
          where: {
            teamId,
            playerId: player.id
          }
        });

        if (existingTeamPlayer) {
          res.status(409).json({ message: 'Jogador já está vinculado a este time' });
          return;
        }

        await TeamPlayer.create({
          teamId,
          playerId: player.id
        });
      }

      res.status(201).json({
        id: player.id,
        nome: player.name,
        sexo: player.gender,
        ano: player.year,
        posicao: player.position,
        isDeleted: player.isDeleted
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar jogador' });
    }
  }

  static async addToTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, playerId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const team = await Team.findByPk(teamId);
      
      if (!team) {
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }
      
      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode adicionar jogadores ao time' });
        return;
      }

      const existingTeamPlayer = await TeamPlayer.findOne({
        where: {
          teamId,
          playerId
        }
      });

      if (existingTeamPlayer) {
        res.status(409).json({ message: 'Jogador já está vinculado a este time' });
        return;
      }

      await TeamPlayer.create({
        teamId,
        playerId
      });

      res.status(201).json({ message: 'Jogador adicionado ao time com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao adicionar jogador ao time' });
    }
  }

  static async getPlayersFromTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

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
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }

      const playersResponse = team.players?.map((p: any) => ({
        id: p.id,
        nome: p.name,
        sexo: p.gender,
        ano: p.year,
        posicao: p.position,
        isDeleted: p.isDeleted
      })) || [];

      res.status(200).json(playersResponse);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar jogadores do time' });
    }
  }

  static async removeFromTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, playerId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const team = await Team.findByPk(teamId);
      
      if (!team) {
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }
      
      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode remover jogadores do time' });
        return;
      }

      const deleted = await TeamPlayer.destroy({
        where: {
          teamId,
          playerId
        }
      });

      if (deleted === 0) {
        res.status(404).json({ message: 'Jogador não encontrado no time' });
        return;
      }

      res.status(200).json({ message: 'Jogador removido do time com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover jogador do time' });
    }
  }
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const team = await Team.findByPk(id);
      
      if (!team) {
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }
      
      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode atualizar jogadores do time' });
        return;
      }

      const playersToUpdate = req.body.jogadores;
      
      if (!playersToUpdate || !Array.isArray(playersToUpdate)) {
        res.status(400).json({ message: 'Lista de jogadores inválida' });
        return;
      }

      const updatedPlayers = [];
      const errors = [];

      for (const jogador of playersToUpdate) {
        try {
          if (!jogador.nome || !jogador.sexo || !jogador.ano || !jogador.posicao) {
            errors.push({
              jogador,
              erro: 'Todos os campos são obrigatórios (nome, sexo, ano, posicao)'
            });
            continue;
          }

          const normalizedName = jogador.nome.trim().toLowerCase();
          
          if (!jogador.id) {
            const existingPlayer = await Player.findOne({
              where: { 
                name: normalizedName,
                isDeleted: false
              }
            });

            if (existingPlayer) {
              const existingTeamLink = await TeamPlayer.findOne({
                where: {
                  playerId: existingPlayer.id
                },
                include: [
                  {
                    model: Team,
                    as: 'team',
                    attributes: ['id', 'name']
                  }
                ]
              });

              if (existingTeamLink) {
                errors.push({
                  jogador,
                  erro: `O jogador "${jogador.nome}" já está cadastrado e vinculado a outro time`
                });
                continue;
              } else {
                const existingTeamLinkSameTeam = await TeamPlayer.findOne({
                  where: {
                    teamId: Number(id),
                    playerId: existingPlayer.id
                  }
                });

                if (existingTeamLinkSameTeam) {
                  errors.push({
                    jogador,
                    erro: `O jogador "${jogador.nome}" já está vinculado a este time`
                  });
                  continue;
                }

                await TeamPlayer.create({
                  teamId: Number(id),
                  playerId: existingPlayer.id
                });
                
                updatedPlayers.push({
                  id: existingPlayer.id,
                  nome: existingPlayer.name,
                  sexo: existingPlayer.gender,
                  ano: existingPlayer.year,
                  posicao: existingPlayer.position,
                  isDeleted: existingPlayer.isDeleted
                });
                continue;
              }
            }

            const player = await Player.create({
              name: normalizedName,
              gender: jogador.sexo,
              year: jogador.ano,
              position: jogador.posicao,
              isDeleted: false  
            });

            await TeamPlayer.create({
              teamId: Number(id),
              playerId: player.id
            });

            updatedPlayers.push({
              id: player.id,
              nome: player.name,
              sexo: player.gender,
              ano: player.year,
              posicao: player.position,
              isDeleted: player.isDeleted
            });

          } else {
            const playerToUpdate = await Player.findByPk(jogador.id);
            
            if (!playerToUpdate) {
              errors.push({
                jogador,
                erro: `Jogador com ID ${jogador.id} não encontrado`
              });
              continue;
            }

            const nomeAtualNormalizado = playerToUpdate.name.trim().toLowerCase();

            if (normalizedName !== nomeAtualNormalizado) {
              const existingPlayerWithSameName = await Player.findOne({
                where: { 
                  name: normalizedName,
                  id: { [Op.ne]: jogador.id },
                  isDeleted: false
                }
              });

              if (existingPlayerWithSameName) {
                errors.push({
                  jogador,
                  erro: `Não é possível alterar para "${jogador.nome}" pois já existe um jogador cadastrado com este nome`
                });
                continue;
              }

              const existingLinkedPlayer = await Player.findOne({
                where: { 
                  name: normalizedName,
                  id: { [Op.ne]: jogador.id },
                  isDeleted: false
                },
                include: [
                  {
                    model: TeamPlayer,
                    as: 'teamPlayers',
                    required: true,
                    where: {
                      teamId: { [Op.ne]: Number(id) }
                    },
                    attributes: ['id', 'teamId']
                  }
                ]
              });

              if (existingLinkedPlayer) {
                errors.push({
                  jogador,
                  erro: `Já existe outro jogador com o nome "${jogador.nome}" vinculado a outro time`
                });
                continue;
              }
            }

            await playerToUpdate.update({
              name: normalizedName,
              gender: jogador.sexo,
              year: jogador.ano,
              position: jogador.posicao
            });

            updatedPlayers.push({
              id: playerToUpdate.id,
              nome: playerToUpdate.name,
              sexo: playerToUpdate.gender,
              ano: playerToUpdate.year,
              posicao: playerToUpdate.position,
              isDeleted: playerToUpdate.isDeleted
            });
          }
        } catch (error) {
          errors.push({
            jogador,
            erro: 'Erro ao processar jogador'
          });
        }
      }

      if (errors.length > 0) {
        res.status(400).json({ 
          error: 'Alguns jogadores não puderam ser processados', 
          details: { errors, success: updatedPlayers } 
        });
        return;
      }

      res.status(200).json({ 
        message: 'Jogadores atualizados com sucesso',
        players: updatedPlayers 
      });

    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar jogadores' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const player = await Player.findByPk(id);
      
      if (!player) {
        res.status(404).json({ message: 'Jogador não encontrado' });
        return;
      }

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
        res.status(403).json({ message: 'Apenas o capitão do time pode excluir o jogador' });
        return;
      }

      await player.update({ isDeleted: true });

      res.status(200).json({ message: 'Jogador excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir jogador' });
    }
  }

} 