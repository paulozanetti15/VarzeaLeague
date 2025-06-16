import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MatchTeamsModel from '../models/MatchTeamsModel';
import TeamModel from '../models/TeamModel';
import User from '../models/UserModel';
import RulesModel from '../models/RulesModel';
import PlayerModel from '../models/PlayerModel';
import MatchPlayersModel from '../models/MatchPlayersModel';
import MatchModel from '../models/MatchModel';
import Sequelize from "sequelize";
import jwt from 'jsonwebtoken';
import TeamPlayer from "../models/TeamPlayerModel";
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const joinMatchByTeam = async (req: any, res: any) => {
  try {
    const { teamId, matchId } = req.body; 
    const match = await MatchModel.findByPk(matchId, {
      attributes: ['title', 'date', 'location', 'status', 'description', 'price', 'organizerId']
    });

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;
    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (match.status !== 'open') {
      res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
      return;
    }

    const team = await TeamModel.findOne({
      where: {
        id: teamId,
        isDeleted: false
      },
      attributes: [
        'id', 
        'name',
        'captainId'
      ]
    });
    
    if (!team) {
      res.status(404).json({ message: 'Time não encontrado ou foi removido' });
      return;
    }

    const regras = await RulesModel.findOne({ where: { partidaId: matchId } });
    const teamIsAlreadyInMatch = await MatchTeamsModel.findOne({ where: { matchId, teamId } });

    if (teamIsAlreadyInMatch) {
      return res.status(400).json({ message: 'Time já está inscrito nesta partida' });
    }

    if (regras.sexo !== "Ambos") {
      if (await verifyTeamsGenderRules(req, res, teamId, regras.sexo) === false) {
        return res.status(403).json({ message: `Time não se qualifica nas regras de gênero da partida` });
      }
      if (!await isTimePossuiCategoriaValido(teamId, matchId)) {
        return res.status(403).json({ message: `Time não se qualifica nas regras de categoria da partida` });
      }
      else {
        await MatchTeamsModel.create({
          matchId: matchId,
          teamId: teamId
        });
        res.status(201).json({ message: 'Time inscrito na partida com sucesso' });
      }
    }
    else {
      if (await isTimePossuiCategoriaValido(teamId, matchId) === false) {
        return res.status(403).json({ message: `Time não se qualifica nas regras de categoria da partida` });
      }
      else {
        await MatchTeamsModel.create({
          matchId: matchId,
          teamId: teamId
        });
        res.status(201).json({ message: 'Time inscrito na partida com sucesso' });
      }  
    }
  }
  catch (error) {
    console.error('Erro ao inscrever time na partida:', error); 
    res.status(500).json({ message: 'Erro ao inscrever time na partida' });
  }
};

const isTimePossuiCategoriaValido = async (teamId: number, matchId: number) => {
  const idades = [];
  const regras = await RulesModel.findAll({
    where: { partidaId: matchId }
  });

  const jogadoresDentroPartida = await TeamPlayer.findAll({
    where: { teamId: teamId },
    attributes: ['playerId'],
  });

  const teamIds = jogadoresDentroPartida.map((row: any) => row.playerId);
  const idadesJogadores = await PlayerModel.findAll({
    attributes: ['ano'],
    where: {
      id: {
        [Sequelize.Op.in]: teamIds
      }
    }
  });

  idades.push(idadesJogadores.map((jogador: any) => {
    const anoAtual = new Date().getFullYear();
    return anoAtual - jogador.ano;
  }));

  // Verificar idade mínima e máxima
  const idadeMinima = regras[0].idade_minima;
  const idadeMaxima = regras[0].idade_maxima;

  for (const idade of idades[0]) {
    if (idade < idadeMinima || idade > idadeMaxima) {
      return false;
    }
  }

  return true;
};

export const verifyTeamsGenderRules = async (req: any, res: any, teamId: number, regraSexo: string): Promise<boolean> => {
  let isValid = true;
  const jogadoresDentroPartida = await TeamPlayer.findAll({
    where: { teamId: teamId },
    attributes: ['playerId'],
  });

  const PlayerIds = jogadoresDentroPartida.map((team: any) => team.playerId);
  const playersWithDifferentGender = await PlayerModel.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: PlayerIds
      },
      sexo: {
        [Sequelize.Op.ne]: regraSexo
      }
    },
    attributes: ['sexo']
  });

  if (playersWithDifferentGender.length > 0) {
    return isValid = false;
  }  
  return isValid;
};

