import { Request, Response } from 'express';
import Player from '../models/PlayerModel';
import Team from '../models/TeamModel';
import TeamPlayer from '../models/TeamPlayerModel';
import { AuthRequest } from '../middleware/auth';
import { where, Op } from 'sequelize';

export class PlayerController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, gender, year, position, teamId } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      
      if (!name || !gender || !year || !position) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
      }

      const normalizedName = name.trim().toLowerCase();

      if (teamId) {
        const existingPlayerInSameTeam = await Player.findOne({
          where: { 
            name: normalizedName,
            isDeleted: false
          },
          include: [
            {
              model: TeamPlayer,
              as: 'teamPlayers',
              required: true,
              where: {
                teamId: teamId
              },
              attributes: ['id', 'teamId']
            }
          ]
        });

        if (existingPlayerInSameTeam) {
          res.status(409).json({ message: `Já existe um jogador com o nome "${name}" neste time` });
          return;
        }
      }

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
        res.status(409).json({ message: `Já existe um jogador com o nome "${name}" vinculado a outro time` });
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
          gender: gender,
          year: year,
          position: position,
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
      const { teamId, playerId, name } = req.body;
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

      if (playerId) {
        const player = await Player.findByPk(playerId);
        
        if (!player) {
          res.status(404).json({ message: 'Jogador não encontrado' });
          return;
        }

        const existingPlayerInSameTeam = await Player.findOne({
          where: { 
            name: player.name,
            isDeleted: false
          },
          include: [
            {
              model: TeamPlayer,
              as: 'teamPlayers',
              required: true,
              where: {
                teamId: teamId
              },
              attributes: ['id', 'teamId']
            }
          ]
        });

        if (existingPlayerInSameTeam) {
          res.status(409).json({ message: `Já existe um jogador com o nome "${player.name}" neste time` });
          return;
        }
      }

      if (name) {
        const normalizedName = name.trim().toLowerCase();
        
        const existingPlayerInSameTeam = await Player.findOne({
          where: { 
            name: normalizedName,
            isDeleted: false
          },
          include: [
            {
              model: TeamPlayer,
              as: 'teamPlayers',
              required: true,
              where: {
                teamId: teamId
              },
              attributes: ['id', 'teamId']
            }
          ]
        });

        if (existingPlayerInSameTeam) {
          res.status(409).json({ message: `Já existe um jogador com o nome "${name}" neste time` });
          return;
        }
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

      const playersToUpdate = req.body.players;
      
      if (!playersToUpdate || !Array.isArray(playersToUpdate)) {
        res.status(400).json({ message: 'Lista de jogadores inválida' });
        return;
      }

      const updatedPlayers = [];
      const errors = [];

      for (const player of playersToUpdate) {
        try {
          if (!player.name || !player.gender || !player.year || !player.position) {
            errors.push({
              player,
              erro: 'Todos os campos são obrigatórios (name, gender, year, position)'
            });
            continue;
          }

          const normalizedName = player.name.trim().toLowerCase();
          
          if (!player.id) {
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
                  player,
                  erro: `O jogador "${player.name}" já está cadastrado e vinculado a outro time`
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
                    player,
                    erro: `O jogador "${player.name}" já está vinculado a este time`
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

            const newPlayer = await Player.create({
              name: normalizedName,
              gender: player.gender,
              year: player.year,
              position: player.position,
              isDeleted: false  
            });

            await TeamPlayer.create({
              teamId: Number(id),
              playerId: newPlayer.id
            });

            updatedPlayers.push({
              id: newPlayer.id,
              nome: newPlayer.name,
              sexo: newPlayer.gender,
              ano: newPlayer.year,
              posicao: newPlayer.position,
              isDeleted: newPlayer.isDeleted
            });

          } else {
            const playerToUpdate = await Player.findByPk(player.id);
            
            if (!playerToUpdate) {
              errors.push({
                player,
                erro: `Jogador com ID ${player.id} não encontrado`
              });
              continue;
            }

            const nomeAtualNormalizado = playerToUpdate.name.trim().toLowerCase();

            if (normalizedName !== nomeAtualNormalizado) {
              const existingPlayerWithSameName = await Player.findOne({
                where: { 
                  name: normalizedName,
                  id: { [Op.ne]: player.id },
                  isDeleted: false
                }
              });

              if (existingPlayerWithSameName) {
                errors.push({
                  player,
                  erro: `Não é possível alterar para "${player.name}" pois já existe um jogador cadastrado com este nome`
                });
                continue;
              }

              const existingLinkedPlayer = await Player.findOne({
                where: { 
                  name: normalizedName,
                  id: { [Op.ne]: player.id },
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
                  player,
                  erro: `Já existe outro jogador com o nome "${player.name}" vinculado a outro time`
                });
                continue;
              }
            }

            await playerToUpdate.update({
              name: normalizedName,
              gender: player.gender,
              year: player.year,
              position: player.position
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
            player,
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

      await TeamPlayer.destroy({
        where: {
          playerId: id
        }
      });

      await player.update({ isDeleted: true });

      res.status(200).json({ message: 'Jogador excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir jogador' });
    }
  }

} 