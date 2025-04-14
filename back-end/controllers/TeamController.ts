import { Request, Response } from 'express';
import Team from '../models/TeamModel';
import User from '../models/UserModel';
import { Op, Sequelize } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
export class TeamController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, playerEmails } = req.body;
      const captainId = req.user?.id;

      if (!captainId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      if (name) {
        const existingActiveTeam = await Team.findOne({
        where: {
            name: name.trim(),
            isDeleted: false 
          }
        });

        if (existingActiveTeam) {
          res.status(400).json({ error: 'Este nome de time já está em uso. Escolha outro nome.' });
          return;
        }
        const existingDeletedTeam = await Team.findOne({
          where: {
            name: name.trim(),
            isDeleted: true
          }
        });

        if (existingDeletedTeam) {
          const agora = new Date();
          agora.setHours(agora.getHours() - 3);
          await existingDeletedTeam.update({
            description,
            captainId,
            isDeleted: false,
            updatedAt: agora
          });
          if (playerEmails && Array.isArray(playerEmails)) {
            const validEmails = playerEmails.filter(email => email && typeof email === 'string' && email.trim() !== ''); 
            if (validEmails.length > 0) {
              await existingDeletedTeam.setPlayers([]);
              const existingPlayers = await User.findAll({
                where: {
                  email: { [Op.in]: validEmails }
                }
              });
              const existingEmails = existingPlayers.map(player => player.get('email'));
              const missingEmails = validEmails.filter(email => !existingEmails.includes(email));
              if (missingEmails.length > 0) {
                const allUsers = await User.findAll();
                console.log(`Buscados ${allUsers.length} usuários para verificação case insensitive`);
                for (const email of missingEmails) {
                  console.log(`Verificando email: ${email} com busca case insensitive`);
                  const normalizedEmail = email.trim().toLowerCase();
                  const userWithDifferentCase = allUsers.find(
                    user => user.get('email').toLowerCase() === normalizedEmail
                  )
                  if (userWithDifferentCase) {
                    existingPlayers.push(userWithDifferentCase);
                  } else {
                    console.log(`Usuário com email ${email} não existe. Não é possível adicioná-lo.`);
                  }
                }
              }
              await existingDeletedTeam.setPlayers(existingPlayers);
            } else {
              await existingDeletedTeam.setPlayers([]);
            }
          }
          const teamWithAssociations = await Team.findByPk(existingDeletedTeam.id, {
            include: [
              {
                model: User,
                as: 'captain',
                attributes: ['id', 'name', 'email']
              },
              {
                model: User,
                as: 'players',
                attributes: ['id', 'name', 'email']
              }
            ]
          });
          const plainTeam = teamWithAssociations.get({ plain: true });
          res.status(201).json(plainTeam);
        return;
        }
      }
      const team = await Team.create({
        name: name.trim(),
        description,
        captainId,
        isDeleted: false
      });
      if (playerEmails && Array.isArray(playerEmails)) {
        const validEmails = playerEmails.filter(email => email && typeof email === 'string' && email.trim() !== '');
        if (validEmails.length > 0) {
          const existingPlayers = await User.findAll({
            where: {
              email: { [Op.in]: validEmails }
            }
          });
          const existingEmails = existingPlayers.map(player => player.get('email'));
          const missingEmails = validEmails.filter(email => !existingEmails.includes(email));
          if (missingEmails.length > 0) {
            const allUsers = await User.findAll();
            for (const email of missingEmails) {
              const normalizedEmail = email.trim().toLowerCase();
              const userWithDifferentCase = allUsers.find(
                user => user.get('email').toLowerCase() === normalizedEmail
              );
              if (userWithDifferentCase) {
                existingPlayers.push(userWithDifferentCase);
              } else {
                console.log(`Usuário com email ${email} não existe. Não é possível adicioná-lo.`);
              }
            }
          }
          await team.setPlayers(existingPlayers);
        }
      }

      const teamWithAssociations = await Team.findByPk(team.id, {
        include: [
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'players',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!teamWithAssociations) {
        res.status(500).json({ error: 'Erro ao criar time' });
        return;
      }
      const plainTeam = teamWithAssociations.get({ plain: true });
      res.status(201).json(plainTeam);
    } catch (error) {
      console.error('Erro ao criar time:', error);
      res.status(500).json({ error: 'Erro ao criar time' });
    }
  }

  static async listTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      const allTeams = await Team.findAll({
        where: {
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'players',
            attributes: ['id', 'name', 'email'],
            through: { attributes: [] } // Não selecionar atributos da tabela de junção
          }
        ]
      });
      const visibleTeams = allTeams.filter(team => {
        if (team.captainId === userId) {
          return true;
        }
        const isPlayer = team.players.some(player => player.id === userId);
        return isPlayer;
      });
      const formattedTeams = visibleTeams.map(team => {
        const plainTeam = team.get({ plain: true });
        const isCaptain = team.captainId === userId;
        const isPlayer = team.players.some(player => player.id === userId);
        
        return {
          ...plainTeam,
          banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
          isCurrentUserCaptain: isCaptain,
          isCurrentUserPlayer: isPlayer
        };
      });
      res.json(formattedTeams);
    } catch (error) {
      console.error('Erro ao listar times:', error);
      res.status(500).json({ error: 'Erro ao listar times' });
    }
  }

  static async getTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }     
      const team = await Team.findOne({
        where: {
          id,
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'players',
            attributes: ['id', 'name', 'email'],
            through: { attributes: [] } // Não selecionar atributos da tabela de junção
          }
        ]
      });

      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }
      const isCaptain = team.captainId === userId;
      const isPlayer = team.players.some(player => player.id === userId);
      if (!isCaptain && !isPlayer) {
        res.status(403).json({ error: 'Você não tem permissão para ver este time' });
        return;
      }
      const plainTeam = team.get({ plain: true });
      if (plainTeam.players && Array.isArray(plainTeam.players)) {
         
      } else {
        plainTeam.players = [];
      }
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
        isCurrentUserCaptain: isCaptain,
        isCurrentUserPlayer: isPlayer
      };
      res.json(formattedTeam);
    } catch (error) {
      console.error('Erro ao buscar time:', error);
      res.status(500).json({ error: 'Erro ao buscar time' });
    }
  }

  static async updateTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, playerEmails } = req.body;
      const userId = req.user?.id;
     
      const team = await Team.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }

      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode atualizar o time' });
        return;
      }
      const existingTeam = await Team.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
          isDeleted: false
        }
      });

      if (existingTeam) {
        res.status(400).json({ error: 'Este nome de time já está em uso' });
        return;
      }
      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      await team.update({
        name,
        description,
        updatedAt: agora
      });

      if (playerEmails && Array.isArray(playerEmails)) {
        const validEmails = playerEmails.filter(email => email && typeof email === 'string' && email.trim() !== '');
        if (validEmails.length === 0) {
          await team.setPlayers([]);
        } else {
          const existingPlayers = await User.findAll({
            where: {  // <-- Fixed indentation here
              email: { [Op.in]: validEmails }
            }
          });
          const existingEmails = existingPlayers.map(player => player.get('email'));
          const missingEmails = validEmails.filter(email => !existingEmails.includes(email));

          if (missingEmails.length > 0) {
            const allUsers = await User.findAll();
            for (const email of missingEmails) {
              const normalizedEmail = email.trim().toLowerCase();
              const userWithDifferentCase = allUsers.find(
                user => user.get('email').toLowerCase() === normalizedEmail
              );
              
              if (userWithDifferentCase) {
                existingPlayers.push(userWithDifferentCase);
              } else {
                console.log(`Usuário com email ${email} não existe. Não é possível adicioná-lo.`);
              }
            }
          }
          await team.setPlayers(existingPlayers);
        }
      } else {
        console.log('Nenhum email de jogador fornecido ou formato inválido. Mantendo jogadores existentes.');
      }
      const updatedTeam = await Team.findOne({
        where: {
          id: id,
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'captain',
            attributes: [ 'name', 'email']
          },
          {
            model: User,
            as: 'players',
            attributes: [ 'name', 'email']
          }
        ]
      });
      console.log('Time atualizado:', updatedTeam);
      if (!updatedTeam) {
        console.error(`Erro ao buscar time atualizado com ID ${id}`);
        res.status(500).json({ error: 'Erro ao atualizar time' });
        return;
      }
      const plainTeam = updatedTeam.get({ plain: true });
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
        // Formatando a data para o cliente
        updatedAt: plainTeam.updatedAt ? new Date(plainTeam.updatedAt).toLocaleString('pt-BR') : null,
        createdAt: plainTeam.createdAt ? new Date(plainTeam.createdAt).toLocaleString('pt-BR') : null
      };

      res.json(formattedTeam);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar time' });
    }
  }

  static async uploadBanner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const team = await Team.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }

      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode atualizar o banner' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado' });
        return;
      }

      if (team.banner) {
        const oldBannerPath = path.join('uploads/teams', team.banner);
        if (fs.existsSync(oldBannerPath)) {
          fs.unlinkSync(oldBannerPath);
        }
      }
      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      await team.update({ 
        banner: req.file.filename,
        updatedAt: agora
      });
      const updatedTeam = await Team.findOne({
        where: {
          id,
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'captain',
            attributes: ['name', 'email']
          },
          {
            model: User,
            as: 'players',
            attributes: ['name', 'email']
          }
        ]
      });

      if (!updatedTeam) {
        res.status(500).json({ error: 'Erro ao atualizar banner' });
        return;
      }

      const plainTeam = updatedTeam.get({ plain: true });
      const formattedTeam = {
        ...plainTeam,
        banner: `/uploads/teams/${plainTeam.banner}`
      };

      res.json(formattedTeam);
    } catch (error) {
      console.error('Erro ao fazer upload do banner:', error);
      res.status(500).json({ error: 'Erro ao fazer upload do banner' });
    }
  }

  static async deleteTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { confirm } = req.body;
      const userId = req.user?.id;

      if (!confirm) {
        res.status(400).json({ 
          error: 'Confirmação necessária',
          message: 'Para deletar o time, envie confirm: true no corpo da requisição'
        });
        return;
      }

      const team = await Team.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
      
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }

      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode deletar o time' });
        return;
      }
      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      await team.update({ 
        isDeleted: true,
        updatedAt: agora
      });
      res.status(200).json({ 
        message: 'Time deletado com sucesso',
        team: {
          id: team.id,
          name: team.name
        }
      });
    } catch (error) {
      console.error('Erro ao deletar time:', error);
      res.status(500).json({ error: 'Erro ao deletar time' });
    }
  }
} 