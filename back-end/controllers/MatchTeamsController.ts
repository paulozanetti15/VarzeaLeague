import MatchTeams from "../models/MatchTeamsModel";
import Match from "../models/MatchModel";
import Team from "../models/TeamModel";
import Sequelize from "sequelize";
import RulesModel from "../models/RulesModel";
import jwt from 'jsonwebtoken';
import Playermodel from "../models/PlayerModel";
import TeamPlayer from "../models/TeamPlayerModel";
import User from "../models/UserModel";
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const joinMatchByTeam = async (req: any, res: any) => {

  try {
    const { teamId,matchId } = req.body; 
    const match = await Match.findByPk(matchId, {
      attributes: [ 'title', 'date', 'location', 'status', 'description', 'price', 'organizerId']
    })
    const token = req.headers.authorization?.replace('Bearer ', '');
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
    const regras = await RulesModel.findOne({where : { partidaId: matchId }});
    const teamIsAlreadyInMatch = await MatchTeams.findOne({ where: { matchId, teamId } });
    if(teamIsAlreadyInMatch){
      return res.status(400).json({ message: 'Time já está inscrito nesta partida' });
    }
    // Apenas o criador do time (captainId) pode inscrever seu time; admin pode tudo
    const requester = await User.findByPk(userId).catch(() => null) as any;
    const isAdmin = requester && Number(requester.userTypeId) === 1;
    if (!isAdmin && Number((team as any).captainId) !== Number(userId)) {
      return res.status(403).json({ message: 'Apenas o criador do time pode inscrever este time na partida' });
    }
    // Limite de times por partida: usar regras.quantidade_times ou padrão 2
    const currentTeamsCount = await MatchTeams.count({ where: { matchId } });
    const maxTimes = (regras && Number((regras as any).quantidade_times)) ? Number((regras as any).quantidade_times) : 2;
    if (currentTeamsCount >= maxTimes) {
      return res.status(400).json({ message: 'Partida já está completa' });
    }
    if(regras && regras.dataValues.sexo!=="Ambos"){
      if(await verifyTeamsGenderRules(req, res,teamId,regras.dataValues.sexo)=== false){
        return res.status(403).json({ message: `Time não se qualifica nas regras de gênero da partida` });
      };
      if (!await isTimePossuiCategoriaValido(teamId,matchId)) {
        return res.status(403).json({ message: `Time não se qualifica nas regras de categoria da partida` });
      }
      else{
        await MatchTeams.create({
          matchId: matchId,
          teamId: teamId
        });
        res.status(201).json({ message: 'Time inscrito na partida com sucesso' });
      }
    }
    else{
      if (await isTimePossuiCategoriaValido(teamId,matchId)=== false) {
        return res.status(403).json({ message: `Time não se qualifica nas regras de categoria da partida` });
      }
      else{
        await MatchTeams.create({
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
} 
// Placeholder: categoria não está definida em RulesModel; sempre retorna true.
const isTimePossuiCategoriaValido=async(teamId:number,matchId:number)=>{
  return true;
}
export const verifyTeamsGenderRules = async (req: any, res: any,teamId:number,regraSexo:string) : Promise<boolean> => {
  let isValid=true
  const jogadoresDentroPartida = await TeamPlayer.findAll({
    where: { teamId: teamId },
    attributes: ['playerId'],
  })
  const PlayerIds = jogadoresDentroPartida.map((team: any) => team.playerId);
  const playersWithDifferentGender = await Playermodel.findAll({
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
    return isValid=false;
  }  
  return isValid;
} 
export const getMatchTeams = async (req: any, res: any) => {
  try {
    const matchId = parseInt(req.params.id, 10);
    const match = await Match.findByPk(matchId, {
      attributes: [ 'title', 'date', 'location', 'status', 'description', 'price', 'organizerId']
    })
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }
    const teams=await MatchTeams.findAll({
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
export const getTeamsAvailable = async (req: any, res: any) => {
  try {
    const Teams = await MatchTeams.findAll({
      attributes:['teamId'],
      where: {
        matchId: req.params.id
      },
      raw: true,
    });
    const teamIds = Teams.map((team: any) => team.teamId);
    const Avaiableteams = await Team.findAll({
      where: {
        id: {
          [Sequelize.Op.notIn]: teamIds
        },
        isDeleted: false
      }
    });
    res.status(200).json(Avaiableteams);   
  }
  catch (error) {
    console.error('Erro ao obter times disponíveis:', error);
    res.status(500).json({ message: 'Erro ao obter times disponíveis' });
  }
}  
export const deleteTeamMatch= async (req: any, res: any) => {
  try {
    const { id,teamId } = req.params;
    const match = await Match.findByPk(id);
    if (!match) {
      return res.status(404).json({ message: 'Partida não encontrada' });
    }
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Time não encontrado' });
    }
    // Somente o capitão do próprio time pode removê-lo; organizador/admin também podem
    try {
      const authHeader = req.headers.authorization as string | undefined;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined;
      if (!token) { return res.status(401).json({ message: 'Não autenticado' }); }
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const requesterId = decoded.id;
  const isOrganizer = Number((match as any).organizerId) === requesterId;
      let requesterIsAdmin = false;
      const requester = await User.findByPk(requesterId).catch(() => null) as any;
      if (requester && Number(requester.userTypeId) === 1) requesterIsAdmin = true;
  const isTeamCaptain = Number((team as any).captainId) === requesterId;
      if (!isTeamCaptain && !isOrganizer && !requesterIsAdmin) {
        return res.status(403).json({ message: 'Sem permissão para remover este time da partida' });
      }
    } catch (e) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    await MatchTeams.destroy({
      where: {
        matchId:id,
        teamId,
      }
    });
    res.status(200).json({ message: 'Time removido da partida com sucesso' });
  }
  catch (error) {
    console.error('Erro ao remover time da partida:', error);
    res.status(500).json({ message: 'Erro ao remover time da partida' });
  }
}
export const checkTeamsRuleCompliance  = async (req:any,res:any) => {
  const { id } = req.params;
  const matchId = parseInt(id, 10);
  const regras = await RulesModel.findOne({ where: { partidaId: id } });
  const matchTeams = await MatchTeams.findAll({
    where: { matchId: matchId },
    attributes: ['teamId']
  }); 
  if (!regras) return;
  for (const matchTeam of matchTeams) {
    const teamId = matchTeam.teamId;
    const team= await Team.findByPk(teamId, {
      attributes: ['name']})
    const nome= team.dataValues.name;  
    if (regras.dataValues.sexo !== "Ambos") {
      if (await isTimePossuiCategoriaValido(teamId, id) === false || await verifyTeamsGenderRules(req, res, teamId, regras.dataValues.sexo) === false) {
        await MatchTeams.destroy({
          where: {
            matchId: matchId,
            teamId: teamId
          }
        });
        res.status(403).json({message: `Time ${nome} não se qualifica nas regras de categoria da partida`});
      }
    }
  }
};

