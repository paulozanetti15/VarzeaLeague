import TeamPlayer from "../models/TeamPlayerModel";
import { Request, Response } from "express";    
export const createTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const playersData = req.body;
        const ids = playersData.map((jogador: any) => jogador.id);
        const playername = playersData.map((jogador: any) => jogador.playername)
        const AlreadyExists = await TeamPlayer.findOne({ where: { teamId:ids, playername } });     
        if(!AlreadyExists){
            playersData.map(async (jogador: any) => {
                await TeamPlayer.create({
                    teamId : jogador.teamId,
                    Playername: jogador.Playername,
                    Playerdatebirth: jogador.Playerdatebirth,
                    PlayerGender: jogador.PlayerGender,
                    Playerposition: jogador.Playerposition,
                });
            });
        }  
        res.status(201).json({ message: 'Jogador criado com sucesso' });  
    } catch (error) {
        console.error('Erro ao criar jogador no time:', error);
        res.status(500).json({ message: 'Erro ao criar jogador no time', error });
    }
}
export const getTeamsPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log(id)
        const players = await TeamPlayer.findAll({ where: { teamId:id } });
        res.status(200).json(players);
    } catch (error) {
        console.error('Erro ao obter jogadores do time:', error);
        res.status(500).json({ message: 'Erro ao obter jogadores do time', error });
    }
}
export const updateTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const playersData = req.body;
         
        console.log(playersData)
        for (const jogador of playersData) {
            const { teamId } = req.params;
            const player = await TeamPlayer.findOne({ where: { teamId:teamId, playername:jogador.Playername,playerdatebirth:jogador.Playerdatebirth,PlayerGender:jogador.PlayerGender,playerposition:jogador.Playerposition } });
            if (!player) {
                await TeamPlayer.update(
                    {
                        Playerposition: jogador.Playerposition, 
                    },
                    { where: { teamId:jogador.teamId, playername:jogador.Playername } }
                );
            } else {
                res.status(400).json({ message: 'Jogador existente' });
                return;
            }
        }
       
    } catch (error) {
        console.error('Erro ao atualizar jogador do time:', error);
        res.status(500).json({ message: 'Erro ao atualizar jogador do time', error });
    }
}
export const deleteTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params;
        const isExists = await TeamPlayer.findOne({ where: { teamId } });
        if (isExists) {
            await TeamPlayer.destroy({ where: { teamId } });
            res.status(200).json({ message: 'Jogador excluído com sucesso' }); 
        } else {
            res.status(404).json({ message: 'Jogador não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir jogador do time:', error);
        res.status(500).json({ message: 'Erro ao excluir jogador do time', error });
    }
}
