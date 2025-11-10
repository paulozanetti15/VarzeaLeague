import express from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/uploadService';
import multer from 'multer';

const router = express.Router();

// Middleware para tratar erros do multer
const handleUploadError = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  upload.single('banner')(req, res, (err: any) => {
    if (err) {
      console.error('Erro no multer:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' });
        }
        return res.status(400).json({ error: `Erro no upload: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'Erro ao processar arquivo' });
    }
    next();
  });
};

// Todas as rotas precisam de autenticação
router.get('/', authenticateToken, TeamController.listTeams);
router.get('/:id', authenticateToken, TeamController.getTeam);
router.post('/', authenticateToken, handleUploadError, TeamController.create);
router.put('/:id', authenticateToken, handleUploadError, TeamController.updateTeam);

router.delete('/:id', authenticateToken, TeamController.deleteTeam);
router.delete('/:teamId/players/:playerId', authenticateToken, TeamController.removePlayerFromTeam);
router.get('/:id/teamCaptain', authenticateToken, TeamController.getTeamCaptain);
router.get('/:id/championship-ranking',authenticateToken,TeamController.getTeamRanking)
router.get('/:id/player-stats', authenticateToken, TeamController.getPlayerStats)
export default router;