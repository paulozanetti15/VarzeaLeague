import { AuthRequest } from "middleware/auth";
import { Request, Response } from 'express';
import PunicaoAmitosoMatch from "../models/PunicaoAmitosoMatchModel";
import TeamModel from "../models/TeamModel"
import MatchTeams from "../models/MatchTeamsModel";
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

        // Verifica se já existe punição para esta partida
        const existing = await PunicaoAmitosoMatch.findOne({ where: { idMatch } });
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

        await PunicaoAmitosoMatch.create({
            idTime,
            motivo, 
            idMatch
        });
        res.status(201).json({ message: "Punição criada com sucesso" });
    } catch (error) {
      res.status(500)
    }    
}
export const busarPunicaoPartidaAmistosa = async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const Punicao=await PunicaoAmitosoMatch.findAll({
            where: {
                idMatch:Number(req.params.idAmistosaPartida)
            },
            include: [
                {
                    model:TeamModel,
                    as: "team",   
                    attributes:["name"]
                },     
            ]
        });
        res.status(200).json(Punicao)
    } catch (error) {
      res.status(500)
    }    
}
export const alterarPunicaoPartidaAmistosa=async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        await PunicaoAmitosoMatch.update(
            {
                motivo:req.body.motivo
            },
            {
              where: {
                idMatch:Number(req.params.idAmistosaPartida)
                }
            }
        );
        res.status(200).json({ message: "Punição alterada com sucesso" });
    } catch (error) {
      res.status(500)
    } 
}
export const deletarPunicaoPartidaAmistosa=async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        await PunicaoAmitosoMatch.destroy(
            {
              where: {idMatch:Number(req.params.idAmistosaPartida)}
            }
        );
        res.status(200).json({ message: "Punição deletada com sucesso" });

        
    } catch (error) {
      res.status(500)
    } 
}