import express from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/uploadService';
const router = express.Router();
// Todas as rotas precisam de autenticação
router.get('/', authenticateToken, TeamController.listTeams);
router.get('/:id', authenticateToken, TeamController.getTeam);
router.post('/', authenticateToken, TeamController.create);
router.put('/:id', authenticateToken, TeamController.updateTeam);
router.post('/:id/banner', authenticateToken, upload.single('banner'), TeamController.uploadBanner);
router.delete('/:id', authenticateToken, TeamController.deleteTeam);

export default router;