export const getMatchTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = parseInt(req.params.matchId, 10);

    const teams = await MatchTeamsModel.findAll({
      where: { matchId },
      include: [{
        model: TeamModel,
        as: 'Team',
        attributes: ['id', 'name', 'userId']
      }]
    });

    res.status(200).json(teams);
  } catch (error) {
    console.error('Erro ao buscar times da partida:', error);
    res.status(500).json({ message: 'Erro ao buscar times da partida' });
  }
};

export const getTeamsAvailable = async (req: any, res: any) => {
  try {
    const Teams = await MatchTeamsModel.findAll({
      attributes: ['teamId'],
      where: {
        matchId: req.params.id
      },
      raw: true,
    });

    const teamIds = Teams.map((team: any) => team.teamId);
    const Avaiableteams = await TeamModel.findAll({
      where: {
        id: {
          [Sequelize.Op.notIn]: teamIds
        }
      }
    });

    res.status(200).json(Avaiableteams);   
  }
  catch (error) {
    console.error('Erro ao obter times disponíveis:', error);
    res.status(500).json({ message: 'Erro ao obter times disponíveis' });
  }
};

export const deleteTeamMatch = async (req: any, res: any) => {
  try {
    const { id, teamId } = req.params;
    const match = await MatchModel.findByPk(id);
    if (!match) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }

    const team = await TeamModel.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Time não encontrado' });
    }

    await MatchTeamsModel.destroy({
      where: {
        matchId: id,
        teamId,
      }
    });

    res.status(200).json({ message: 'Time removido da partida com sucesso' });
  }
  catch (error) {
    console.error('Erro ao remover time da partida:', error);
    res.status(500).json({ message: 'Erro ao remover time da partida' });
  }
};

export const checkTeamsRuleCompliance = async (req: any, res: any) => {
  const { id } = req.params;
  const matchId = parseInt(id, 10);
  const regras = await RulesModel.findOne({ where: { partidaId: id } });
  const matchTeams = await MatchTeamsModel.findAll({
    where: { matchId: matchId },
    attributes: ['teamId']
  }); 

  if (!regras) return;

  for (const matchTeam of matchTeams) {
    const teamId = matchTeam.teamId;
    const team = await TeamModel.findByPk(teamId, {
      attributes: ['name']
    });
    const nome = team.dataValues.name;  

    if (regras.sexo !== "Ambos") {
      if (await isTimePossuiCategoriaValido(teamId, id) === false || await verifyTeamsGenderRules(req, res, teamId, regras.sexo) === false) {
        await MatchTeamsModel.destroy({
          where: {
            matchId: matchId,
            teamId: teamId
          }
        });
        res.status(403).json({ message: `Time ${nome} não se qualifica nas regras de categoria da partida` });
      }
    }
  }
};

// Função auxiliar para verificar se um jogador atende às regras
const checkPlayerRules = async (playerId: number, matchId: number) => {
  const player = await PlayerModel.findByPk(playerId);
  const rules = await RulesModel.findOne({ where: { partidaId: matchId } });

  if (!player || !rules) return false;

  // Verificar idade
  const idade = new Date().getFullYear() - player.ano;
  if (rules.idade_minima && idade < rules.idade_minima) return false;
  if (rules.idade_maxima && idade > rules.idade_maxima) return false;

  // Verificar sexo
  if (rules.sexo && player.sexo !== rules.sexo) return false;

  return true;
};

