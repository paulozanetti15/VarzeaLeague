import express from 'express';
import { PlayerController } from '../controllers/PlayerController';
import PlayerEligibilityController from '../controllers/PlayerEligibilityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.post('/', PlayerController.create);
router.get('/team/:teamId', PlayerController.getPlayersFromTeam);
router.post('/add-to-team', PlayerController.addToTeam);
router.delete('/team/:teamId/player/:playerId', PlayerController.removeFromTeam);
router.put('/:id', PlayerController.update);
router.delete('/:id', PlayerController.delete);

router.get('/:playerId/eligibility/:matchId', PlayerEligibilityController.checkEligibility);
router.get('/:playerId/suspension-history', PlayerEligibilityController.getSuspensionHistory);
router.get('/:playerId/active-suspension', PlayerEligibilityController.getActiveSuspension);
router.post('/suspension/manual', PlayerEligibilityController.createManualSuspension);
router.get('/suspensions/all', PlayerEligibilityController.getAllSuspensions);

export default router; 