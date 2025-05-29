import { Request, Response } from 'express';
import Team from '../models/TeamModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';
import TeamPlayer from '../models/TeamPlayerModel';
import { Op, Sequelize } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
import { processUpload } from '../services/uploadService';
dotenv.config();
export class TeamController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, sexo, maxPlayers, primaryColor, secondaryColor, estado, cidade } = req.body;
      let jogadores = req.body.jogadores;
      if (typeof jogadores === 'string') {
        try {
          jogadores = JSON.parse(jogadores);
        } catch (e) {
          jogadores = [];
        }
      }
      let bannerFilename = null;
      if (req.file) {
        bannerFilename = req.file.filename;
      }
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }
      let decodedPayload;
      try {
        decodedPayload = jwt.decode(token);
      } catch (decodeErr) {
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      let captainId = decodedPayload.id;
      if (!captainId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      if (name) {
        const existingActiveTeam = await Team.findOne({
          where: { name: name.trim(), isDeleted: false }
        });
        if (existingActiveTeam) {
          res.status(400).json({ error: 'Este nome de time já está em uso. Escolha outro nome.' });
          return;
        }
        const existingDeletedTeam = await Team.findOne({
          where: { name: name.trim(), isDeleted: true }
        });
        if (existingDeletedTeam) {
          const agora = new Date();
          agora.setHours(agora.getHours() - 3);
          await existingDeletedTeam.update({
            description,
            captainId,
            isDeleted: false,
            updatedAt: agora,
            estado,
            cidade,
            sexo,
            maxparticipantes: maxPlayers,
            primaryColor,
            secondaryColor,
            banner: bannerFilename
          });
          
          // Adicionar jogadores
          if (jogadores && jogadores.length > 0) {
            for (const jogador of jogadores) {
              // Criar o jogador
              const newPlayer = await Player.create({
                nome: jogador.nome,
                sexo: jogador.sexo,
                ano: jogador.ano,
                posicao: jogador.posicao,
                isDeleted: false
              });
              
              // Associar ao time
              await TeamPlayer.create({
                teamId: existingDeletedTeam.id,
                playerId: newPlayer.id,
                userId: null
              });
            }
          }
          
          const teamWithAssociations = await Team.findByPk(existingDeletedTeam.id, {
            include: [
              {
                model: Player,
                as: 'players',
                through: { attributes: [] }
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
        sexo,
        maxparticipantes: maxPlayers,
        primaryColor,
        secondaryColor,
        isDeleted: false,
        banner: bannerFilename,
        estado,
        cidade
      });
      
      // Adicionar jogadores
      if (jogadores && jogadores.length > 0) {
        for (const jogador of jogadores) {
          // Criar o jogador
          const newPlayer = await Player.create({
            nome: jogador.nome,
            sexo: jogador.sexo,
            ano: jogador.ano,
            posicao: jogador.posicao,
            isDeleted: false
          });
          
          // Associar ao time
          await TeamPlayer.create({
            teamId: team.id,
            playerId: newPlayer.id,
            userId: null
          });
        }
      }
      
      const teamWithPlayers = await Team.findByPk(team.id, {
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] }
          }
        ]
      });
      
      if (!teamWithPlayers) {
        res.status(500).json({ error: 'Erro ao criar time' });
        return;
      }
      
      const plainTeam = teamWithPlayers.get({ plain: true });
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
            as: 'users',
            attributes: ['id', 'name', 'email'],
            through: { attributes: [] }
          },
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { isDeleted: false },
            required: false
          }
        ]
      });
      const visibleTeams = allTeams.filter(team => {
        if (team.captainId === userId) {
          return true;
        }
        const isPlayer = team.users.some(player => player.id === userId);
        return isPlayer;
      });
      const formattedTeams = visibleTeams.map(team => {
        const plainTeam = team.get({ plain: true });
        const isCaptain = team.captainId === userId;
        const isPlayer = team.users.some(player => player.id === userId);
        
        return {
          ...plainTeam,
          banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
          isCurrentUserCaptain: isCaptain,
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
            as: 'users',
            attributes: ['id', 'name', 'email'],
            through: { attributes: [] }
          },
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { isDeleted: false },
            required: false
          }
        ]
      });

      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }
      const isCaptain = team.captainId === userId;
      const isPlayer = team.users.some(player => player.id === userId);
      if (!isCaptain && !isPlayer) {
        res.status(403).json({ error: 'Você não tem permissão para ver este time' });
        return;
      }
      const plainTeam = team.get({ plain: true });
      
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
        isCurrentUserCaptain: isCaptain
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
      const userId = req.user?.id;
      const team = await Team.findOne({
        where: { id, isDeleted: false }
      });
      
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }
      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode atualizar o time' });
        return;
      }
      if (req.body.name) {
        const existingTeam = await Team.findOne({
          where: { 
            name: req.body.name.trim(), 
            id: { [Op.ne]: id }, 
            isDeleted: false 
          }
        });
        if (existingTeam) {
          res.status(400).json({ error: 'Este nome de time já está em uso' });
          return;
        }
      }
      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      
      // Processar jogadores do FormData
      let jogadoresUpdate = [];
      if (req.body.jogadores) {
        try {
          jogadoresUpdate = JSON.parse(req.body.jogadores);
        } catch (e) {
          console.error('Erro ao processar jogadores:', e);
          jogadoresUpdate = [];
        }
      }

      // Preservar o banner atual se não houver um novo arquivo
      let bannerFilename = team.banner;
      if (req.file) {
        if (team.banner !== null) {
          const oldBannerPath = path.join(__dirname, '..', 'uploads', 'teams', team.banner);
          if (fs.existsSync(oldBannerPath)) {
            fs.unlinkSync(oldBannerPath);
          } 
        }
        bannerFilename = req.file.filename;
      } 
      const updateData: any = {
        name: req.body.name?.trim(),
        description: req.body.description,
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        estado: req.body.estado,
        cidade: req.body.cidade,
        updatedAt: agora
      };

      // Só incluir o banner se ele existir
      if (bannerFilename) {
        updateData.banner = bannerFilename;
        console.log('Banner incluído nos dados de atualização:', bannerFilename);
      } else {
        console.log('Nenhum banner incluído nos dados de atualização');
      }
      await team.update(updateData);
      console.log('Time atualizado com sucesso');

      // Atualizar jogadores
      if (jogadoresUpdate && jogadoresUpdate.length > 0) {
        // Obter os jogadores atuais do time
        const currentPlayers = await Player.findAll({
          include: [
            {
              model: Team,
              as: 'teams',
              where: { id: id },
              through: { attributes: [] }
            }
          ]
        });

        // Para jogadores existentes que foram atualizados
        for (const jogadorData of jogadoresUpdate) {
          if (jogadorData.id) {
            // Atualizar jogador existente
            const existingPlayer = currentPlayers.find(p => p.id === jogadorData.id);
            if (existingPlayer) {
              await existingPlayer.update({
                nome: jogadorData.nome,
                sexo: jogadorData.sexo,
                ano: jogadorData.ano,
                posicao: jogadorData.posicao
              });
            }
          } else {
            // Criar novo jogador e associar ao time
            const newPlayer = await Player.create({
              nome: jogadorData.nome,
              sexo: jogadorData.sexo,
              ano: jogadorData.ano,
              posicao: jogadorData.posicao,
              isDeleted: false
            });
            
            await TeamPlayer.create({
              teamId: parseInt(id),
              playerId: newPlayer.id,
              userId: null
            });
          }
        }

        // Remover jogadores que não estão mais na lista
        const updatedPlayerIds = jogadoresUpdate
          .filter(j => j.id)
          .map(j => j.id);
        
        for (const player of currentPlayers) {
          if (!updatedPlayerIds.includes(player.id)) {
            // Remover a associação entre o jogador e o time
            await TeamPlayer.destroy({
              where: {
                teamId: parseInt(id),
                playerId: player.id
              }
            });
          }
        }
      }
      
      const updatedTeam = await Team.findOne({
        where: { id: id, isDeleted: false },
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] }
          }
        ]
      });
      
      if (!updatedTeam) {
        res.status(500).json({ error: 'Erro ao atualizar time' });
        return;
      }
      
      const plainTeam = updatedTeam.get({ plain: true });
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null
      };
      
      res.json(formattedTeam);
    } catch (error) {
      console.error('Erro detalhado ao atualizar time:', error);
      res.status(500).json({ error: 'Erro ao atualizar time' });
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

      // Remover associações entre o time e seus jogadores
      await TeamPlayer.destroy({
        where: {
          teamId: id
        }
      });
      
      // Efetivamente excluir o time do banco de dados
      await team.destroy();
      
      res.status(200).json({ 
        message: 'Time deletado com sucesso',
        team: {
          id: parseInt(id),
          name: team.name
        }
      });
    } catch (error) {
      console.error('Erro ao deletar time:', error);
      res.status(500).json({ error: 'Erro ao deletar time' });
    }
  }

  static async removePlayerFromTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, playerId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      
      // Verificar se o time existe
      const team = await Team.findByPk(teamId);
      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }
      
      // Verificar se o usuário é o capitão do time
      if (team.captainId !== userId) {
        res.status(403).json({ error: 'Apenas o capitão pode remover jogadores do time' });
        return;
      }
      
      // Verificar se o jogador existe e está associado ao time
      const playerTeam = await TeamPlayer.findOne({
        where: {
          teamId: teamId,
          playerId: playerId
        }
      });
      
      if (!playerTeam) {
        res.status(404).json({ error: 'Jogador não encontrado neste time' });
        return;
      }
      
      // Remover a associação entre o jogador e o time
      await playerTeam.destroy();
      
      res.status(200).json({ success: true, message: 'Jogador removido do time com sucesso' });
    } catch (error) {
      console.error('Erro ao remover jogador do time:', error);
      res.status(500).json({ error: 'Erro ao remover jogador do time' });
    }
  }
} 

