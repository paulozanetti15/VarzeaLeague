import TeamPlayer from "../models/TeamPlayerModel";
import Player from "../models/PlayerModel";
import { Request, Response } from "express";    
import { Op } from "sequelize";

export const createTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const playersData = req.body;
        const teamId = req.params.id || playersData[0].teamId;
        
        // Criar cada associação de jogador com time
        const createdPlayers = await Promise.all(
            playersData.map(async (jogador: any) => {
                // Verificar se o jogador já está associado ao time
                const existingPlayer = await TeamPlayer.findOne({
                    where: {
                        teamId: teamId,
                        playerId: jogador.playerId
                    }
                });

                if (!existingPlayer) {
                    return await TeamPlayer.create({
                        teamId: teamId,
                        playerId: jogador.playerId
                    });
                }
                return null;
            })
        );
        
        const addedPlayers = createdPlayers.filter(player => player !== null);
        
        if (addedPlayers.length > 0) {
            res.status(201).json({ 
                message: 'Jogadores adicionados com sucesso',
                added: addedPlayers.length 
            });
        } else {
            res.status(200).json({ 
                message: 'Nenhum jogador novo adicionado' 
            });
        }
    } catch (error) {
        console.error('Erro ao criar associação jogador-time:', error);
        res.status(500).json({ message: 'Erro ao criar associação jogador-time', error });
    }
}

export const getTeamsPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('Buscando jogadores para o time ID:', id);
        
        // Buscar jogadores associados ao time com suas informações completas
        const teamPlayers = await TeamPlayer.findAll({ 
            where: { teamId: id },
            include: [{ 
                model: Player,
                as: 'player',
                where: { isDeleted: false }
            }]
        });
        
        // Extrair apenas os dados dos jogadores da resposta
        const players = teamPlayers.map(tp => tp.get('player'));
        
        res.status(200).json(players);
    } catch (error) {
        console.error('Erro ao obter jogadores do time:', error);
        res.status(500).json({ message: 'Erro ao obter jogadores do time', error });
    }
}

export const deleteTeamPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId, playerId } = req.params;
        
        if (playerId) {
            // Se playerId for fornecido, exclua apenas essa associação específica
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
            // Se apenas teamId for fornecido, exclua todas as associações desse time
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
        console.error('Erro ao excluir associação jogador-time:', error);
        res.status(500).json({ message: 'Erro ao excluir associação jogador-time', error });
    }
}
