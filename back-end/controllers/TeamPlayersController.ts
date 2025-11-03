import TeamPlayer from "../models/TeamPlayerModel";
import Player from "../models/PlayerModel";
import { Request, Response } from "express";    
import { Op } from "sequelize";

export const createTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const playersData = req.body;
        const teamId = req.params.id || playersData[0].teamId;
        
        const results = await Promise.all(
            playersData.map(async (jogador: any) => {
                const player = await Player.findByPk(jogador.playerId);
                
                const existingPlayer = await TeamPlayer.findOne({
                    where: {
                        teamId: teamId,
                        playerId: jogador.playerId
                    }
                });

                if (!existingPlayer) {
                    const created = await TeamPlayer.create({
                        teamId: teamId,
                        playerId: jogador.playerId
                    });
                    return { success: true, player };
                }
                return { success: false, player, message: `${player?.name || 'Jogador'} já está vinculado ao time` };
            })
        );
        
        const addedPlayers = results.filter(r => r.success);
        const skippedPlayers = results.filter(r => !r.success);
        
        if (addedPlayers.length > 0 && skippedPlayers.length === 0) {
            res.status(201).json({ 
                message: 'Jogadores adicionados com sucesso',
                added: addedPlayers.length 
            });
        } else if (addedPlayers.length > 0 && skippedPlayers.length > 0) {
            res.status(207).json({ 
                message: `${addedPlayers.length} jogador(es) adicionado(s). ${skippedPlayers.length} jogador(es) duplicado(s)`,
                added: addedPlayers.length,
                duplicated: skippedPlayers.map(s => s.message)
            });
        } else {
            res.status(409).json({ 
                message: 'Todos os jogadores já estavam vinculados ao time (duplicados)',
                duplicated: skippedPlayers.map(s => s.message)
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar associação jogador-time', error });
    }
}

export const getTeamsPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const teamPlayers = await TeamPlayer.findAll({ 
            where: { teamId: id },
            include: [{ 
                model: Player,
                as: 'player',
                where: { isDeleted: false }
            }]
        });
        
        const players = teamPlayers.map(tp => tp.get('player'));
        
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter jogadores do time', error });
    }
}

export const deleteTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId, playerId } = req.params;
        
        if (playerId) {
            const deleted = await TeamPlayer.destroy({
                where: {
                    teamId: teamId,
                    playerId: playerId
                }
            });
            
            if (deleted > 0) {
                res.status(200).json({ message: 'Jogador removido do time com sucesso' });
            } else {
                res.status(404).json({ message: 'Associação jogador-time não encontrada' });
            }
        } else {
            const deleted = await TeamPlayer.destroy({
                where: { teamId: teamId }
            });
            
            if (deleted > 0) {
                res.status(200).json({ 
                    message: 'Todos os jogadores removidos do time com sucesso',
                    count: deleted 
                });
            } else {
                res.status(404).json({ message: 'Nenhuma associação encontrada para este time' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir associação jogador-time', error });
    }
}
