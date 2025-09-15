import { AuthRequest } from "middleware/auth";
import { Request, Response } from 'express';
import PunicaoAmitosoMatch from "../models/PunicaoAmitosoMatchModel";
import TeamModel from "../models/TeamModel"
export const inserirPunicaoPartidaAmistosa = async(req:AuthRequest,res:Response) =>{
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
     
        await PunicaoAmitosoMatch.create({
            idTime:Number(req.body.idtime),
            motivo:req.body.motivo, 
            idMatch:Number(req.params.idAmistosaPartida)
        })
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