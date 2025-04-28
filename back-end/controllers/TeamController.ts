import { Request, Response } from 'express';
import Team from '../models/TeamModel';
import User from '../models/UserModel';
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
      const { name, description, sexo, idademinima, idademaxima, maxPlayers, primaryColor, secondaryColor, estado, cidade } = req.body;
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
            jogadores,
            sexo,
            idademinima,
            idademaxima,
            maxparticipantes: maxPlayers,
            primaryColor,
            secondaryColor,
            banner: bannerFilename
          });
          const teamWithAssociations = await Team.findByPk(existingDeletedTeam.id);
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
        idademinima,
        idademaxima,
        maxparticipantes: maxPlayers,
        primaryColor,
        secondaryColor,
        isDeleted: false,
        banner: bannerFilename,
        estado,
        cidade,
        jogadores
      });
      if (!team) {
        res.status(500).json({ error: 'Erro ao criar time' });
        return;
      }
      const plainTeam = team.get({ plain: true });
      res.status(201).json(plainTeam);
    } catch (error) {
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
    console.log('REQ.BODY:', req.body);
    try {
      const { id } = req.params;
      const { name, description, idademinima, idademaxima, sexo, primaryColor, secondaryColor, maxparticipantes, estado, cidade, jogadores } = req.body;
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
      const existingTeam = await Team.findOne({
        where: { name, id: { [Op.ne]: id }, isDeleted: false }
      });
      if (existingTeam) {
        res.status(400).json({ error: 'Este nome de time já está em uso' });
        return;
      }
      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      let jogadoresUpdate = req.body.jogadores;
      if (typeof jogadoresUpdate === 'string') {
        try {
          jogadoresUpdate = JSON.parse(jogadoresUpdate);
        } catch (e) {
          jogadoresUpdate = [];
        }
      }
      await team.update({
        name,
        description,
        idademinima,
        idademaxima,
        sexo,
        maxparticipantes,
        primaryColor,
        secondaryColor,
        updatedAt: agora,
        estado,
        cidade,
        jogadores: jogadoresUpdate
      });
      const updatedTeam = await Team.findOne({
        where: { id: id, isDeleted: false }
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

