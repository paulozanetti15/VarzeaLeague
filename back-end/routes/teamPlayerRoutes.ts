import express from 'express';
import {
  deleteTeamPlayer,
  getTeamsPlayers,
  updateTeamPlayer,
  createTeamPlayer
} from '../controllers/TeamPlayersController';

export const teamPlayerRoutes = express.Router();

// Buscar todos os jogadores de um time
teamPlayerRoutes.get('/:id', getTeamsPlayers);

// Atualizar associações de jogadores para um time
teamPlayerRoutes.put('/:teamId', updateTeamPlayer);

// Remover todos os jogadores de um time
teamPlayerRoutes.delete('/:teamId', deleteTeamPlayer);

// Remover um jogador específico de um time
teamPlayerRoutes.delete('/:teamId/player/:playerId', deleteTeamPlayer);

// Adicionar jogadores a um time
teamPlayerRoutes.post('/:id', createTeamPlayer);

export default teamPlayerRoutes;
