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
      const { name, description, primaryColor, secondaryColor, estado, cidade, cep } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      let bannerFilename = null;
      if (req.file) {
        bannerFilename = req.file.filename;
      }

      if (!name) {
        res.status(400).json({ message: 'Nome do time é obrigatório' });
        return;
      }

      const existingActiveTeam = await Team.findOne({
        where: { name: name.trim(), isDeleted: false }
      });

      if (existingActiveTeam) {
        res.status(400).json({ message: 'Este nome de time já está em uso. Escolha outro nome.' });
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
          captainId: userId,
          isDeleted: false,
          updatedAt: agora,
          state: estado,
          city: cidade,
          CEP: cep,
          primaryColor,
          secondaryColor,
          banner: bannerFilename
        });

        await existingDeletedTeam.addUser(userId);
        
        const teamWithAssociations = await Team.findByPk(existingDeletedTeam.id, {
          include: [
            {
              model: Player,
              as: 'players',
              through: { attributes: [] }
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

      const team = await Team.create({
        name: name.trim(),
        description,
        captainId: userId,
        primaryColor,
        secondaryColor,
        isDeleted: false,
        banner: bannerFilename,
        state: estado,
        city: cidade,
        CEP: cep
      });
      
      await team.addUser(userId);
      
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
        res.status(500).json({ message: 'Erro ao criar time' });
        return;
      }
      
      const plainTeam = teamWithPlayers.get({ plain: true });
      res.status(201).json(plainTeam);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar time' });
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
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
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
      const { id } = req.params;
      const userId = req.user?.id;
      const team = await Team.findOne({
        where: { id, isDeleted: false }
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
            id: { [Op.ne]: id }, 
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
        await TeamController.handlePlayersAssociations(parseInt(id), jogadoresUpdate);
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
      const { id } = req.params;
      const { confirm } = req.body;
      const userId = req.user?.id;

      if (!confirm) {
        res.status(400).json({ 
          message: 'Confirmação necessária. Para deletar o time, envie confirm: true no corpo da requisição'
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
        res.status(404).json({ message: 'Time não encontrado' });
        return;
      }

      if (team.captainId !== userId) {
        res.status(403).json({ message: 'Apenas o capitão pode deletar o time' });
        return;
      }

      await TeamPlayer.destroy({
        where: {
          teamId: id
        }
      });
      
      await team.destroy();
      
      res.status(200).json({ 
        message: 'Time deletado com sucesso',
        team: {
          id: parseInt(id),
          name: team.name
        }
      });
    } catch (error) {
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
      
      const team = await Team.findByPk(teamId);
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
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const team = await Team.findOne({
        where: { captainId: id }
      });

      res.status(200).json(team);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar dados do time' });
    }
  }

  static async getTeamRanking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const teamsRanking = [];
      let nameTeam = "";
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const teams = await TeamChampionship.findAll({
        where: {
          championshipId: id
        }
      });

      const uniqueTeamIds = [...new Set(teams.map(team => team.dataValues.teamId))];

      for (const teamId of uniqueTeamIds) {
        let totalGoalsScore = 0;
        let totalGoalsAgainst = 0;
        let saldoGoals = 0;
        let pontuacaoTeam = 0;
        let countVitoria = 0;
        let countDerrota = 0;
        let countEmpate = 0;

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
              as: 'teamHome',
              attributes: ['name']
            },
            {
              model: Team,
              as: 'teamAway',
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
            nameTeam = partida.dataValues.teamHome.name;

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
            nameTeam = partida.dataValues.teamAway.name;
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
      res.status(500).json({ message: 'Erro ao buscar dados do time' });
    }
  }

  static async getPlayerStats(req: AuthRequest, res: Response): Promise<void> {
    try {
  const { id } = req.params; // team id
  const teamIdNum = Number(id);
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ error: 'Usuário não autenticado' }); return; }

      // Verificar se o usuário tem acesso ao time (capitão ou membro)
      const team = await Team.findOne({
        where: { id, isDeleted: false },
        include: [
          { model: User, as: 'users', attributes: ['id'], through: { attributes: [] } },
          { model: User, as: 'captain', attributes: ['id'] }
        ]
      });
      if (!team) { res.status(404).json({ error: 'Time não encontrado' }); return; }
      const isCaptain = (team as any).captainId === userId;
      const isMember = (team as any).users?.some((u: any) => u.id === userId);
      if (!isCaptain && !isMember) { res.status(403).json({ error: 'Acesso negado a este time' }); return; }

      // Buscar jogadores do time
      const teamPlayers = await TeamPlayer.findAll({
        where: { teamId: id },
        include: [{ model: Player, as: 'player', attributes: ['id','name','position','gender'] }] as any
      });

      const playerIds = teamPlayers.map((tp: any) => tp.playerId);
      if (playerIds.length === 0) { res.json({ teamId: Number(id), total: 0, stats: [] }); return; }

      // Agregar gols e cartões por player_id
      // Buscar os IDs de partidas nas quais o time participou, para filtrar corretamente
      const matchTeamRows = await MatchTeams.findAll({
        where: { teamId: teamIdNum },
        attributes: ['matchId'],
        raw: true
      });
      const matchIds: number[] = matchTeamRows.map((r: any) => Number(r.matchId)).filter((n) => !Number.isNaN(n));
      if (matchIds.length === 0) { 
        res.json({ 
          teamId: Number(id), 
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

      res.json({ teamId: Number(id), total: stats.length, stats });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao gerar estatísticas' });
    }
  }

  private static async handlePlayersAssociations(teamId: number, jogadoresUpdate: any[]): Promise<void> {
    const currentPlayers = await Player.findAll({
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
