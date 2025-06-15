import express from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.post('/', PlayerController.create);
router.get('/team/:teamId', PlayerController.getPlayersFromTeam);
router.post('/add-to-team', PlayerController.addToTeam);
router.delete('/team/:teamId/player/:playerId', PlayerController.removeFromTeam);
router.put('/:id', PlayerController.update);
router.delete('/:id', PlayerController.delete);

export default router; 