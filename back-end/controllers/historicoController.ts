import { AuthRequest } from "middleware/auth";
import { Response } from "express-serve-static-core";
import MatchReport from "../models/MatchReportModel";
import { Op } from "sequelize";
import MatchModel from "../models/MatchModel";
import Team from "../models/TeamModel"
import MatchChampionshpReport from "../models/MatchReportChampionshipModel";
import MatchChampionship from "../models/MatchChampionshipModel";
import Championship from "../models/ChampionshipModel";
 
export const buscarPartidasAmistosas= async(req:AuthRequest,res:Response)=>{
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        
        const buscarPartidasAmistosas=await  MatchReport.findAll({
            where: {
              [Op.or] : 
              [
                { team_home: parseInt(id)},
                { team_away: parseInt(id) }    
              ]    
            },
            include: [
                {
                    model: MatchModel,
                    attributes: ['title', 'location','nomequadra','date']
                },
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
        });

        res.status(200).json(buscarPartidasAmistosas)     
    } catch (error) {
      res.status(500).json({ message:"Erro para buscar os dados"})
      console.error(error)
    }    
}
export const buscarPartidasCampeonato= async(req:AuthRequest,res:Response)=>{
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
         
        const buscarPartidasCampeonato=await  MatchChampionshpReport.findAll({
            where: {
              [Op.or] : 
              [
                { team_home: parseInt(id)},
                { team_away: parseInt(id) }    
              ]    
            },
            include: [
                {
                    model: MatchChampionship,
                    as:"match",
                    attributes: ['location','nomequadra','date'],
                    include: 
                    [
                        {
                            model: Championship,
                            as:"championship",
                            attributes: ['name']
                        }
                    ]
                },
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
        });
        console.log(buscarPartidasCampeonato)
        res.status(200).json(buscarPartidasCampeonato)     
    } catch (error) {
      res.status(500).json({ message:"Erro para buscar os dados"})
      console.error(error)
    }    
}
export const adicionarSumulaPartidasAmistosas= async(req:AuthRequest,res:Response)=>{
    try {
        
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        await MatchReport.create({
            match_id  : req.body.match_id ,
            team_home : req.body.team_home , 
            team_away : req.body.team_away,
            team_home_score : req.body.team_home_score,
            team_away_score : req.body.team_away_score,
            created_by : userId
        })
        res.status(201).json({message : "Súmula adicionada com sucesso"})     
    } catch (error) {
      res.status(500).json({ message:"Erro para adicionar os dados"})
      console.error(error)
    }    
}

   