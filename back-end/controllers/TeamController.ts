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

      // Verificar apenas pelo nome do time e que não esteja marcado como excluído
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

        // Verificar se existe um time excluído com o mesmo nome
        const existingDeletedTeam = await Team.findOne({
          where: {
            name: name.trim(),
            isDeleted: true
          }
        });

        if (existingDeletedTeam) {
          // Criar data atual no formato brasileiro
          const agora = new Date();
          // Convertendo para o fuso horário de Brasília (GMT-3)
          agora.setHours(agora.getHours() - 3);
          
          // Atualizar o time excluído, marcando-o como não excluído e atualizando seus dados
          await existingDeletedTeam.update({
            description,
            captainId,
            isDeleted: false,
            updatedAt: agora
          });

          // Log para depuração
          console.log(`Time excluído ${existingDeletedTeam.id} reutilizado em: ${agora.toISOString()}`);

          // Atualizar jogadores do time se necessário
          if (playerEmails && Array.isArray(playerEmails)) {
            console.log("Processando e-mails de jogadores:", playerEmails);
            await existingDeletedTeam.setPlayers([]); // Remove todos os jogadores atuais
            for (const email of playerEmails) {
              const user = await User.findOne({ where: { email } });
              if (user) {
                await existingDeletedTeam.addPlayer(user);
                console.log(`Jogador adicionado: ${email}`);
              } else {
                console.log(`Usuário não encontrado: ${email}`);
              }
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

          res.status(201).json(teamWithAssociations);
          return;
        }
      }

      // Criar um novo time se não existir um com o mesmo nome (nem mesmo excluído)
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

      // Verificar se outro time ativo (não excluído) está usando o mesmo nome
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

      // Criar data atual no formato brasileiro
      const agora = new Date();
      // Convertendo para o fuso horário de Brasília (GMT-3)
      agora.setHours(agora.getHours() - 3);

      // Forçar a atualização do campo updated_at definindo uma nova data
      await team.update({
        name,
        description,
        updatedAt: agora
      });

      // Log para depuração
      console.log(`Time ${id} atualizado em: ${agora.toISOString()}`);

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
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
        // Formatando a data para o cliente
        updatedAt: plainTeam.updatedAt ? new Date(plainTeam.updatedAt).toLocaleString('pt-BR') : null,
        createdAt: plainTeam.createdAt ? new Date(plainTeam.createdAt).toLocaleString('pt-BR') : null
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

      // Criar data atual no formato brasileiro
      const agora = new Date();
      // Convertendo para o fuso horário de Brasília (GMT-3)
      agora.setHours(agora.getHours() - 3);

      await team.update({ 
        banner: req.file.filename,
        updatedAt: agora
      });

      // Log para depuração
      console.log(`Banner do time ${id} atualizado em: ${agora.toISOString()}`);

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

      // Criar data atual no formato brasileiro
      const agora = new Date();
      // Convertendo para o fuso horário de Brasília (GMT-3)
      agora.setHours(agora.getHours() - 3);

      await team.update({ 
        isDeleted: true,
        updatedAt: agora
      });
      
      // Log para depuração
      console.log(`Time ${id} marcado como excluído em: ${agora.toISOString()}`);
      
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