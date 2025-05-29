import express from 'express';
import {deleteTeamPlayer,getTeamsPlayers,updateTeamPlayer,createTeamPlayer} from '../controllers/TeamPlayersController';
export const teamPlayerRoutes = express.Router();
teamPlayerRoutes.get('/:id', getTeamsPlayers);
teamPlayerRoutes.put('/:id', updateTeamPlayer);
teamPlayerRoutes.delete('/:id', deleteTeamPlayer);
teamPlayerRoutes.post('/:id',createTeamPlayer);
export default teamPlayerRoutes;
