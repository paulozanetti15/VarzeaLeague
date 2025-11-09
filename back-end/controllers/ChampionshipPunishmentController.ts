import { AuthRequest } from "middleware/auth";
import { Response } from 'express';
import TeamModel from "../models/TeamModel";
import UserModel from "../models/UserModel";
import Championship from "../models/ChampionshipModel";
import TeamChampionship from "../models/TeamChampionshipModel";
import MatchChampionshipTeams from "../models/MatchChampionshipTeamsModel";
import ChampionshipPenalty from "../models/ChampionshipPenaltyModel";
import MatchChampionshpReport from "../models/MatchReportChampionshipModel";
import MatchChampionship from "../models/MatchChampionshipModel";

export const inserirPunicaoCampeonato = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const championshipId = Number(req.params.idCampeonato);
        const matchChampionshipId = Number(req.body.match_championship_id);
        const teamId = Number(req.body.team_id);
        const reason = req.body.reason;
        const teamHomeId = Number(req.body.team_home);
        const teamAwayId = Number(req.body.team_away);
        
        if (!championshipId || !matchChampionshipId || !teamId || !reason || !teamHomeId || !teamAwayId) {
            res.status(400).json({ message: 'Dados inválidos: championshipId, matchChampionshipId, teamId, reason, team_home e team_away são obrigatórios' });
            return;
        }

        const championship = await Championship.findByPk(championshipId);
        
        if (!championship) {
            res.status(404).json({ message: 'Campeonato não encontrado' });
            return;
        }

        const now = new Date();
        const startDate = new Date((championship as any).start_date);
        
        if (now < startDate) {
            res.status(400).json({ message: 'Não é possível aplicar punição antes do início do campeonato' });
            return;
        }

        const teamsCount = await TeamChampionship.count({
            where: { championshipId }
        });

        if (teamsCount < 2) {
            res.status(400).json({ message: 'O campeonato deve ter pelo menos 2 times inscritos para aplicar punição WO' });
            return;
        }

        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode aplicar punição' });
            return;
        }

        const existing = await ChampionshipPenalty.findOne({ 
            where: { 
                championshipId,
                matchChampionshipId 
            } 
        });
        
        if (existing) {
            res.status(409).json({ message: 'Já existe uma punição para esta partida do campeonato' });
            return;
        }

        const teamInChamp = await TeamChampionship.findOne({
            where: { championshipId, teamId }
        });
        
        if (!teamInChamp) {
            res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato' });
            return;
        }

        const homeInChamp = await TeamChampionship.findOne({
            where: { championshipId, teamId: teamHomeId }
        });
        
        const awayInChamp = await TeamChampionship.findOne({
            where: { championshipId, teamId: teamAwayId }
        });
        
        if (!homeInChamp || !awayInChamp) {
            res.status(400).json({ message: 'Times da casa ou visitante não estão inscritos no campeonato' });
            return;
        }

        const existingSumula = await MatchChampionshpReport.findOne({
            where: { match_id: matchChampionshipId }
        });
        
        if (existingSumula) {
            res.status(409).json({ message: 'Já existe uma súmula para esta partida. Delete a súmula existente antes de aplicar punição' });
            return;
        }

        await ChampionshipPenalty.create({ 
            teamId, 
            reason, 
            championshipId,
            matchChampionshipId 
        });

        const homeScore = teamId === teamHomeId ? 0 : 3;
        const awayScore = teamId === teamAwayId ? 0 : 3;

        await MatchChampionshpReport.create({
            match_id: matchChampionshipId,
            team_home: teamHomeId,
            team_away: teamAwayId,
            teamHome_score: homeScore,
            teamAway_score: awayScore,
            created_by: userId,
            is_penalty: true
        });

        res.status(201).json({ message: 'Punição criada com sucesso. Súmula 3x0 gerada automaticamente' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao inserir punição' });
    }
};

export const buscarPunicaoCampeonato = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        const championshipId = Number(req.params.idCampeonato);
        const matchChampionshipId = Number(req.params.match_championship_id);

        const where: any = { championshipId, matchChampionshipId };

        const rows = await ChampionshipPenalty.findAll({
            where,
            attributes: [
                'id',
                'teamId',
                'reason',
                'championshipId',
                'matchChampionshipId'
            ],
            include: [{
                model: TeamModel,
                as: 'championshipPenaltyTeam',
                attributes: ['id', 'name']
            }]
        });

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar punição de campeonato:', error);
        res.status(500).json({ message: 'Erro ao buscar punição', error: error instanceof Error ? error.message : String(error) });
    }
};