export const linkTeamToMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const { playerIds } = req.body; // Array de IDs dos jogadores selecionados
    const userId = req.user?.id;

    // Verificar se o usuário tem permissão (userTypeId = 3)
    const user = await User.findByPk(userId);
    if (!user || user.userTypeId !== 3) {
      res.status(403).json({ message: 'Usuário não tem permissão para vincular times' });
      return;
    }

    // Buscar o time do usuário
    const team = await TeamModel.findOne({
      where: { userId }
    });

    if (!team) {
      res.status(404).json({ message: 'Você precisa ter um time cadastrado para participar de partidas' });
      return;
    }

    // Verificar se o time já está vinculado a esta partida
    const existingLink = await MatchTeamsModel.findOne({
      where: {
        matchId,
        teamId: team.id
      }
    });

    if (existingLink) {
      res.status(400).json({ message: 'Time já está vinculado a esta partida' });
      return;
    }

    // Verificar se há pelo menos 7 jogadores selecionados
    if (!playerIds || playerIds.length < 7) {
      res.status(400).json({ message: 'É necessário selecionar no mínimo 7 jogadores' });
      return;
    }

    // Verificar se todos os jogadores pertencem ao time
    const teamPlayers = await PlayerModel.findAll({
      where: { teamId: team.id }
    });

    const teamPlayerIds = teamPlayers.map(player => player.id);
    const invalidPlayers = playerIds.filter(id => !teamPlayerIds.includes(id));

    if (invalidPlayers.length > 0) {
      res.status(400).json({ message: 'Alguns jogadores selecionados não pertencem ao seu time' });
      return;
    }

    // Verificar regras para cada jogador
    for (const playerId of playerIds) {
      const isEligible = await checkPlayerRules(playerId, matchId);
      if (!isEligible) {
        res.status(400).json({ 
          message: 'Um ou mais jogadores não atendem aos requisitos da partida (idade ou sexo)' 
        });
        return;
      }
    }

    // Criar o vínculo do time
    const matchTeam = await MatchTeamsModel.create({
      matchId,
      teamId: team.id
    });

    // Vincular os jogadores selecionados
    await Promise.all(playerIds.map(playerId => 
      MatchPlayersModel.create({
        matchId,
        playerId,
        teamId: team.id
      })
    ));

    res.status(201).json({
      message: 'Time e jogadores vinculados com sucesso',
      data: {
        matchTeam,
        playerCount: playerIds.length
      }
    });

  } catch (error) {
    console.error('Erro ao vincular time à partida:', error);
    res.status(500).json({ message: 'Erro ao vincular time à partida' });
  }
};

export const getTeamPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const userId = (req as AuthRequest).user?.id;

    // Buscar o time do usuário
    const team = await TeamModel.findOne({
      where: { userId }
    });

    if (!team) {
      res.status(404).json({ message: 'Time não encontrado' });
      return;
    }

    // Buscar todos os jogadores do time
    const players = await PlayerModel.findAll({
      where: { teamId: team.id },
      attributes: ['id', 'nome', 'ano', 'sexo', 'posicao']
    });

    // Buscar as regras da partida
    const rules = await RulesModel.findOne({
      where: { partidaId: matchId }
    });

    // Verificar elegibilidade de cada jogador
    const playersWithEligibility = await Promise.all(
      players.map(async (player) => {
        const isEligible = await checkPlayerRules(player.id, matchId);
        return {
          ...player.toJSON(),
          isEligible
        };
      })
    );

    res.status(200).json(playersWithEligibility);

  } catch (error) {
    console.error('Erro ao buscar jogadores do time:', error);
    res.status(500).json({ message: 'Erro ao buscar jogadores do time' });
  }
};

export const unlinkTeamFromMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matchId = parseInt(req.params.matchId, 10);
    const userId = req.user?.id;

    // Verificar se o usuário tem permissão (userTypeId = 3)
    const user = await User.findByPk(userId);
    if (!user || user.userTypeId !== 3) {
      res.status(403).json({ message: 'Usuário não tem permissão para desvincular times' });
      return;
    }

    // Buscar o time do usuário
    const team = await TeamModel.findOne({
      where: { userId }
    });

    if (!team) {
      res.status(404).json({ message: 'Time não encontrado' });
      return;
    }

    // Remover os jogadores vinculados
    await MatchPlayersModel.destroy({
      where: {
        matchId,
        teamId: team.id
      }
    });

    // Remover o vínculo do time
    const deleted = await MatchTeamsModel.destroy({
      where: {
        matchId,
        teamId: team.id
      }
    });

    if (deleted === 0) {
      res.status(404).json({ message: 'Vínculo não encontrado' });
      return;
    }

    res.status(200).json({ message: 'Time e jogadores desvinculados com sucesso' });

  } catch (error) {
    console.error('Erro ao desvincular time da partida:', error);
    res.status(500).json({ message: 'Erro ao desvincular time da partida' });
  }
};

