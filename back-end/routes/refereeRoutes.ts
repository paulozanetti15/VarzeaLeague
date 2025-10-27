import { Router } from 'express';
import { RefereeController } from '../controllers/RefereeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, RefereeController.create);
router.get('/', authenticateToken, RefereeController.list);
router.get('/:id', authenticateToken, RefereeController.getById);
router.put('/:id', authenticateToken, RefereeController.update);
router.delete('/:id', authenticateToken, RefereeController.delete);

router.get('/match/:matchId', authenticateToken, RefereeController.getByMatch);
router.post('/match/:matchId/referee/:refereeId', authenticateToken, RefereeController.assignToMatch);
router.delete('/match/:matchId/referee/:refereeId', authenticateToken, RefereeController.removeFromMatch);

export default router;