export const alterarPunicaoCampeonato = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        const championshipId = Number(req.params.idCampeonato);
        const matchChampionshipId = Number(req.params.match_championship_id);
        const newReason = req.body.reason as string | undefined;
        const newTeamId = req.body.team_id ? Number(req.body.team_id) : undefined;

        const championship = await Championship.findByPk(championshipId);
        if (!championship) {
            res.status(404).json({ message: 'Campeonato não encontrado' });
            return;
        }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode alterar a punição' });
            return;
        }

        const registro = await ChampionshipPenalty.findOne({
            where: { championshipId, matchChampionshipId }
        });
        if (!registro) {
            res.status(404).json({ message: 'Punição não encontrada para este campeonato/partida' });
            return;
        }

        if (newTeamId) {
            const teamExists = await TeamModel.findByPk(newTeamId);
            if (!teamExists || (teamExists as any).isDeleted) {
                res.status(404).json({ message: 'Time não encontrado ou foi excluído' });
                return;
            }

            const teamInChamp = await TeamChampionship.findOne({
                where: { championshipId, teamId: newTeamId }
            });
            if (!teamInChamp) {
                res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato' });
                return;
            }
            (registro as any).teamId = newTeamId;
        }
        if (typeof newReason === 'string') {
            (registro as any).reason = newReason;
        }
        await registro.save();
        res.status(200).json({ message: 'Punição alterada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alterar punição' });
    }
};

export const deletarPunicaoCampeonato = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        const championshipId = Number(req.params.idCampeonato);
        const matchChampionshipId = Number(req.params.match_championship_id);

        const championship = await Championship.findByPk(championshipId);
        if (!championship) {
            res.status(404).json({ message: 'Campeonato não encontrado' });
            return;
        }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode deletar a punição' });
            return;
        }
        const whereClause: any = { championshipId, matchChampionshipId };

        const penalty = await ChampionshipPenalty.findOne({ where: whereClause });
        if (!penalty) {
            res.status(404).json({ message: 'Punição não encontrada' });
            return;
        }

        console.log('Penalty found:', {
            id: penalty.id,
            championshipId: penalty.championshipId,
            matchChampionshipId: penalty.matchChampionshipId,
            teamId: penalty.teamId
        });

        if ((penalty as any).matchChampionshipId) {
            console.log('Looking for sumula with match_id:', (penalty as any).matchChampionshipId);
            const sumula = await MatchChampionshpReport.findOne({ 
                where: { 
                    match_id: (penalty as any).matchChampionshipId,
                    is_penalty: true 
                } 
            });
            console.log('Sumula found:', sumula ? { id: (sumula as any).id, match_id: (sumula as any).match_id, is_penalty: (sumula as any).is_penalty } : 'null');
            if (sumula) {
                console.log('Destroying sumula with id:', (sumula as any).id);
                try {
                    const destroyResult = await sumula.destroy();
                    console.log('Sumula destroy result:', destroyResult);
                    
                    const checkDeleted = await MatchChampionshpReport.findByPk((sumula as any).id);
                    console.log('Verification after destroy - sumula still exists?:', checkDeleted ? 'YES (PROBLEM!)' : 'NO (correctly deleted)');
                } catch (destroyError) {
                    console.error('Error destroying sumula:', destroyError);
                    throw destroyError;
                }
            } else {
                console.log('No sumula found to destroy');
            }
        } else {
            console.log('Penalty has no matchChampionshipId, skipping sumula deletion');
        }

        console.log('Destroying penalty');
        const penaltyDestroyResult = await ChampionshipPenalty.destroy({ where: whereClause });
        console.log('Penalty destroy result (rows affected):', penaltyDestroyResult);
        
        if ((penalty as any).matchChampionshipId) {
            const match = await MatchChampionship.findByPk((penalty as any).matchChampionshipId);
            if (match && (match as any).status === 'finalizada') {
                await match.update({ status: 'confirmada' });
                console.log('Match status updated to confirmada');
            }
        }
        
        res.status(200).json({ message: 'Punição e súmula deletadas com sucesso. Partida voltou ao status confirmada' });
    } catch (error) {
        console.error('Error in deletarPunicaoCampeonato:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({ 
            message: 'Erro ao deletar punição',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
