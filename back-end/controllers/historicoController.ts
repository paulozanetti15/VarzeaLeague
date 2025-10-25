import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import MatchReport from "../models/MatchReportModel";
import { Op } from "sequelize";
import MatchModel from "../models/MatchModel";
import Team from "../models/TeamModel"
import MatchChampionshpReport from "../models/MatchReportChampionshipModel";
import MatchChampionship from "../models/MatchChampionshipModel";
import Championship from "../models/ChampionshipModel";
import MatchGoal from "../models/MatchGoalModel";
import MatchCard from "../models/MatchCardModel";
import Player from "../models/PlayerModel";
 
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
        console.log(req.body)
        await MatchReport.create({
            match_id  : req.body.match_id ,
            team_home : req.body.team_home , 
            team_away : req.body.team_away,
            teamHome_score : req.body.team_home_score,
            teamAway_score : req.body.team_away_score,
            created_by : userId
        })
        res.status(201).json({message : "Súmula adicionada com sucesso"})     
    } catch (error) {
      res.status(500).json({ message:"Erro para adicionar os dados"})
      console.error(error)
    }    
}

export const buscarSumulaPartidaAmistosa = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchReport.findOne({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Team,
                    as: 'teamHome',
                    attributes: ['id', 'name']
                },
                {
                    model: Team,
                    as: 'teamAway',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        // No further server-side authorization; frontend enforces visibility/export rules

        const goals = await MatchGoal.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Team,
                            as: 'teams',
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        const cards = await MatchCard.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Team,
                            as: 'teams',
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });
        const formattedGoals = goals.map((goal: any) => ({
            playerId: goal.dataValues.player_id,
            playerName: goal.dataValues.player?.dataValues.nome || '',
            teamName: goal.dataValues.player?.dataValues.teams?.[0]?.dataValues.name || 'Time não identificado',
            minute: goal.dataValues.minute || 0,
            teamId: goal.dataValues.player?.dataValues.teams?.[0]?.dataValues.id || 0
        }));
        
        const formattedCards = cards.map((card: any) => ({
            playerId: card.dataValues.player_id,
            playerName: card.dataValues.player?.dataValues.nome || '',
            teamName: card.dataValues.player?.dataValues.teams?.[0]?.dataValues.name || 'Time não identificado',
            type: card.dataValues.card_type === 'yellow' ? 'Amarelo' : 'Vermelho',
            minute: card.dataValues.minute || 0,
            teamId: card.dataValues.player?.dataValues.teams?.[0]?.dataValues.id || 0
        }));
        console.log(formattedCards)

        const formattedSumula = {
            matchId: sumula.dataValues.match_id,
            team_home: sumula.dataValues.team_home,
            team_away: sumula.dataValues.team_away,
            homeTeamName: sumula.dataValues.teamHome?.name || '',
            awayTeamName: sumula.dataValues.teamAway?.name || '',
            team_home_score: sumula.dataValues.teamHome_score,
            team_away_score: sumula.dataValues.teamAway_score,
            homeScore: sumula.dataValues.teamHome_score,
            awayScore: sumula.dataValues.teamAway_score,
            goals: formattedGoals,
            cards: formattedCards
        };

        res.status(200).json(formattedSumula);
    } catch (error) {
        console.error('Erro ao buscar súmula:', error);
        res.status(500).json({ message: 'Erro ao buscar súmula' });
    }
};

export const buscarSumulaPartidaCampeonato = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchChampionshpReport.findOne({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Team,
                    as: 'teamHome',
                    attributes: ['id', 'name']
                },
                {
                    model: Team,
                    as: 'teamAway',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        // No frontend-only validation here

        const goals = await MatchGoal.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Team,
                            as: 'teams',
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        const cards = await MatchCard.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Team,
                            as: 'teams',
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        const formattedGoals = goals.map((goal: any) => ({
            playerId: goal.player_id,
            playerName: goal.player?.nome || '',
            teamName: goal.player?.teams?.[0]?.name || 'Time não identificado',
            minute: goal.minute || 0,
            teamId: goal.player?.teams?.[0]?.id || 0
        }));

        const formattedCards = cards.map((card: any) => ({
            playerId: card.player_id,
            playerName: card.player?.nome || '',
            teamName: card.player?.teams?.[0]?.name || 'Time não identificado',
            type: card.card_type === 'yellow' ? 'Amarelo' : 'Vermelho',
            minute: card.minute || 0,
            teamId: card.player?.teams?.[0]?.id || 0
        }));

        const formattedSumula = {
            matchId: sumula.dataValues.match_id,
            team_home: sumula.dataValues.team_home,
            team_away: sumula.dataValues.team_away,
            homeTeamName: sumula.dataValues.teamHome?.name || '',
            awayTeamName: sumula.dataValues.teamAway?.name || '',
            team_home_score: sumula.dataValues.teamHome_score,
            team_away_score: sumula.dataValues.teamAway_score,
            homeScore: sumula.dataValues.teamHome_score,
            awayScore: sumula.dataValues.teamAway_score,
            goals: formattedGoals,
            cards: formattedCards
        };

        res.status(200).json(formattedSumula);
    } catch (error) {
        console.error('Erro ao buscar súmula:', error);
        res.status(500).json({ message: 'Erro ao buscar súmula' });
    }
};

export const deletarSumulaPartidaAmistosa = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        // Permission checks moved to frontend per project decision; backend requires only authentication

        await MatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await MatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await sumula.destroy();

        res.status(200).json({ message: 'Súmula deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar súmula:', error);
        res.status(500).json({ message: 'Erro ao deletar súmula' });
    }
};

export const deletarSumulaPartidaCampeonato = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchChampionshpReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        await MatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await MatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await sumula.destroy();

        res.status(200).json({ message: 'Súmula deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar súmula:', error);
        res.status(500).json({ message: 'Erro ao deletar súmula' });
    }
};

export const atualizarSumulaPartidaAmistosa = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        // Permission checks moved to frontend per project decision; backend requires only authentication

        await sumula.update({
            team_home: req.body.team_home,
            team_away: req.body.team_away,
            teamHome_score: req.body.team_home_score,
            teamAway_score: req.body.team_away_score,
        });

        await MatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await MatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        res.status(200).json({ message: 'Súmula atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar súmula:', error);
        res.status(500).json({ message: 'Erro ao atualizar súmula' });
    }
};

export const atualizarSumulaPartidaCampeonato = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchChampionshpReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        await sumula.update({
            team_home: req.body.team_home,
            team_away: req.body.team_away,
            team_home_score: req.body.team_home_score,
            team_away_score: req.body.team_away_score,
        });

        await MatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await MatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        res.status(200).json({ message: 'Súmula atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar súmula:', error);
        res.status(500).json({ message: 'Erro ao atualizar súmula' });
    }
};
   