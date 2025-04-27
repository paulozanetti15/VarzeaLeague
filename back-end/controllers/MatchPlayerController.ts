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
    const playerCount = await TeamPlayer.count({
      where: { teamId: teamId }
    });
  
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
    where: { partidaid: matchId }
  });
  if (teamResult.playerCount > matchRules.toJSON().maxparticipantes) {
    res.status(400).json({ message: 'Número máximo de jogadores excedido para este time' });
    return;
  }
  if (teamResult.playerCount < matchRules.toJSON().minparticipantes) {
    res.status(400).json({ message: 'Número mínimo de jogadores não atingido para este time' });
    return;
  }
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

const getMattchTeams = async (req: any, res: any) => {
  try {
    const matchId = parseInt(req.params.id, 10);
    const match = await Match.findByPk(matchId, {
      attributes: [ 'title', 'date', 'location', 'status', 'description', 'price', 'organizerId']
    })
    console.log('match', match)
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    const teams=await MatchPlayer.findAll({
      where: { matchId },
    });
    const teamIds = teams.map((team: any) =>team.teamId);
    const teamDetails = await Team.findAll({
      where: { id: teamIds },
      attributes: ['id', 'name', 'captainId','banner'],
    });
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    res.json(teamDetails);
  } catch (error) {
    console.error('Erro ao obter times da partida:', error);
    res.status(500).json({ message: 'Erro ao obter times da partida' });
  }
}

export {joinMatchByTeam, getMattchTeams}; 
