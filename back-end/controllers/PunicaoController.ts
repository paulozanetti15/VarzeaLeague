import { AuthRequest } from "middleware/auth";
import { Request, Response } from 'express';
import FriendlyMatchPenalty from "../models/FriendlyMatchPenaltyModel";
import TeamModel from "../models/TeamModel";
import MatchTeams from "../models/MatchTeamsModel";
import MatchModel from "../models/MatchModel";
import UserModel from "../models/UserModel";
import Championship from "../models/ChampionshipModel";
import TeamChampionship from "../models/TeamChampionshipModel";
import ChampionshipPenalty from "../models/ChampionshipPenaltyModel";
import MatchReport from "../models/MatchReportModel";
import MatchChampionshpReport from "../models/MatchReportChampionshipModel";
import Rules from "../models/RulesModel";
import { Op } from 'sequelize';
export const inserirPunicaoPartidaAmistosa = async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const idMatch = Number(req.params.idAmistosaPartida);
        const idTime = Number(req.body.idtime);
        const motivo = req.body.motivo;
        const teamHomeId = Number(req.body.team_home);
        const teamAwayId = Number(req.body.team_away);

        if (!idMatch || !idTime || !motivo || !teamHomeId || !teamAwayId) {
            res.status(400).json({ message: 'Dados inválidos: id da partida, time punido, motivo, time da casa e time visitante são obrigatórios.' });
            return;
        }

        const match = await MatchModel.findByPk(idMatch, {
            include: [{
                model: Rules,
                as: 'rules'
            }]
        });
        
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada.' });
            return;
        }

        const rules = (match as any).rules;
        if (!rules) {
            res.status(400).json({ message: 'Partida não possui regras configuradas.' });
            return;
        }

        const now = new Date();
        const dataLimite = new Date(rules.dataLimite);
        
        if (now < dataLimite) {
            res.status(400).json({ message: 'Não é possível aplicar punição antes da data limite de inscrição.' });
            return;
        }

        const teamsCount = await MatchTeams.count({
            where: { matchId: idMatch }
        });

        if (teamsCount < 2) {
            res.status(400).json({ message: 'A partida deve ter pelo menos 2 times inscritos para aplicar punição WO.' });
            return;
        }

        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode aplicar punição.' });
            return;
        }

    const existing = await FriendlyMatchPenalty.findOne({ where: { idMatch } });
        if (existing) {
            res.status(409).json({ message: 'Já existe uma punição para esta partida.' });
            return;
        }

        const teamInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: idTime } });
        if (!teamInMatch) {
            res.status(400).json({ message: 'O time selecionado não está vinculado a esta partida.' });
            return;
        }

        const homeInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: teamHomeId } });
        const awayInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: teamAwayId } });
        
        if (!homeInMatch || !awayInMatch) {
            res.status(400).json({ message: 'Times da casa ou visitante não estão vinculados à partida.' });
            return;
        }

        const existingSumula = await MatchReport.findOne({ where: { match_id: idMatch } });
        if (existingSumula) {
            res.status(409).json({ message: 'Já existe uma súmula para esta partida. Delete a súmula existente antes de aplicar punição.' });
            return;
        }

        await FriendlyMatchPenalty.create({
            idTime,
            motivo, 
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

        res.status(201).json({ message: "Punição criada com sucesso. Súmula 3x0 gerada automaticamente e partida finalizada." });
    } catch (error) {
      console.error('Erro ao inserir punição:', error);
      res.status(500).json({ message: 'Erro ao inserir punição' });
    }    
}
export const busarPunicaoPartidaAmistosa = async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const idMatch = Number(req.params.idAmistosaPartida);
        
        console.log('=== BUSCANDO PUNIÇÃO ===');
        console.log('ID da Partida:', idMatch);
        
        const Punicao = await FriendlyMatchPenalty.findAll({
            where: {
                idMatch
            },
            attributes: [
                ['id_time','idtime'],
                'motivo',
                ['id_match','idmatch'],
                'id'
            ],
            include: [
                {
                    model: TeamModel,
                    as: "team",   
                    attributes: ["id","name"]
                },     
            ]
        });

        console.log('Punições encontradas:', Punicao.length);
        console.log('Dados:', JSON.stringify(Punicao, null, 2));

        if (Punicao.length > 0) {
            const sumula = await MatchReport.findOne({
                where: {
                    match_id: idMatch,
                    is_penalty: true
                },
                attributes: ['team_home', 'team_away']
            });

            console.log('Súmula encontrada:', sumula ? 'Sim' : 'Não');

            const response = Punicao.map((p: any) => ({
                ...p.toJSON(),
                team_home: sumula ? (sumula as any).team_home : null,
                team_away: sumula ? (sumula as any).team_away : null
            }));

            res.status(200).json(response);
        } else {
            res.status(200).json(Punicao);
        }
    } catch (error) {
      console.error('Erro ao buscar punição:', error);
      res.status(500).json({ message: 'Erro ao buscar punição' });
    }    
}
export const alterarPunicaoPartidaAmistosa=async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const idMatch = Number(req.params.idAmistosaPartida);
        const novoMotivo = req.body.motivo as string | undefined;
        const novoIdTime = req.body.idtime ? Number(req.body.idtime) : undefined;
        const teamHomeId = req.body.team_home ? Number(req.body.team_home) : undefined;
        const teamAwayId = req.body.team_away ? Number(req.body.team_away) : undefined;

        const match = await MatchModel.findByPk(idMatch);
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode alterar punição.' });
            return;
        }

    const registro = await FriendlyMatchPenalty.findOne({ where: { idMatch } });
        if (!registro) {
            res.status(404).json({ message: 'Punição não encontrada para esta partida' });
            return;
        }

        if (novoIdTime) {
            const teamInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: novoIdTime } });
            if (!teamInMatch) {
                res.status(400).json({ message: 'O time selecionado não está vinculado a esta partida.' });
                return;
            }
            (registro as any).idTime = novoIdTime;
        }
        
        if (typeof novoMotivo === 'string') {
            (registro as any).motivo = novoMotivo;
        }
        
        await registro.save();

        if (teamHomeId && teamAwayId) {
            const homeInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: teamHomeId } });
            const awayInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: teamAwayId } });
            
            if (!homeInMatch || !awayInMatch) {
                res.status(400).json({ message: 'Times da casa ou visitante não estão vinculados à partida.' });
                return;
            }

            if (teamHomeId === teamAwayId) {
                res.status(400).json({ message: 'Time da casa e visitante devem ser diferentes.' });
                return;
            }

            const sumula = await MatchReport.findOne({ where: { match_id: idMatch, is_penalty: true } });
            if (sumula) {
                const punishedTeamId = (registro as any).idTime;
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

        res.status(200).json({ message: "Punição alterada com sucesso" });
    } catch (error) {
      console.error('Erro ao alterar punição:', error);
      res.status(500).json({ message: 'Erro ao alterar punição' });
    } 
}
export const deletarPunicaoPartidaAmistosa=async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const idMatch = Number(req.params.idAmistosaPartida);
        const match = await MatchModel.findByPk(idMatch);
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode deletar punição.' });
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

        res.status(200).json({ message: "Punição e súmula deletadas com sucesso. Partida voltou ao status confirmada." });
    } catch (error) {
      console.error('Erro ao deletar punição:', error);
      res.status(500).json({ message: 'Erro ao deletar punição' });
    } 
}

