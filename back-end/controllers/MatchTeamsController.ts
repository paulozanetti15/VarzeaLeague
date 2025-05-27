import MatchTeams from "../models/MatchTeamsModel";
import Match from "../models/MatchModel";
import User from "../models/UserModel";
import Team from "../models/TeamModel";
import Sequelize from "sequelize";
import TeamPlayer from "../models/TeamPlayerModel";
import RulesModel from "../models/RulesModel";
import jwt from 'jsonwebtoken';
require('dotenv').config(); 
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const joinMatchByTeam = async (req: any, res: any) => {

  try {
    const { teamId,matchId } = req.body; 
    const match = await Match.findByPk(matchId, {
      attributes: [ 'title', 'date', 'location', 'status', 'description', 'price', 'organizerId']
    })
    const token = req.headers.authorization?.replace('Bearer ', '');
    try {
      const decodedPayload = jwt.decode(token);
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
    const regras = await RulesModel.findOne({where : { partidaid: matchId }});
    const teamIsAlreadyInMatch = await MatchTeams.findOne({ where: { matchId, teamId } });
    if(teamIsAlreadyInMatch){
      return res.status(400).json({ message: 'Time já está inscrito nesta partida' });
    }
    if(regras.dataValues.sexo!=="Ambos"){
      const playersWithDifferentGender = await TeamPlayer.findOne({
        where: {
          teamId: teamId,
          PlayerGender: {
            [Sequelize.Op.ne]: regras.dataValues.sexo  
          }
        },
        attributes: ['id', 'Playername', 'PlayerGender']
      });
      if (playersWithDifferentGender!==null) {
        return res.status(403).json({ message: `Time não se qualifica nas regras de genero da partida` });
      }
      if (!await isTimePossuiCategoriaValido(teamId)) {
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
      if (!await isTimePossuiCategoriaValido(teamId)) {
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
  

const isTimePossuiCategoriaValido=async(teamId:number)=>{
  const idades=[];
  const regras = await RulesModel.findAll({
    attributes: ['categoria']
  });
  const idadesJogadores = await TeamPlayer.findAll({
    attributes: ['Playerdatebirth'],
    where: {
      teamId: teamId
    }
  })
  idades.push(idadesJogadores.map((idade: any) => {
      const ano = new Date(idade.Playerdatebirth).getFullYear();
      const anoAtual = new Date().getFullYear();
      return anoAtual - ano;
  }));
  switch (regras[0].dataValues.categoria) {
    case 'sub-7':
      for (const idade of idades) {
        if (idade > 7 && idade < 6) {
          console.log(idade, 'idade')
          return false; 
        }
      }
    case 'sub-8':
      for (const idade of idades) {
        if (idade > 8 && idade < 8) {
          return false; 
        }
      }
    case 'sub-9':
      for (const idade of idades) {
        if (idade > 9 && idade < 8) {
          return false; 
        }
      }
    case 'sub-11':
      for (const idade of idades) {
        if (idade > 11 && idade < 10) {
          return false; 
        }
      }
    case 'sub-13':
      for (const idade of idades) {
        if (idade > 13 && idade < 12) {
          return false; 
        }
      }
    case 'sub-15':
      for (const idade of idades) {
        if (idade > 15 && idade < 14) {
          return false; 
        }
      }
    case 'sub-17':
      for (const idade of idades) {
        if (idade > 17 && idade < 16) {
          return false; 
        }
      }
    case 'sub-20':
      for (const idade of idades) {
        if (idade > 20 && idade < 18) {
          return false; 
        }
      }
    case 'adulto':
      for (const idade of idades) {
        if (idade <  20) {
          return false; 
        }
      }
    default:
      return true; // Se não houver categoria definida, assume-se que o time é válido
  }

}
export const getMatchTeams = async (req: any, res: any) => {
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

