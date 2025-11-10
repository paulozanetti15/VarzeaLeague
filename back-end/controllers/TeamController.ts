import { Response } from 'express';
import Team from '../models/TeamModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';
import TeamPlayer from '../models/TeamPlayerModel';
import { Op, fn, col } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import MatchTeams from '../models/FriendlyMatchTeamsModel';
import TeamChampionship from '../models/TeamChampionshipModel';
import MatchChampionshipReport from '../models/MatchReportChampionshipModel';

export default class TeamController {
  static async createTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('=== INICIANDO CRIAÇÃO DE TIME ===');
      console.log('Body recebido:', {
        name: req.body.name,
        description: req.body.description,
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        state: req.body.state,
        city: req.body.city,
        CEP: req.body.CEP
      });
      console.log('Arquivo recebido:', req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'Nenhum arquivo');
      
      const { name, description, primaryColor, secondaryColor, state, city, CEP } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        console.error('Usuário não autenticado');
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      
      let jogadores = req.body.jogadores;
      
      // Processar jogadores se vierem como string (FormData)
      if (typeof jogadores === 'string') {
        try {
          jogadores = JSON.parse(jogadores);
          console.log('Jogadores parseados:', jogadores);
        } catch (e) {
          console.warn('Erro ao parsear jogadores JSON, usando array vazio:', e);
          jogadores = [];
        }
      }
      
      // Garantir que jogadores seja um array
      if (!Array.isArray(jogadores)) {
        console.warn('Jogadores não é um array, convertendo:', jogadores);
        jogadores = [];
      }
      
      let bannerFilename = null;
      if (req.file) {
        bannerFilename = req.file.filename;
        console.log('Banner filename definido:', bannerFilename);
      }
      
      // Validações obrigatórias
      if (!name || !name.trim()) {
        console.error('Nome do time não fornecido');
        res.status(400).json({ error: 'Nome do time é obrigatório' });
        return;
      }
      
      // Garantir que CEP tenha um valor (mesmo que vazio, mas não null)
      const CEPValue = (CEP && CEP.trim()) ? CEP.trim() : '00000-000';
      console.log('CEP processado:', CEPValue);

      const existingActiveTeam = await Team.findOne({
        where: { name: name.trim(), isDeleted: false }
      });

      if (existingActiveTeam) {
        res.status(409).json({ message: 'Este nome de time já está em uso. Escolha outro nome.' });
        return;
      }

      const existingDeletedTeam = await Team.findOne({
        where: { name: name.trim(), isDeleted: true }
      });

      if (existingDeletedTeam) {
        const agora = new Date();
        agora.setHours(agora.getHours() - 3);
        await existingDeletedTeam.update({
          description: description || null,
          captainId: userId,
          isDeleted: false,
          updatedAt: agora,
          state: state || null,
          city: city || null,
          CEP: CEPValue,
          primaryColor: primaryColor || null,
          secondaryColor: secondaryColor || null,
          banner: bannerFilename
        });

        // Adicionar o usuário ao time
        try {
          await existingDeletedTeam.addUser(userId);
        } catch (addUserError: any) {
          console.error('Erro ao adicionar usuário ao time:', addUserError);
          if (addUserError?.name !== 'SequelizeUniqueConstraintError') {
            throw addUserError;
          }
        }
        
        // Processar e criar/associar jogadores se houver
        if (jogadores && Array.isArray(jogadores) && jogadores.length > 0) {
          try {
            console.log('Processando jogadores para time restaurado:', jogadores.length);
            await TeamController.handlePlayersForTeamCreation(existingDeletedTeam.id, jogadores);
          } catch (playerError: any) {
            console.error('Erro ao processar jogadores:', playerError);
          }
        }
        
        const teamWithAssociations = await Team.findByPk(existingDeletedTeam.id, {
          include: [
            {
              model: Player,
              as: 'players',
              through: { attributes: [] },
              where: { isDeleted: false },
              required: false
            }
          ]
        });
        
        if (!teamWithAssociations) {
          res.status(500).json({ message: 'Erro ao criar time' });
          return;
        }

        const plainTeam = teamWithAssociations.get({ plain: true });
        res.status(201).json(plainTeam);
        return;
      }

