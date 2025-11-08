import express from 'express';
import {
  deleteTeamPlayer,
  getTeamsPlayers,
  createTeamPlayer
} from '../controllers/TeamPlayersController';

export const teamPlayerRoutes = express.Router();

teamPlayerRoutes.get('/:teamId', getTeamsPlayers);
teamPlayerRoutes.delete('/:teamId', deleteTeamPlayer);
teamPlayerRoutes.delete('/:teamId/player/:playerId', deleteTeamPlayer);
teamPlayerRoutes.post('/:teamId', createTeamPlayer);

export default teamPlayerRoutes;
