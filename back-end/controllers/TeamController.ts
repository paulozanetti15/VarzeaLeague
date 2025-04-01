import { Request, Response } from 'express';
import Team from '../models/Team';
import User from '../models/User';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/teams';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas JPG, PNG e GIF são aceitos.'));
    }
  }
});

export class TeamController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, playerEmails } = req.body;
      const captainId = req.user?.id;

      if (!captainId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      console.log("Dados recebidos para criação de time:", { name, description, captainId });

      // Verificar apenas pelo nome do time
      if (name) {
        const existingTeam = await Team.findOne({
          where: { 
            name: name.trim(),
            isDeleted: false 
          }
        });

        if (existingTeam) {
          res.status(400).json({ error: 'Este nome de time já está em uso. Escolha outro nome.' });
          return;
        }
      }

      // Criar o time
      console.log("Criando novo time com:", { name: name ? name.trim() : '', description, captainId });
      
      const team = await Team.create({
        name: name.trim(),
        description,
        captainId,
        isDeleted: false
      });
      
      console.log("Time criado com sucesso:", team.id);

      if (playerEmails && Array.isArray(playerEmails)) {
        console.log("Processando e-mails de jogadores:", playerEmails);
        for (const email of playerEmails) {
          const user = await User.findOne({ where: { email } });
          if (user) {
            await team.addPlayer(user);
            console.log(`Jogador adicionado: ${email}`);
          } else {
            console.log(`Usuário não encontrado: ${email}`);
          }
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

      res.status(201).json(teamWithAssociations);
    } catch (error) {
      console.error('Erro ao criar time:', error);
      res.status(500).json({ error: 'Erro ao criar time' });
    }
  }

  static async listTeams(req: Request, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
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
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      const formattedTeams = teams.map(team => {
        const plainTeam = team.get({ plain: true });
        return {
          ...plainTeam,
          banner: plainTeam.banner ? `http://localhost:3001/uploads/teams/${plainTeam.banner}` : null
        };
      });

      res.json(formattedTeams);
    } catch (error) {
      console.error('Erro ao listar times:', error);
      res.status(500).json({ error: 'Erro ao listar times' });
    }
  }

  static async getTeam(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!team) {
        res.status(404).json({ error: 'Time não encontrado' });
        return;
      }

      const plainTeam = team.get({ plain: true });
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null
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

      await team.update({ name, description });

      if (playerEmails && Array.isArray(playerEmails)) {
        const players = await User.findAll({
          where: {
            email: { [Op.in]: playerEmails }
          }
        });

        await team.setPlayers(players);
      }

      const updatedTeam = await Team.findOne({
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
            attributes: ['id', 'name', 'email']
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
      console.error('Erro ao atualizar time:', error);
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

      await team.update({ banner: req.file.filename });

      const updatedTeam = await Team.findOne({
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
            attributes: ['id', 'name', 'email']
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

      await team.update({ isDeleted: true });
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