      console.log('Criando novo time com dados:', {
        name: name.trim(),
        description: description || null,
        captainId: userId,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        isDeleted: false,
        banner: bannerFilename,
        state: state || null,
        city: city || null,
        CEP: CEPValue
      });
      
      const team = await Team.create({
        name: name.trim(),
        description: description || null,
        captainId: userId,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        isDeleted: false,
        banner: bannerFilename,
        state: state || null,
        city: city || null,
        CEP: CEPValue
      });
      console.log('Time criado com sucesso, ID:', team.id);
      
      // Adicionar o capitão como usuário do time
      try {
        await team.addUser(userId);
      } catch (addUserError: any) {
        console.error('Erro ao adicionar usuário ao time:', addUserError);
        if (addUserError?.name !== 'SequelizeUniqueConstraintError') {
          throw addUserError;
        }
      }
      
      // Processar e criar/associar jogadores se houver
      if (jogadores && Array.isArray(jogadores) && jogadores.length > 0) {
        try {
          console.log('Processando jogadores para criação de time:', jogadores.length);
          await TeamController.handlePlayersForTeamCreation(team.id, jogadores);
          console.log('Processamento de jogadores concluído');
        } catch (playerError: any) {
          console.error('Erro ao processar jogadores:', playerError);
          console.error('Stack do erro:', playerError?.stack);
        }
      }
      
