import { AuthRequest } from "middleware/auth";
import { Response } from 'express';
import FriendlyMatchPenalty from "../models/FriendlyMatchPenaltyModel";
import TeamModel from "../models/TeamModel";
import FriendlyMatchTeamsModel from "../models/FriendlyMatchTeamsModel";
import FriendlyMatchesModel from "../models/FriendlyMatchesModel";
import UserModel from "../models/UserModel";
import FriendlyMatchesRulesModel from "../models/FriendlyMatchesRulesModel";
import MatchReport from "../models/FriendlyMatchReportModel";

export const inserirPunicaoPartidaAmistosa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const idMatch = Number(req.params.idAmistosaPartida);
        const idTime = Number(req.body.idtime);
        const reason = req.body.motivo;
        const teamHomeId = Number(req.body.team_home);
        const teamAwayId = Number(req.body.team_away);

        if (!idMatch || !idTime || !reason || !teamHomeId || !teamAwayId) {
            res.status(400).json({ message: 'Dados inválidos: id da partida, time punido, motivo, time da casa e time visitante são obrigatórios' });
            return;
        }

        const match = await FriendlyMatchesModel.findByPk(idMatch, {
            include: [{
                model: FriendlyMatchesRulesModel,
                as: 'rules'
            }]
        });
        
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }

        const rules = (match as any).rules;
        
        if (!rules) {
            res.status(400).json({ message: 'Partida não possui regras configuradas' });
            return;
        }

        const now = new Date();
        const registrationDeadline = rules.get('registrationDeadline');
        
        if (registrationDeadline) {
            const dataLimite = new Date(registrationDeadline as string);
            
            if (now < dataLimite) {
                res.status(400).json({ message: 'Não é possível aplicar punição antes da data limite de inscrição' });
                return;
            }
        }

        const teamsCount = await FriendlyMatchTeamsModel.count({
            where: { matchId: idMatch }
        });

        if (teamsCount < 2) {
            res.status(400).json({ message: 'A partida deve ter pelo menos 2 times inscritos para aplicar punição WO' });
            return;
        }

        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode aplicar punição' });
            return;
        }

        const existing = await FriendlyMatchPenalty.findOne({ where: { idMatch } });
        
        if (existing) {
            res.status(409).json({ message: 'Já existe uma punição para esta partida' });
            return;
        }

        const teamInMatch = await FriendlyMatchTeamsModel.findOne({
            where: { matchId: idMatch, teamId: idTime }
        });
        
        if (!teamInMatch) {
            res.status(400).json({ message: 'O time selecionado não está vinculado a esta partida' });
            return;
        }

        const homeInMatch = await FriendlyMatchTeamsModel.findOne({
            where: { matchId: idMatch, teamId: teamHomeId }
        });
        
        const awayInMatch = await FriendlyMatchTeamsModel.findOne({
            where: { matchId: idMatch, teamId: teamAwayId }
        });
        
        if (!homeInMatch || !awayInMatch) {
            res.status(400).json({ message: 'Times da casa ou visitante não estão vinculados à partida' });
            return;
        }

        const existingSumula = await MatchReport.findOne({
            where: { match_id: idMatch }
        });
        
        if (existingSumula) {
            res.status(409).json({ message: 'Já existe uma súmula para esta partida. Delete a súmula existente antes de aplicar punição' });
            return;
        }

        await FriendlyMatchPenalty.create({
            idTeam: idTime,
            reason,
            idMatch
        });

        const homeScore = idTime === teamHomeId ? 0 : 3;
        const awayScore = idTime === teamAwayId ? 0 : 3;

        await MatchReport.create({
            match_id: idMatch,
            team_home: teamHomeId,
            team_away: teamAwayId,
            teamHome_score: homeScore,
            teamAway_score: awayScore,
            created_by: userId,
            is_penalty: true
        });

        await match.update({ status: 'finalizada' });

        res.status(201).json({ message: 'Punição criada com sucesso. Súmula 3x0 gerada automaticamente e partida finalizada' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao inserir punição' });
    }    
};