// ===================== CAMPEONATO =====================
export const inserirPunicaoCampeonato = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Usuário não autenticado' }); return; }
        
        const idChampionship = Number(req.params.idCampeonato);
        const idMatchChampionship = Number(req.body.id_match_championship);
        const idTime = Number(req.body.idtime);
        const motivo = req.body.motivo;
        const teamHomeId = Number(req.body.team_home);
        const teamAwayId = Number(req.body.team_away);
        
        if (!idChampionship || !idMatchChampionship || !idTime || !motivo || !teamHomeId || !teamAwayId) {
            res.status(400).json({ message: 'Dados inválidos: id do campeonato, id da partida, time punido, motivo, time da casa e visitante são obrigatórios.' });
            return;
        }

        const championship = await Championship.findByPk(idChampionship);
        if (!championship) { res.status(404).json({ message: 'Campeonato não encontrado.' }); return; }

        const now = new Date();
        const startDate = new Date((championship as any).start_date);
        
        if (now < startDate) {
            res.status(400).json({ message: 'Não é possível aplicar punição antes do início do campeonato.' });
            return;
        }

        const teamsCount = await TeamChampionship.count({
            where: { championshipId: idChampionship }
        });

        if (teamsCount < 2) {
            res.status(400).json({ message: 'O campeonato deve ter pelo menos 2 times inscritos para aplicar punição WO.' });
            return;
        }

        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) { res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode aplicar punição.' }); return; }

        const existing = await ChampionshipPenalty.findOne({ 
            where: { 
                idChampionship,
                idMatchChampionship 
            } 
        });
        if (existing) { res.status(409).json({ message: 'Já existe uma punição para esta partida do campeonato.' }); return; }

        const teamInChamp = await TeamChampionship.findOne({ where: { championshipId: idChampionship, teamId: idTime } });
        if (!teamInChamp) { res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato.' }); return; }

        const homeInChamp = await TeamChampionship.findOne({ where: { championshipId: idChampionship, teamId: teamHomeId } });
        const awayInChamp = await TeamChampionship.findOne({ where: { championshipId: idChampionship, teamId: teamAwayId } });
        
        if (!homeInChamp || !awayInChamp) {
            res.status(400).json({ message: 'Times da casa ou visitante não estão inscritos no campeonato.' });
            return;
        }

        const existingSumula = await MatchChampionshpReport.findOne({ where: { match_id: idMatchChampionship } });
        if (existingSumula) {
            res.status(409).json({ message: 'Já existe uma súmula para esta partida. Delete a súmula existente antes de aplicar punição.' });
            return;
        }

        await ChampionshipPenalty.create({ 
            idTime, 
            motivo, 
            idChampionship,
            idMatchChampionship 
        });

        const homeScore = idTime === teamHomeId ? 0 : 3;
        const awayScore = idTime === teamAwayId ? 0 : 3;

        await MatchChampionshpReport.create({
            match_id: idMatchChampionship,
            team_home: teamHomeId,
            team_away: teamAwayId,
            teamHome_score: homeScore,
            teamAway_score: awayScore,
            created_by: userId,
            is_penalty: true
        });

        res.status(201).json({ message: 'Punição criada com sucesso. Súmula 3x0 gerada automaticamente.' });
    } catch (error) {
        console.error('Erro ao inserir punição (campeonato):', error);
        res.status(500).json({ message: 'Erro ao inserir punição' });
    }
};

