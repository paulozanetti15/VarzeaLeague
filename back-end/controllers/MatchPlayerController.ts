import MatchPlayer from "../models/MatchPlayersModel";
import Match from "../models/MatchModel";
import User from "../models/UserModel";
import Team from "../models/TeamModel";
import Sequelize from "sequelize";
import TeamPlayer from "../models/TeamPlayerModel";
import RulesModel from "../models/RulesModel";
import jwt from 'jsonwebtoken';
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

// ... resto do código permanece igual
async function getMatchPlayers(req: any, res: any) {
    try {
      // Verificar se a partida existe
      const matchId = parseInt(req.params.id, 10);
      const matchExists = await Match.findByPk(matchId);
      if (!matchExists) {
        return res.json({ 
          message: 'Partida não encontrada',
          players: [],
          meta: {
            totalIndividualPlayers: 0,
            totalTeams: 0,
            totalTeamPlayers: 0,
            totalPlayers: 0,
            isEmpty: true,
            error: true,
            errorType: 'MATCH_NOT_FOUND'
          }
        });
      }
      
      // Contagem de jogadores na partida
      const matchPlayerCount = await MatchPlayer.findAndCountAll({ 
        where: { matchId: matchId }
      });
      const actualPlayerCount = matchPlayerCount.count || 0;
      
      if (actualPlayerCount === 0) {
        // Se não houver jogadores, retornar resposta vazia mas válida
        return res.json({
          players: [],
          meta: {
            totalIndividualPlayers: 0,
            totalTeams: 0,
            totalTeamPlayers: 0,
            totalPlayers: 0,
            isEmpty: true,
            hasPlayersInDB: false
          }
        });
      }
      
      // Buscar jogadores individuais
      const regularPlayersData = await User.findAll({
        attributes: [
          'id',
          'name',
          'email',
          [Sequelize.literal('false'), 'isTeam'],
          [Sequelize.literal('null'), 'teamId'],
          [Sequelize.literal('null'), 'teamName'],
          [Sequelize.literal('null'), 'playerCount'],
        ],
        include: [{
          model: MatchPlayer,
          attributes: [],
          where: {
            match_id: matchId
          },
          required: true
        }],
        raw: true
      });
      
      // Transformar os resultados para o formato correto
      const regularPlayers = regularPlayersData.map(player => ({
        ...player,
        isTeam: false,
        teamId: null,
        teamName: null,
        playerCount: null
      }));
      
      // Buscar times participantes
      const teamPlayersData = await MatchPlayer.findAll({
        attributes: [
          ['user_id', 'id'],
          ['team_id', 'teamId'],
          ['match_id', 'matchId']
        ],
        include: [
          {
            model: User,
            attributes: ['name', 'email'],
            required: true
          },
          {
            model: Team,
            attributes: ['name'],
            required: false
          }
        ],
        where: {
          matchId: matchId,
          '$MatchPlayer.is_team$': true
        },
        raw: true,
        nest: true
    });
    let playerCount = 1;
    const matchIdteamplayers=teamPlayersData.map((team: any) => team.matchId)[0];
    if (teamPlayersData.length === 0) {
      const playerCount = await TeamPlayer.count({ where: { teamId: matchIdteamplayers } }) || 1;
    }
    const teamPlayers = teamPlayersData.map((team: any) => ({
        id: team.teamId,
        name: team.User.name,
        email: team.User.email,
        isTeam: true,
        teamId: team.teamId,
        teamName: team.Team?.name || 'Time sem nome',
        playerCount: playerCount,
    })); 
    const allPlayers = [...regularPlayers, ...teamPlayers];
    const totalRegularPlayers = regularPlayers.length;
    const totalTeams = teamPlayers.length;
    const totalTeamPlayers = teamPlayers.reduce((acc, team) =>
        acc + (parseInt(String(team.playerCount), 10) || 1), 0);
    const totalPlayers = totalRegularPlayers + totalTeamPlayers;
    return res.json({
        players: allPlayers,
        meta: {
          totalIndividualPlayers: totalRegularPlayers,
          totalTeams,
          totalTeamPlayers,
          totalPlayers,
          isEmpty: allPlayers.length === 0,
          hasPlayersInDB: actualPlayerCount > 0
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar jogadores da partida:', error);
      return res.json({
        players: [],
        meta: {
          totalIndividualPlayers: 0,
          totalTeams: 0,
          totalTeamPlayers: 0,
          totalPlayers: 0,
          isEmpty: true,
          error: true,
          errorMessage: String(error),
          hasPlayersInDB: false
        }
      });
    }
}
async function leaveMatchPlayer(req: any, res: any) {
  try {
    const match = await Match.findByPk(req.params.id);
    const token = req.headers.authorization?.replace('Bearer ', '');
    try {
      const decodedPayload = jwt.decode(token);
      console.log('Estrutura do token (sem verificação):', decodedPayload);
    } catch (decodeErr) {
      console.error('Erro ao decodificar token:', decodeErr);
    }

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = parseInt(decoded.id, 10);
    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    const user = await User.findByPk(userId);
    if (user) {
      await (match as any).removePlayers(user);
      console.log('Usuário', userId, 'saiu da partida', match.id);
      res.json({ message: 'Você saiu da partida com sucesso' });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao sair da partida:', error);
    res.status(500).json({ message: 'Erro ao sair da partida' });
  }            
}
async function joinMatchByTeam(req: any, res: any) {
  try {
    const matchId = parseInt(req.params.id, 10);
    const { teamId } = req.body;  
    const match = await Match.findByPk(matchId, {
      attributes: [ 'title', 'date', 'location', 'status', 'description', 'price', 'organizerId']
    })
    const token = req.headers.authorization?.replace('Bearer ', '');
    try {
      const decodedPayload = jwt.decode(token);
      console.log('Estrutura do token (sem verificação):', decodedPayload);
    } catch (decodeErr) {
      console.error('Erro ao decodificar token:', decodeErr);
    }

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id
    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (match.status !== 'open') {
      res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
      return;
    }
    // Verificar se o time existe e se o usuário é capitão
    const team = await Team.findOne({
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
    
    // Then get the player count for this team
    const playerCount = await TeamPlayer.count({
      where: { teamId: teamId }
    });
    
    // Create a result object similar to what you had with the raw query
    const teamResult = {
      id: team.id,
      name: team.name,
      captainId: team.captainId,
      playerCount: playerCount
    };

    const existingEntry = await MatchPlayer.findOne({
       where: {
       matchId,
       teamId: parseInt(userId, 10),
    }
   });

   if (existingEntry) {
     res.status(400).json({ message: 'Este time já está inscrito nesta partida' });
     return;
   }
// Verificar se há vagas suficientes na partida
  const matchRules = await RulesModel.findOne({
    where: { matchId: matchId }
  });
  matchRules.toJSON();
  if (teamResult.playerCount > matchRules.toJSON().maxparticipantes) {
    res.status(400).json({ message: 'Número máximo de jogadores excedido para este time' });
    return;
  }
  if (teamResult.playerCount < matchRules.toJSON().minparticipantes) {
    res.status(400).json({ message: 'Número mínimo de jogadores não atingido para este time' });
    return;
  }
 else 
  await MatchPlayer.create({
    matchId: matchId,
    teamId: teamId,
  });
  res.json({ 
    message: 'Time inscrito na partida com sucesso',
    details: {
       matchId,
       teamId,
       teamName: team.name,
      }
    });
  } catch (error) {
    console.error('Erro ao entrar na partida com o time:', error);
    res.status(500).json({ message: 'Erro ao entrar na partida com o time' });
  }
}

export { getMatchPlayers,  leaveMatchPlayer, joinMatchByTeam };
export default { getMatchPlayers, leaveMatchPlayer, joinMatchByTeam }; 