export const buscarPunicaoPartidaAmistosa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const idMatch = Number(req.params.idAmistosaPartida);
        
        const Punicao = await FriendlyMatchPenalty.findAll({
            where: { idMatch },
            attributes: ['id', 'idTeam', 'reason', 'idMatch'],
            include: [{
                model: TeamModel,
                as: "team",   
                attributes: ["id", "name"]
            }]
        });

        if (Punicao.length > 0) {
            const sumula = await MatchReport.findOne({
                where: {
                    match_id: idMatch,
                    is_penalty: true
                },
                attributes: ['team_home', 'team_away']
            });

            const response = Punicao.map((p: any) => ({
                id: p.id,
                idtime: p.idTeam,
                motivo: p.reason,
                idmatch: p.idMatch,
                team: p.team,
                team_home: sumula ? (sumula as any).team_home : null,
                team_away: sumula ? (sumula as any).team_away : null
            }));

            res.status(200).json(response);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar punição' });
    }    
};

export const alterarPunicaoPartidaAmistosa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const idMatch = Number(req.params.idAmistosaPartida);
        const novoMotivo = req.body.motivo as string | undefined;
        const novoIdTime = req.body.idtime ? Number(req.body.idtime) : undefined;
        const teamHomeId = req.body.team_home ? Number(req.body.team_home) : undefined;
        const teamAwayId = req.body.team_away ? Number(req.body.team_away) : undefined;

        const match = await FriendlyMatchesModel.findByPk(idMatch);
        
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        
        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode alterar punição' });
            return;
        }

        const registro = await FriendlyMatchPenalty.findOne({ where: { idMatch } });
        
        if (!registro) {
            res.status(404).json({ message: 'Punição não encontrada para esta partida' });
            return;
        }

        const updateData: any = {};

        if (novoIdTime) {
            const teamInMatch = await FriendlyMatchTeamsModel.findOne({
                where: { matchId: idMatch, teamId: novoIdTime }
            });
            
            if (!teamInMatch) {
                res.status(400).json({ message: 'O time selecionado não está vinculado a esta partida' });
                return;
            }
            
            updateData.idTeam = novoIdTime;
        }
        
        if (typeof novoMotivo === 'string') {
            updateData.reason = novoMotivo;
        }
        
        if (Object.keys(updateData).length > 0) {
            await registro.update(updateData);
        }

        if (teamHomeId && teamAwayId) {
            const homeInMatch = await FriendlyMatchTeamsModel.findOne({
                where: { matchId: idMatch, teamId: teamHomeId }
            });
            
            const awayInMatch = await FriendlyMatchTeamsModel.findOne({
                where: { matchId: idMatch, teamId: teamAwayId }
            });
            
            if (!homeInMatch || !awayInMatch) {
                res.status(400).json({ message: 'Times da casa ou visitante não estão vinculados à partida' });
                return;
            }

            if (teamHomeId === teamAwayId) {
                res.status(400).json({ message: 'Time da casa e visitante devem ser diferentes' });
                return;
            }

            const sumula = await MatchReport.findOne({
                where: { match_id: idMatch, is_penalty: true }
            });
            
            if (sumula) {
                await registro.reload();
                const punishedTeamId = (registro as any).idTeam;
                const homeScore = punishedTeamId === teamHomeId ? 0 : 3;
                const awayScore = punishedTeamId === teamAwayId ? 0 : 3;

                await sumula.update({
                    team_home: teamHomeId,
                    team_away: teamAwayId,
                    teamHome_score: homeScore,
                    teamAway_score: awayScore
                });
            }
        }

        res.status(200).json({ message: 'Punição alterada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alterar punição' });
    } 
};

export const deletarPunicaoPartidaAmistosa = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const idMatch = Number(req.params.idAmistosaPartida);
        
        const match = await FriendlyMatchesModel.findByPk(idMatch);
        
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        
        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode deletar punição' });
            return;
        }

        const sumula = await MatchReport.findOne({ 
            where: { 
                match_id: idMatch,
                is_penalty: true 
            } 
        });

        await FriendlyMatchPenalty.destroy({ where: { idMatch } });

        if (sumula) {
            await sumula.destroy();
        }

        await match.update({ status: 'confirmada' });

        res.status(200).json({ message: 'Punição e súmula deletadas com sucesso. Partida voltou ao status confirmada' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar punição' });
    } 
};