      const teamWithPlayers = await Team.findByPk(team.id, {
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { isDeleted: false },
            required: false
          }
        ]
      });
      
      if (!teamWithPlayers) {
        res.status(500).json({ message: 'Erro ao criar time' });
        return;
      }
      
      const plainTeam = teamWithPlayers.get({ plain: true });
      res.status(201).json(plainTeam);
    } catch (error: any) {
      console.error('=== ERRO AO CRIAR TIME ===');
      console.error('Tipo do erro:', error?.constructor?.name);
      console.error('Nome do erro:', error?.name);
      console.error('Mensagem:', error?.message);
      console.error('Stack:', error?.stack);
      console.error('Detalhes completos:', JSON.stringify(error, null, 2));
      
      // Se for erro de validação do Sequelize, retornar mensagem mais específica
      if (error?.name === 'SequelizeValidationError') {
        const validationErrors = error.errors?.map((e: any) => `${e.path}: ${e.message}`).join(', ') || error.message;
        res.status(400).json({
          error: 'Erro de validação',
          message: validationErrors,
          details: error.errors
        });
        return;
      }
      
      // Se for erro de foreign key constraint
      if (error?.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).json({
          error: 'Erro de referência',
          message: 'Um ou mais dados referenciados não existem no banco de dados',
          details: error.message
        });
        return;
      }
      
      // Se for erro de database
      if (error?.name === 'SequelizeDatabaseError') {
        res.status(500).json({
          error: 'Erro no banco de dados',
          message: error.message
        });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao criar time',
        message: error?.message || 'Erro desconhecido',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  }

  static async listTeams(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      
      const allTeams = await Team.findAll({
        where: {
          isDeleted: false,
          [Op.or]: [
            { captainId: userId }
          ]
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
      
      const teamsWhereUserIsMember = await Team.findAll({
        where: {
          isDeleted: false,
          captainId: { [Op.ne]: userId }
        },
        include: [
          {
            model: User,
            as: 'users',
            where: { id: userId },
            attributes: ['id', 'name', 'email'],
            through: { attributes: [] }
          },
          {
            model: User,
            as: 'captain',
            attributes: ['id', 'name', 'email']
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
      
      const combinedTeams = [...allTeams];
      
      teamsWhereUserIsMember.forEach(team => {
        if (!combinedTeams.some(t => t.id === team.id)) {
          combinedTeams.push(team);
        }
      });

      const formattedTeams = await Promise.all(
        combinedTeams.map(async team => {
          const plainTeam = team.get({ plain: true });
          const isCaptain = team.captainId === userId;
          const quantidadePartidas = await MatchTeams.count({
            where: {
              teamId: team.id 
            }
          });
          return {
            ...plainTeam,
            banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
            isCurrentUserCaptain: isCaptain,
            quantidadePartidas: quantidadePartidas
          };
        })
      );
      
      res.status(200).json(formattedTeams);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar times' });
    }
  }

  static async getTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const team = await Team.findOne({
        where: {
          id: teamId,
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
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }

      const isCaptain = team.captainId === userId;
      const isPlayer = team.users.some(user => user.id === userId);

      if (!isCaptain && !isPlayer) {
        res.status(403).json({ message: 'Você não tem permissão para ver este time' });
        return;
      }

      const plainTeam = team.get({ plain: true });
      
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null,
        isCurrentUserCaptain: isCaptain
      };

      res.status(200).json(formattedTeam);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar time' });
    }
  }

  static async updateTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;
      const team = await Team.findOne({
        where: { id: teamId, isDeleted: false }
      });
      
      if (!team) {
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }

      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode atualizar o time' });
        return;
      }

      if (req.body.name) {
        const existingTeam = await Team.findOne({
          where: { 
            name: req.body.name.trim(), 
            id: { [Op.ne]: teamId }, 
            isDeleted: false 
          }
        });
        if (existingTeam) {
          res.status(400).json({ message: 'Este nome de time já está em uso' });
          return;
        }
      }

      const agora = new Date();
      agora.setHours(agora.getHours() - 3);
      
      let jogadoresUpdate = [];
      if (req.body.jogadores) {
        try {
          jogadoresUpdate = JSON.parse(req.body.jogadores);
        } catch (e) {
          jogadoresUpdate = [];
        }
      }

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
        state: req.body.estado,
        city: req.body.cidade,
        CEP: req.body.cep,
        updatedAt: agora
      };

      if (bannerFilename) {
        updateData.banner = bannerFilename;
      }

      await team.update(updateData);

      if (jogadoresUpdate.length > 0) {
        await TeamController.handlePlayersAssociations(parseInt(teamId), jogadoresUpdate);
      }
      
      const updatedTeam = await Team.findOne({
        where: { id: teamId, isDeleted: false },
        include: [
          {
            model: Player,
            as: 'players',
            through: { attributes: [] },
            where: { isDeleted: false },
            required: false
          }
        ]
      });
      
      if (!updatedTeam) {
        res.status(500).json({ message: 'Erro ao atualizar time' });
        return;
      }
      
      const plainTeam = updatedTeam.get({ plain: true });
      const formattedTeam = {
        ...plainTeam,
        banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null
      };
      
      res.status(200).json(formattedTeam);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar time' });
    }
  }

  static async deleteTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const { confirm } = req.body;
      const userId = req.user?.id;
      console.log(teamId)
      if (!confirm) {
        res.status(400).json({ 
          message: 'Confirmação necessária. Para deletar o time, envie confirm: true no corpo da requisição'
        });
        return;
      }

      const team = await Team.findOne({
        where: {
          id: teamId,
          isDeleted: false
        }
      });
      
      if (!team) {
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }

      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode deletar o time' });
        return;
      }

      await TeamPlayer.destroy({
        where: {
          teamId: teamId
        }
      });
      
      await team.update({ isDeleted: true });
      console.log("Removendo time")
      res.status(200).json({ 
        message: 'Time deletado com sucesso',
        team: {
          id: parseInt(teamId),
          name: team.name
        }
      });
    } catch (error) {
      console.error('Erro ao deletar time:', error);
      res.status(500).json({ message: 'Erro ao deletar time' });
    }
  }

  static async removePlayerFromTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId, playerId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      
      const team = await Team.findOne({
        where: {
          id: teamId,
          isDeleted: false
        }
      });
      if (!team) {
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }
      
      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode remover jogadores do time' });
        return;
      }
      
      const playerTeam = await TeamPlayer.findOne({
        where: {
          teamId: teamId,
          playerId: playerId
        }
      });
      
      if (!playerTeam) {
        res.status(404).json({ message: 'Jogador não encontrado neste time' });
        return;
      }
      
      await playerTeam.destroy();
      
      res.status(200).json({ success: true, message: 'Jogador removido do time com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover jogador do time' });
    }
  }
  static async getTeamCaptain(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { idteamCaptain } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const team = await Team.findOne({
        where: { 
          captainId: idteamCaptain,
          isDeleted: false
        }
      });

      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar dados do time' });
    }
  }

  static async getTeamRanking(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('[getTeamRanking] Iniciando...');
      const teamsRanking = [];
      const userId = req.user?.id;
      const { championshipId } = req.params;

      console.log('[getTeamRanking] championshipId:', championshipId, 'userId:', userId);

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const teams = await TeamChampionship.findAll({
        where: {
          championshipId: championshipId
        }
      });

      console.log('[getTeamRanking] Times encontrados:', teams.length);

      const uniqueTeamIds = [...new Set(teams.map(team => team.teamId))];
      console.log('[getTeamRanking] IDs únicos de times:', uniqueTeamIds);

      for (const teamId of uniqueTeamIds) {
        let totalGoalsScore = 0;
        let totalGoalsAgainst = 0;
        let saldoGoals = 0;
        let pontuacaoTeam = 0;
        let countVitoria = 0;
        let countDerrota = 0;
        let countEmpate = 0;

        const team = await Team.findByPk(teamId, {
          attributes: ['name']
        });

        if (!team) continue;

        const nameTeam = team.name;

        const partidas = await MatchChampionshipReport.findAll({
          where: {
            [Op.or]: [
              { team_home: teamId },
              { team_away: teamId }
            ]
          },
          include: [
            {
              model: Team,
              as: 'reportTeamHome',
              attributes: ['name']
            },
            {
              model: Team,
              as: 'reportTeamAway',
              attributes: ['name']
            }
          ]
        });

        partidas.forEach((partida) => {
          if (partida.dataValues.team_home === teamId) {
            const goalsFeitos = partida.dataValues.teamHome_score || 0;
            const goalsSofridos = partida.dataValues.teamAway_score || 0;
            totalGoalsScore += goalsFeitos;
            totalGoalsAgainst += goalsSofridos;

            if (goalsFeitos > goalsSofridos) {
              pontuacaoTeam += 3;
              countVitoria += 1;
            } else if (goalsSofridos === goalsFeitos) {
              pontuacaoTeam += 1;
              countEmpate += 1;
            } else {
              countDerrota += 1;
            }
          } else if (partida.dataValues.team_away === teamId) {
            const goalsFeitos = partida.dataValues.teamAway_score || 0;
            const goalsSofridos = partida.dataValues.teamHome_score || 0;

            if (goalsFeitos > goalsSofridos) {
              pontuacaoTeam += 3;
              countVitoria += 1;
            } else if (goalsSofridos === goalsFeitos) {
              pontuacaoTeam += 1;
              countEmpate += 1;
            } else {
              countDerrota += 1;
            }

            totalGoalsScore += goalsFeitos;
            totalGoalsAgainst += goalsSofridos;
          }
          saldoGoals = totalGoalsScore - totalGoalsAgainst;
        });

        teamsRanking.push({
          pontuacaoTime: pontuacaoTeam,
          nomeTime: nameTeam,
          goalsScore: totalGoalsScore,
          againstgoals: totalGoalsAgainst,
          countVitorias: countVitoria,
          countDerrotas: countDerrota,
          countEmpates: countEmpate,
          saldogoals: saldoGoals
        });
      }

      const sortedteamsRanking = teamsRanking.sort((a, b) => {
        if (b.pontuacaoTime !== a.pontuacaoTime) {
          return b.pontuacaoTime - a.pontuacaoTime;
        } else {
          return b.saldogoals - a.saldogoals;
        }
      });

      res.status(200).json(sortedteamsRanking);
    } catch (error) {
      console.error('[getTeamRanking] ERRO:', error);
      console.error('[getTeamRanking] Stack:', (error as Error).stack);
      res.status(500).json({ 
        message: 'Erro ao buscar ranking do campeonato',
        error: (error as Error).message 
      });
    }
  }

  static async getPlayerStats(req: AuthRequest, res: Response): Promise<void> {
    try {
  const { teamId } = req.params;
  const teamIdNum = Number(teamId);
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ error: 'Usuário não autenticado' }); return; }

      const team = await Team.findOne({
        where: { id: teamId, isDeleted: false },
        include: [
          { model: User, as: 'users', attributes: ['id'], through: { attributes: [] } },
          { model: User, as: 'captain', attributes: ['id'] }
        ]
      });
      if (!team) { res.status(404).json({ error: 'Time não encontrado' }); return; }
      const isCaptain = (team as any).captainId === userId;
      const isMember = (team as any).users?.some((u: any) => u.id === userId);
      if (!isCaptain && !isMember) { res.status(403).json({ error: 'Acesso negado a este time' }); return; }

      const teamPlayers = await TeamPlayer.findAll({
        where: { teamId: teamId },
        include: [{ model: Player, as: 'player', attributes: ['id','name','position','gender'] }] as any
      });

      const playerIds = teamPlayers.map((tp: any) => tp.playerId);
      if (playerIds.length === 0) { res.json({ teamId: Number(teamId), total: 0, stats: [] }); return; }

      const matchTeamRows = await MatchTeams.findAll({
        where: { teamId: teamIdNum },
        attributes: ['matchId'],
        raw: true
      });
      const matchIds: number[] = matchTeamRows.map((r: any) => Number(r.matchId)).filter((n) => !Number.isNaN(n));
      if (matchIds.length === 0) { 
        res.json({ 
          teamId: Number(teamId), 
          total: teamPlayers.length, 
          stats: teamPlayers.map((tp: any) => ({
            playerId: tp.playerId,
            nome: tp.player?.name || 'N/A',
            posicao: tp.player?.position || null,
            sexo: tp.player?.gender || null,
            gols: 0,
            amarelos: 0,
            vermelhos: 0,
            cartoes: 0,
          })) 
        });
        return;
      }

      const goals = await (await import('../models/FriendlyMatchGoalModel')).default.findAll({
        attributes: ['player_id', [fn('COUNT', col('id')), 'gols']],
        where: {
          player_id: playerIds,
          match_id: { [Op.in]: matchIds }
        },
        group: ['player_id']
      });
      const yellowCards = await (await import('../models/FriendlyMatchCardModel')).default.findAll({
        attributes: ['player_id', [fn('COUNT', col('id')), 'amarelos']],
        where: {
          player_id: playerIds,
          card_type: 'yellow',
          match_id: { [Op.in]: matchIds }
        },
        group: ['player_id']
      });
      const redCards = await (await import('../models/FriendlyMatchCardModel')).default.findAll({
        attributes: ['player_id', [fn('COUNT', col('id')), 'vermelhos']],
        where: {
          player_id: playerIds,
          card_type: 'red',
          match_id: { [Op.in]: matchIds }
        },
        group: ['player_id']
      });

      const gMap: Record<string, number> = {};
      goals.forEach((g: any) => { gMap[g.player_id] = Number(g.get('gols')); });
      const yMap: Record<string, number> = {};
      yellowCards.forEach((c: any) => { yMap[c.player_id] = Number(c.get('amarelos')); });
      const rMap: Record<string, number> = {};
      redCards.forEach((c: any) => { rMap[c.player_id] = Number(c.get('vermelhos')); });

      const stats = teamPlayers.map((tp: any) => {
        const pid = String(tp.playerId);
        const gols = gMap[pid] || 0;
        const amarelos = yMap[pid] || 0;
        const vermelhos = rMap[pid] || 0;
        return {
          playerId: tp.playerId,
          nome: tp.player?.name || 'N/A',
          posicao: tp.player?.position || null,
          sexo: tp.player?.gender || null,
          gols,
          amarelos,
          vermelhos,
          cartoes: amarelos + vermelhos
        };
      }).sort((a: any, b: any) => b.gols - a.gols || b.cartoes - a.cartoes || a.nome.localeCompare(b.nome));

      res.json({ teamId: Number(teamId), total: stats.length, stats });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao gerar estatísticas' });
    }
  }

  private static async handlePlayersForTeamCreation(teamId: number, jogadores: any[]): Promise<void> {
    for (const jogador of jogadores) {
      try {
        if (jogador.id) {
          const playerExists = await Player.findByPk(jogador.id);
          if (playerExists && !playerExists.isDeleted) {
            const existingAssociation = await TeamPlayer.findOne({
              where: { teamId: teamId, playerId: jogador.id }
            });
            if (!existingAssociation) {
              await TeamPlayer.create({ teamId: teamId, playerId: jogador.id });
              console.log(`Jogador ${jogador.id} associado ao time`);
            }
          }
        } else {
          const nomePlayer = (jogador.nome || jogador.name || '').trim();
          const sexoPlayer = jogador.sexo || jogador.gender || '';
          const anoPlayer = jogador.ano || jogador.dateOfBirth || '';
          const posicaoPlayer = jogador.posicao || jogador.position || '';
          
          if (!nomePlayer || !sexoPlayer || !anoPlayer || !posicaoPlayer) {
            console.warn(`Jogador ignorado - campos obrigatórios faltando:`, {
              nome: nomePlayer || 'VAZIO',
              sexo: sexoPlayer || 'VAZIO',
              dateOfBirth: anoPlayer || 'VAZIO',
              posicao: posicaoPlayer || 'VAZIO'
            });
            continue;
          }
          
          try {
            const newPlayer = await Player.create({
              name: nomePlayer.toLowerCase(),
              gender: sexoPlayer,
              dateOfBirth: anoPlayer,
              position: posicaoPlayer,
              isDeleted: false
            });
            
            await TeamPlayer.create({ teamId: teamId, playerId: newPlayer.id });
            console.log(`Novo jogador criado e associado: ${newPlayer.name} (ID: ${newPlayer.id})`);
          } catch (createError: any) {
            console.error(`Erro ao criar jogador "${nomePlayer}":`, createError);
            console.error('Detalhes do erro:', {
              name: createError?.name,
              message: createError?.message,
              errors: createError?.errors
            });
          }
        }
      } catch (playerError: any) {
        console.error(`Erro ao processar jogador individual:`, playerError);
        console.error('Stack:', playerError?.stack);
      }
    }
  }

  private static async handlePlayersAssociations(teamId: number, jogadoresUpdate: any[]): Promise<void> {
    const currentPlayers = await Player.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: Team,
          as: 'teams',
          where: { id: teamId },
          through: { attributes: [] }
        }
      ]
    });

    const playerIdsToKeep = jogadoresUpdate
      .filter((j: any) => j.id)
      .map((j: any) => j.id);

    for (const playerId of playerIdsToKeep) {
      const alreadyAssociated = currentPlayers.some(p => p.id === playerId);
      
      if (!alreadyAssociated) {
        const playerExists = await Player.findByPk(playerId);
        if (playerExists && !playerExists.isDeleted) {
          await TeamPlayer.create({ teamId: teamId, playerId: playerId });
        }
      }
    }

    for (const player of currentPlayers) {
      if (!playerIdsToKeep.includes(player.id)) {
        await TeamPlayer.destroy({ where: { teamId: teamId, playerId: player.id } });
      }
    }
  }
}