export const busarPunicaoCampeonato = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Usuário não autenticado' }); return; }
        const idChampionship = Number(req.params.idCampeonato);
        const rows = await ChampionshipPenalty.findAll({
            where: { idChampionship },
            attributes: [ ['idTime','idtime'], 'motivo', ['idChampionship','idchampionship'], 'id' ],
            include: [{ model: TeamModel, as: 'team', attributes: ['id','name'] }]
        });
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar punição (campeonato):', error);
        res.status(500).json({ message: 'Erro ao buscar punição' });
    }
};

export const alterarPunicaoCampeonato = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Usuário não autenticado' }); return; }
        const idChampionship = Number(req.params.idCampeonato);
        const novoMotivo = req.body.motivo as string | undefined;
        const novoIdTime = req.body.idtime ? Number(req.body.idtime) : undefined;

        const championship = await Championship.findByPk(idChampionship);
        if (!championship) { res.status(404).json({ message: 'Campeonato não encontrado' }); return; }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) { res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode alterar a punição.' }); return; }

        const registro = await ChampionshipPenalty.findOne({ where: { idChampionship } });
        if (!registro) { res.status(404).json({ message: 'Punição não encontrada para este campeonato' }); return; }

        if (novoIdTime) {
            const teamInChamp = await TeamChampionship.findOne({ where: { championshipId: idChampionship, teamId: novoIdTime } });
            if (!teamInChamp) { res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato.' }); return; }
            (registro as any).idTime = novoIdTime;
        }
        if (typeof novoMotivo === 'string') { (registro as any).motivo = novoMotivo; }
        await registro.save();
        res.status(200).json({ message: 'Punição alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao alterar punição (campeonato):', error);
        res.status(500).json({ message: 'Erro ao alterar punição' });
    }
};

export const deletarPunicaoCampeonato = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: 'Usuário não autenticado' }); return; }
        const idChampionship = Number(req.params.idCampeonato);
        const idMatchChampionship = Number(req.query.idMatchChampionship);
        
        const championship = await Championship.findByPk(idChampionship);
        if (!championship) { res.status(404).json({ message: 'Campeonato não encontrado' }); return; }
        
        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) { res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode deletar a punição.' }); return; }
        
        const whereClause: any = { idChampionship };
        if (idMatchChampionship) {
            whereClause.idMatchChampionship = idMatchChampionship;
        }

        const penalty = await ChampionshipPenalty.findOne({ where: whereClause });
        if (!penalty) {
            res.status(404).json({ message: 'Punição não encontrada' });
            return;
        }

        if ((penalty as any).idMatchChampionship) {
            const sumula = await MatchChampionshpReport.findOne({ 
                where: { 
                    match_id: (penalty as any).idMatchChampionship,
                    is_penalty: true 
                } 
            });

            if (sumula) {
                await sumula.destroy();
            }
        }

        await ChampionshipPenalty.destroy({ where: whereClause });
        
        res.status(200).json({ message: 'Punição e súmula deletadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar punição (campeonato):', error);
        res.status(500).json({ message: 'Erro ao deletar punição' });
    }
};