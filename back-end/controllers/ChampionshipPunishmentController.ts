import { AuthRequest } from "middleware/auth";
import { Response } from 'express';
import TeamModel from "../models/TeamModel";
import UserModel from "../models/UserModel";
import Championship from "../models/ChampionshipModel";
import TeamChampionship from "../models/TeamChampionshipModel";
import ChampionshipPenalty from "../models/ChampionshipPenaltyModel";
import MatchChampionshpReport from "../models/MatchReportChampionshipModel";

export const inserirPunicaoCampeonato = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const idChampionship = Number(req.params.idCampeonato);
        const idMatchChampionship = Number(req.body.id_match_championship);
        const idTime = Number(req.body.idtime);
        const motivo = req.body.motivo;
        const teamHomeId = Number(req.body.team_home);
        const teamAwayId = Number(req.body.team_away);
        
        if (!idChampionship || !idMatchChampionship || !idTime || !motivo || !teamHomeId || !teamAwayId) {
            res.status(400).json({ message: 'Dados inválidos: id do campeonato, id da partida, time punido, motivo, time da casa e visitante são obrigatórios' });
            return;
        }

        const championship = await Championship.findByPk(idChampionship);
        
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
            where: { championshipId: idChampionship }
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
                idChampionship,
                idMatchChampionship 
            } 
        });
        
        if (existing) {
            res.status(409).json({ message: 'Já existe uma punição para esta partida do campeonato' });
            return;
        }

        const teamInChamp = await TeamChampionship.findOne({
            where: { championshipId: idChampionship, teamId: idTime }
        });
        
        if (!teamInChamp) {
            res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato' });
            return;
        }

        const homeInChamp = await TeamChampionship.findOne({
            where: { championshipId: idChampionship, teamId: teamHomeId }
        });
        
        const awayInChamp = await TeamChampionship.findOne({
            where: { championshipId: idChampionship, teamId: teamAwayId }
        });
        
        if (!homeInChamp || !awayInChamp) {
            res.status(400).json({ message: 'Times da casa ou visitante não estão inscritos no campeonato' });
            return;
        }

        const existingSumula = await MatchChampionshpReport.findOne({
            where: { match_id: idMatchChampionship }
        });
        
        if (existingSumula) {
            res.status(409).json({ message: 'Já existe uma súmula para esta partida. Delete a súmula existente antes de aplicar punição' });
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
        
        const idChampionship = Number(req.params.idCampeonato);
        
        const rows = await ChampionshipPenalty.findAll({
            where: { idChampionship },
            attributes: [
                ['idTime', 'idtime'],
                'motivo',
                ['idChampionship', 'idchampionship'],
                'id'
            ],
            include: [{
                model: TeamModel,
                as: 'championshipPenaltyTeam',
                attributes: ['id', 'name']
            }]
        });
        
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar punição' });
    }
};

export const alterarPunicaoCampeonato = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        
        const idChampionship = Number(req.params.idCampeonato);
        const novoMotivo = req.body.motivo as string | undefined;
        const novoIdTime = req.body.idtime ? Number(req.body.idtime) : undefined;

        const championship = await Championship.findByPk(idChampionship);
        
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
            where: { idChampionship }
        });
        
        if (!registro) {
            res.status(404).json({ message: 'Punição não encontrada para este campeonato' });
            return;
        }

        if (novoIdTime) {
            const teamInChamp = await TeamChampionship.findOne({
                where: { championshipId: idChampionship, teamId: novoIdTime }
            });
            
            if (!teamInChamp) {
                res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato' });
                return;
            }
            
            (registro as any).idTime = novoIdTime;
        }
        
        if (typeof novoMotivo === 'string') {
            (registro as any).motivo = novoMotivo;
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
        
        const idChampionship = Number(req.params.idCampeonato);
        const idMatchChampionship = Number(req.query.idMatchChampionship);
        
        const championship = await Championship.findByPk(idChampionship);
        
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
        
        res.status(200).json({ message: 'Punição e súmula deletadas com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar punição' });
    }
};
