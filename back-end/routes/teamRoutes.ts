import express from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/uploadService';
const router = express.Router();
// Todas as rotas precisam de autenticação
router.get('/', authenticateToken, TeamController.listTeams);
router.get('/:id', authenticateToken, TeamController.getTeam);
router.post('/', authenticateToken,upload.single('banner'), TeamController.create);
router.put('/:id', authenticateToken, upload.single('banner'), TeamController.updateTeam);
router.delete('/:id', authenticateToken, TeamController.deleteTeam);
router.delete('/:teamId/players/:playerId', authenticateToken, TeamController.removePlayerFromTeam);

export default router;