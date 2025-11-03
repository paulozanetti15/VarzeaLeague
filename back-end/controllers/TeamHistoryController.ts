import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import FriendlyMatchReport from "../models/FriendlyMatchReportModel";
import { Op } from "sequelize";
import FriendlyMatchesModel from "../models/FriendlyMatchesModel";
import Team from "../models/TeamModel"
import MatchChampionshipReport from "../models/MatchReportChampionshipModel";
import MatchChampionship from "../models/MatchChampionshipModel";
import Championship from "../models/ChampionshipModel";
import FriendlyMatchGoal from "../models/FriendlyMatchGoalModel";
import FriendlyMatchCard from "../models/FriendlyMatchCardModel";
import Player from "../models/PlayerModel";
 
export const getAllFriendlyMatchesHistory= async(req:AuthRequest,res:Response)=>{
    try {
        const { teamId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const buscarPartidasAmistosas=await  FriendlyMatchReport.findAll({
            where: {
              [Op.or] : 
              [
                { team_home: parseInt(teamId)},
                { team_away: parseInt(teamId) }    
              ]    
            },
            include: [
                {
                    model: FriendlyMatchesModel,
                    attributes: ['title', 'location','quadra','date'],
                    required: true
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
        res.status(500).json({ message: 'Erro ao buscar partidas amistosas' });
    }    
}
export const getAllChampionshipMatchesHistory= async(req:AuthRequest,res:Response)=>{
    try {
        const { teamId } = req.params;
        const championshipId = req.query.championshipId ? Number(req.query.championshipId) : null;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
         
        const buscarPartidasCampeonato=await  MatchChampionshipReport.findAll({
            where: {
              [Op.or] : 
              [
                { team_home: parseInt(teamId)},
                { team_away: parseInt(teamId) }    
              ]    
            },
            include: [
                {
                    model: MatchChampionship,
                    as:"match",
                    attributes: ['location','quadra','date'],
                    where: championshipId ? { championship_id: championshipId } : undefined,
                    required: true,
                    include: 
                    [
                        {
                            model: Championship,
                            as:"championship",
                            attributes: ['id','name', 'start_date', 'end_date']
                        }
                    ]
                },
                {
                    model: Team,
                    as:'reportTeamHome',
                    attributes: ['name']
                },
                {
                    model: Team,
                    as:'reportTeamAway',
                    attributes: ['name']
                },    
            ]
        });
        res.status(200).json(buscarPartidasCampeonato)     
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar partidas de campeonato' });
    }    
}
export const getMatchesByChampionshipHistory= async(req:AuthRequest,res:Response)=>{
    try {
        const { teamId,championshipId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        const searchMatchesByChampionship=await  MatchChampionshipReport.findAll({
            where: {
                [Op.or]: [
                    { team_home: teamId },
                    { team_away: teamId }
                ]
            },
            include: [
                {
                    model: MatchChampionship,
                    as: "match",
                    attributes: ['location', 'quadra', 'date'],
                    where: championshipId ? { championship_id: parseInt(championshipId) } : undefined,
                    include: [
                        {
                            model: Championship,
                            as: "championship",
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: Team,
                    as: 'reportTeamHome',
                    attributes: ['name']
                },
                {
                    model: Team,
                    as: 'reportTeamAway',
                    attributes: ['name']
                },
            ]
        });
        const formattedMatches = searchMatchesByChampionship.map(matchReport => {
            return {
                matchId: matchReport.dataValues.match.id,
                location: matchReport.dataValues.match.location,
                date: matchReport.dataValues.match.date,
                teamHome: matchReport.dataValues.reportTeamHome.name,
                teamAway: matchReport.dataValues.reportTeamAway.name,
                score: {
                    home: matchReport.dataValues.teamHome_score,
                    away: matchReport.dataValues.teamAway_score
                }
            };
        });
        res.status(200).json(formattedMatches);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar partidas do campeonato' });
    }       

}
export const adicionarSumulaPartidasAmistosas= async(req:AuthRequest,res:Response)=>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        await FriendlyMatchReport.create({
            match_id  : req.body.match_id ,
            team_home : req.body.team_home , 
            team_away : req.body.team_away,
            teamHome_score : req.body.team_home_score,
            teamAway_score : req.body.team_away_score,
            created_by : userId
        });
        
        res.status(201).json({message : "Súmula adicionada com sucesso"});
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar súmula' });
    }    
}

export const buscarSumulaPartidaAmistosa = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        const sumula = await FriendlyMatchReport.findOne({
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

        const goals = await FriendlyMatchGoal.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'name'],
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

        const cards = await FriendlyMatchCard.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'name'],
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
            playerName: goal.dataValues.player?.dataValues.name || '',
            teamName: goal.dataValues.player?.dataValues.teams?.[0]?.dataValues.name || 'Time não identificado',
            minute: goal.dataValues.minute || 0,
            teamId: goal.dataValues.player?.dataValues.teams?.[0]?.dataValues.id || 0
        }));
        
        const formattedCards = cards.map((card: any) => ({
            playerId: card.dataValues.player_id,
            playerName: card.dataValues.player?.dataValues.name || '',
            teamName: card.dataValues.player?.dataValues.teams?.[0]?.dataValues.name || 'Time não identificado',
            type: card.dataValues.card_type === 'yellow' ? 'Amarelo' : 'Vermelho',
            minute: card.dataValues.minute || 0,
            teamId: card.dataValues.player?.dataValues.teams?.[0]?.dataValues.id || 0
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
        res.status(500).json({ message: 'Erro ao buscar súmula' });
    }
};

export const buscarSumulaPartidaCampeonato = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchChampionshipReport.findOne({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Team,
                    as: 'reportTeamHome',
                    attributes: ['id', 'name']
                },
                {
                    model: Team,
                    as: 'reportTeamAway',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        const goals = await FriendlyMatchGoal.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'name'],
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

        const cards = await FriendlyMatchCard.findAll({
            where: { match_id: parseInt(matchId) },
            include: [
                {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'name'],
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
            playerName: goal.player?.name || '',
            teamName: goal.player?.teams?.[0]?.name || 'Time não identificado',
            minute: goal.minute || 0,
            teamId: goal.player?.teams?.[0]?.id || 0
        }));

        const formattedCards = cards.map((card: any) => ({
            playerId: card.player_id,
            playerName: card.player?.name || '',
            teamName: card.player?.teams?.[0]?.name || 'Time não identificado',
            type: card.card_type === 'yellow' ? 'Amarelo' : 'Vermelho',
            minute: card.minute || 0,
            teamId: card.player?.teams?.[0]?.id || 0
        }));

        const formattedSumula = {
            matchId: sumula.dataValues.match_id,
            team_home: sumula.dataValues.team_home,
            team_away: sumula.dataValues.team_away,
            homeTeamName: sumula.dataValues.reportTeamHome?.name || '',
            awayTeamName: sumula.dataValues.reportTeamAway?.name || '',
            team_home_score: sumula.dataValues.teamHome_score,
            team_away_score: sumula.dataValues.teamAway_score,
            homeScore: sumula.dataValues.teamHome_score,
            awayScore: sumula.dataValues.teamAway_score,
            goals: formattedGoals,
            cards: formattedCards
        };

        res.status(200).json(formattedSumula);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar súmula do campeonato' });
    }
};

export const deletarSumulaPartidaAmistosa = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        const sumula = await FriendlyMatchReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        await FriendlyMatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await FriendlyMatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await sumula.destroy();

        res.status(200).json({ message: 'Súmula deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar súmula' });
    }
};

export const deletarSumulaPartidaCampeonato = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchChampionshipReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        await FriendlyMatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await FriendlyMatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await sumula.destroy();

        res.status(200).json({ message: 'Súmula deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar súmula do campeonato' });
    }
};

export const atualizarSumulaPartidaAmistosa = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        const sumula = await FriendlyMatchReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        await sumula.update({
            team_home: req.body.team_home,
            team_away: req.body.team_away,
            teamHome_score: req.body.team_home_score,
            teamAway_score: req.body.team_away_score,
        });

        await FriendlyMatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await FriendlyMatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        res.status(200).json({ message: 'Súmula atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar súmula' });
    }
};

export const atualizarSumulaPartidaCampeonato = async(req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }

        const sumula = await MatchChampionshipReport.findOne({
            where: { match_id: parseInt(matchId) }
        });

        if (!sumula) {
            res.status(404).json({ message: 'Súmula não encontrada' });
            return;
        }

        await sumula.update({
            team_home: req.body.team_home,
            team_away: req.body.team_away,
            teamHome_score: req.body.teamHome_score,
            teamAway_score: req.body.teamAway_score,
        });

        await FriendlyMatchGoal.destroy({
            where: { match_id: parseInt(matchId) }
        });

        await FriendlyMatchCard.destroy({
            where: { match_id: parseInt(matchId) }
        });

        res.status(200).json({ message: 'Súmula atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar súmula do campeonato' });
    }
};
   