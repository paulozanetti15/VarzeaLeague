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

        if (!idMatch || !idTime || !motivo) {
            res.status(400).json({ message: 'Dados inválidos: id da partida, time e motivo são obrigatórios.' });
            return;
        }

        // Verifica se usuário é organizador da partida ou admin
        const match = await MatchModel.findByPk(idMatch);
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada.' });
            return;
        }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = (match as any).organizerId === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) {
            res.status(403).json({ message: 'Permissão negada. Apenas o organizador ou admin pode aplicar punição.' });
            return;
        }

        // Verifica se já existe punição para esta partida
        const existing = await FriendlyMatchPenalty.findOne({ where: { idMatch } });
        if (existing) {
            res.status(409).json({ message: 'Já existe uma punição para esta partida.' });
            return;
        }

        // Verifica se o time está vinculado à partida
        const teamInMatch = await MatchTeams.findOne({ where: { matchId: idMatch, teamId: idTime } });
        if (!teamInMatch) {
            res.status(400).json({ message: 'O time selecionado não está vinculado a esta partida.' });
            return;
        }

        await FriendlyMatchPenalty.create({
            idTime,
            motivo, 
            idMatch
        });
        res.status(201).json({ message: "Punição criada com sucesso" });
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
        const Punicao=await FriendlyMatchPenalty.findAll({
            where: {
                idMatch:Number(req.params.idAmistosaPartida)
            },
            attributes: [
                ['idTime','idtime'],
                'motivo',
                ['idMatch','idmatch'],
                'id'
            ],
            include: [
                {
                    model:TeamModel,
                    as: "team",   
                    attributes:["id","name"]
                },     
            ]
        });
        res.status(200).json(Punicao)
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

        // Se for trocar o time punido, validar vínculo
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

        await FriendlyMatchPenalty.destroy({ where: { idMatch } });
        res.status(200).json({ message: "Punição deletada com sucesso" });

        
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
        const idTime = Number(req.body.idtime);
        const motivo = req.body.motivo;
        if (!idChampionship || !idTime || !motivo) {
            res.status(400).json({ message: 'Dados inválidos: id do campeonato, time e motivo são obrigatórios.' });
            return;
        }

        const championship = await Championship.findByPk(idChampionship);
        if (!championship) { res.status(404).json({ message: 'Campeonato não encontrado.' }); return; }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) { res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode aplicar punição.' }); return; }

        const existing = await ChampionshipPenalty.findOne({ where: { idChampionship } });
        if (existing) { res.status(409).json({ message: 'Já existe uma punição para este campeonato.' }); return; }

        const teamInChamp = await TeamChampionship.findOne({ where: { championshipId: idChampionship, teamId: idTime } });
        if (!teamInChamp) { res.status(400).json({ message: 'O time selecionado não está inscrito neste campeonato.' }); return; }

        await ChampionshipPenalty.create({ idTime, motivo, idChampionship });
        res.status(201).json({ message: 'Punição criada com sucesso' });
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
        const championship = await Championship.findByPk(idChampionship);
        if (!championship) { res.status(404).json({ message: 'Campeonato não encontrado' }); return; }
        const user = await UserModel.findByPk(userId);
        const isOrganizer = Number((championship as any).created_by) === userId;
        const isAdmin = user && (user as any).userTypeId === 1;
        if (!isOrganizer && !isAdmin) { res.status(403).json({ message: 'Permissão negada. Apenas o criador ou admin pode deletar a punição.' }); return; }
        await ChampionshipPenalty.destroy({ where: { idChampionship } });
        res.status(200).json({ message: 'Punição deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar punição (campeonato):', error);
        res.status(500).json({ message: 'Erro ao deletar punição' });
    }
};