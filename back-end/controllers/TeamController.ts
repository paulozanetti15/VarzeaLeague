import { Request, Response } from 'express';
import Team from '../models/TeamModel';
import User from '../models/UserModel';
import Player from '../models/PlayerModel';
import TeamPlayer from '../models/TeamPlayerModel';
import { Op, Sequelize, fn, col } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import MatchTeams from '../models/MatchTeamsModel';
import TeamChampionship from '../models/TeamChampionshipModel';
import MatchChampionshpReport from '../models/MatchReportChampionshipModel';
dotenv.config();
export class TeamController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, primaryColor, secondaryColor, estado, cidade, cep } = req.body;
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
            cep,
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
                playerId: newPlayer.id
              });
            }
          }
          
          // Adicionar o usuário ao time (se já não for capitão)
          await existingDeletedTeam.addUser(captainId);
          
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
        primaryColor,
        secondaryColor,
        isDeleted: false,
        banner: bannerFilename,
        estado,
        cidade,
        cep
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
            playerId: newPlayer.id
          });
        }
      }
      
      // Adicionar o usuário ao time (para estabelecer a relação entre usuário e time)
      await team.addUser(captainId);
      
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
      
      // Buscar todos os times que não estão deletados
      const allTeams = await Team.findAll({
        where: {
          isDeleted: false,
          // Buscar times onde o usuário é capitão
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
      
      // Buscar times onde o usuário é um membro (através da tabela de associação)
      const teamsWhereUserIsMember = await Team.findAll({
        where: {
          isDeleted: false,
          captainId: { [Op.ne]: userId } // Excluir times onde o usuário já é capitão
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
      
      // Combinar os resultados (sem duplicatas)
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
            quantidadePartidas: quantidadePartidas // This is now a number, not a Promise
          };
        })
      );
      
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
        cep: req.body.cep,
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
              playerId: newPlayer.id
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
static async getTeamCaptain(req: AuthRequest, res:Response) : Promise<void> {
  try{
    const userId = req.user?.id;
    const { id } = req.params
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }
    const team = await Team.findOne({
      where:{ captainId:id}
    })
    res.status(200).json(team)
    }
  catch{
      res.status(500).json({error:'Erro ao buscar dados do time'})
    }
  }

  static async getTeamRanking(req: AuthRequest, res:Response) : Promise<void> {
    try{
      let teamsRanking=[]
      let nameTeam=""
      const userId = req.user?.id;
      const { id } = req.params
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      //Buscar times que disputaram o campeonato
      let teams=await TeamChampionship.findAll({where:{
          ChampionshipId:id
      }})
      const uniqueTeamIds = [...new Set(teams.map(team => team.dataValues.teamId))];
      for (const teamId of uniqueTeamIds ){
        let totalGoalsScore=0
        let totalGoalsAgainst =0
        let saldoGoals=0
        let pontuacaoTeam=0
        let countVitoria=0
        let countDerrota=0
        let countEmpate=0
        const partidas = await MatchChampionshpReport.findAll({
          where: {
            [Op.or]: [
                { team_home: teamId },
                { team_away: teamId }
            ]
          },
          include: 
          [
            {
              model: Team,
              as:'teamHome',
              attributes: ['name']
            },
            {
              model: Team,
              as:'teamAway',
              attributes: ['name']
            },   
          ]
        })   
        partidas.map((partida)=>{
          
          if(partida.dataValues.team_home===teamId)
          { 
            const goalsFeitos = partida.dataValues.teamHome_score || 0;
            const goalsSofridos = partida.dataValues.teamAway_score || 0;   
            totalGoalsScore += goalsFeitos;
            totalGoalsAgainst += goalsSofridos;
            nameTeam = partida.dataValues.teamHome.name;
            if(goalsFeitos>goalsSofridos){
              pontuacaoTeam += 3;
              countVitoria +=1;
              
            }
            else if(goalsSofridos===goalsFeitos){
              pontuacaoTeam += 1;
              countEmpate +=1;
            }
            else{
              countDerrota +=1
            } 

          }
          else if(partida.dataValues.team_away===teamId)
          { 
            const goalsFeitos = partida.dataValues.teamAway_score || 0;
            const goalsSofridos = partida.dataValues.teamHome_score || 0;

            if(goalsFeitos>goalsSofridos){
              pontuacaoTeam += 3;
              countVitoria+=1;
            }
            else if(goalsSofridos===goalsFeitos){
              pontuacaoTeam += 1;
              countEmpate+=1;
            }
            else{
              countDerrota +=1;
            }
            
            totalGoalsScore += goalsFeitos
            totalGoalsAgainst += goalsSofridos
            nameTeam=partida.dataValues.teamAway.name
          }
          saldoGoals=totalGoalsScore-totalGoalsAgainst
          
        })
        teamsRanking.push({
          pontuacaoTime:pontuacaoTeam,
          nomeTime: nameTeam,
          goalsScore: totalGoalsScore,
          againstgoals: totalGoalsAgainst,
          countVitorias: countVitoria,
          countDerrotas: countDerrota,
          countEmpates : countEmpate,
          saldogoals: saldoGoals
        });
      }
      const sortedteamsRanking=teamsRanking.sort((a,b)=>{
        if(b.pontuacaoTime!==a.pontuacaoTime){
          return b.pontuacaoTime- a.pontuacaoTime
        }
        else{
           return b.saldoGoals- a.saldoGoals
        }
      })
      res.status(200).json(sortedteamsRanking)
    }
    catch{
      res.status(500).json({error:'Erro ao buscar dados do time'})
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
        include: [{ model: Player, as: 'player', attributes: ['id','nome','posicao','sexo'] }] as any
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
      if (matchIds.length === 0) { res.json({ teamId: Number(id), total: teamPlayers.length, stats: teamPlayers.map((tp: any) => ({
        playerId: tp.playerId,
        nome: tp.player?.nome || 'N/A',
        posicao: tp.player?.posicao || null,
        sexo: tp.player?.sexo || null,
        gols: 0,
        amarelos: 0,
        vermelhos: 0,
        cartoes: 0,
      })) }); return; }

      const goals = await (await import('../models/MatchGoalModel')).default.findAll({
        attributes: ['player_id', [fn('COUNT', col('id')), 'gols']],
        where: {
          player_id: playerIds,
          match_id: { [Op.in]: matchIds }
        },
        group: ['player_id']
      });
      const yellowCards = await (await import('../models/MatchCardModel')).default.findAll({
        attributes: ['player_id', [fn('COUNT', col('id')), 'amarelos']],
        where: {
          player_id: playerIds,
          card_type: 'yellow',
          match_id: { [Op.in]: matchIds }
        },
        group: ['player_id']
      });
      const redCards = await (await import('../models/MatchCardModel')).default.findAll({
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
          nome: tp.player?.nome || 'N/A',
          posicao: tp.player?.posicao || null,
          sexo: tp.player?.sexo || null,
          gols,
          amarelos,
          vermelhos,
          cartoes: amarelos + vermelhos
        };
      }).sort((a: any, b: any) => b.gols - a.gols || b.cartoes - a.cartoes || a.nome.localeCompare(b.nome));

      res.json({ teamId: Number(id), total: stats.length, stats });
    } catch (error) {
      console.error('Erro ao gerar estatísticas de jogadores do time:', error);
      res.status(500).json({ error: 'Erro ao gerar estatísticas' });
    }
  }
}



