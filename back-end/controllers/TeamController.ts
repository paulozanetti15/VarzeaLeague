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
      console.log('=== INICIANDO CRIAÇÃO DE TIME ===');
      console.log('Body recebido:', {
        name: req.body.name,
        description: req.body.description,
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        estado: req.body.estado,
        cidade: req.body.cidade,
        cep: req.body.cep,
        jogadores: req.body.jogadores
      });
      console.log('Arquivo recebido:', req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'Nenhum arquivo');
      
      const { name, description, primaryColor, secondaryColor, estado, cidade, cep } = req.body;
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
      
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        console.error('Token não fornecido');
        res.status(401).json({ error: 'Token não fornecido' });
        return;
      }
      
      let decodedPayload;
      try {
        decodedPayload = jwt.decode(token);
        console.log('Token decodificado:', decodedPayload);
      } catch (decodeErr) {
        console.error('Erro ao decodificar token:', decodeErr);
        res.status(401).json({ error: 'Token inválido' });
        return;
      }
      
      let captainId = decodedPayload?.id;
      if (!captainId) {
        console.error('captainId não encontrado no token');
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      
      // Garantir que captainId seja um número
      captainId = Number(captainId);
      if (isNaN(captainId)) {
        console.error('captainId inválido:', decodedPayload?.id);
        res.status(401).json({ error: 'ID do usuário inválido' });
        return;
      }
      
      console.log('captainId validado:', captainId);
      
      // Validações obrigatórias
      if (!name || !name.trim()) {
        console.error('Nome do time não fornecido');
        res.status(400).json({ error: 'Nome do time é obrigatório' });
        return;
      }
      
      // Garantir que cep tenha um valor (mesmo que vazio, mas não null)
      const cepValue = (cep && cep.trim()) ? cep.trim() : '00000-000';
      console.log('CEP processado:', cepValue);
      
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
            description: description || null,
            captainId,
            isDeleted: false,
            updatedAt: agora,
            estado: estado || null,
            cidade: cidade || null,
            cep: cepValue,
            primaryColor: primaryColor || null,
            secondaryColor: secondaryColor || null,
            banner: bannerFilename
          });
          
         
          
          // Adicionar o usuário ao time (se já não for capitão)
          try {
            await existingDeletedTeam.addUser(captainId);
          } catch (addUserError: any) {
            console.error('Erro ao adicionar usuário ao time:', addUserError);
            // Se já existe a associação, não é um erro crítico
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
              // Não falhar a restauração do time se houver erro nos jogadores
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
      console.log('Criando novo time com dados:', {
        name: name.trim(),
        description: description || null,
        captainId,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        isDeleted: false,
        banner: bannerFilename,
        estado: estado || null,
        cidade: cidade || null,
        cep: cepValue
      });
      const team = await Team.create({
        name: name.trim(),
        description: description || null,
        captainId,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        isDeleted: false,
        banner: bannerFilename,
        estado: estado || null,
        cidade: cidade || null,
        cep: cepValue
      });
      console.log('Time criado com sucesso, ID:', team.id);
      
      // Adicionar o capitão como usuário do time
      try {
        await team.addUser(captainId);
      } catch (addUserError: any) {
        console.error('Erro ao adicionar usuário ao time:', addUserError);
        // Se já existe a associação, não é um erro crítico
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
          // Não falhar a criação do time se houver erro nos jogadores
          // O time já foi criado, então continuamos
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

      // Atualizar associações de jogadores (apenas associar/desassociar, não criar/editar)
      if (jogadoresUpdate) {
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

  // Helper privado para criar e associar jogadores durante a criação do time
  private static async handlePlayersForTeamCreation(teamId: number, jogadores: any[]): Promise<void> {
    for (const jogador of jogadores) {
      try {
        // Se o jogador já tem ID, apenas associar
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
          // Validar campos obrigatórios antes de criar
          const nomePlayer = (jogador.nome || jogador.name || '').trim();
          const sexoPlayer = jogador.sexo || jogador.gender || '';
          const anoPlayer = jogador.ano || jogador.year || '';
          const posicaoPlayer = jogador.posicao || jogador.position || '';
          
          if (!nomePlayer || !sexoPlayer || !anoPlayer || !posicaoPlayer) {
            console.warn(`Jogador ignorado - campos obrigatórios faltando:`, {
              nome: nomePlayer || 'VAZIO',
              sexo: sexoPlayer || 'VAZIO',
              ano: anoPlayer || 'VAZIO',
              posicao: posicaoPlayer || 'VAZIO'
            });
            continue; // Pular este jogador
          }
          
          // Criar novo jogador e associar
          try {
            const newPlayer = await Player.create({
              nome: nomePlayer,
              sexo: sexoPlayer,
              ano: anoPlayer,
              posicao: posicaoPlayer,
              isDeleted: false
            });
            
            // Associar ao time
            await TeamPlayer.create({ teamId: teamId, playerId: newPlayer.id });
            console.log(`Novo jogador criado e associado: ${newPlayer.nome} (ID: ${newPlayer.id})`);
          } catch (createError: any) {
            console.error(`Erro ao criar jogador "${nomePlayer}":`, createError);
            console.error('Detalhes do erro:', {
              name: createError?.name,
              message: createError?.message,
              errors: createError?.errors
            });
            // Continuar com próximo jogador mesmo se houver erro
          }
        }
      } catch (playerError: any) {
        console.error(`Erro ao processar jogador individual:`, playerError);
        console.error('Stack:', playerError?.stack);
        // Continuar com próximo jogador mesmo se houver erro
      }
    }
  }

  // Helper privado para gerenciar associações de jogadores com o time
  // NÃO cria nem atualiza jogadores - apenas associa/desassocia jogadores já existentes
  private static async handlePlayersAssociations(teamId: number, jogadoresUpdate: any[]): Promise<void> {
    // Buscar jogadores atualmente associados ao time
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

    // IDs dos jogadores que devem permanecer associados
    const playerIdsToKeep = jogadoresUpdate
      .filter((j: any) => j.id) // Apenas jogadores que já existem
      .map((j: any) => j.id);

    // Adicionar novos jogadores ao time (apenas associação, jogadores já devem existir)
    for (const playerId of playerIdsToKeep) {
      const alreadyAssociated = currentPlayers.some(p => p.id === playerId);
      
      if (!alreadyAssociated) {
        // Verificar se o jogador existe
        const playerExists = await Player.findByPk(playerId);
        if (playerExists && !playerExists.isDeleted) {
          await TeamPlayer.create({ teamId: teamId, playerId: playerId });
        }
      }
    }

    // Remover associações de jogadores que não estão mais na lista
    for (const player of currentPlayers) {
      if (!playerIdsToKeep.includes(player.id)) {
        await TeamPlayer.destroy({ where: { teamId: teamId, playerId: player.id } });
      }
    }
  }
}
