import express from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/teams';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas JPG, PNG e GIF são aceitos.'));
    }
  }
});

// Todas as rotas precisam de autenticação
router.get('/', authenticateToken, TeamController.listTeams);
router.get('/:id', authenticateToken, TeamController.getTeam);
router.post('/', authenticateToken, TeamController.create);
router.put('/:id', authenticateToken, TeamController.updateTeam);
router.post('/:id/banner', authenticateToken, upload.single('banner'), TeamController.uploadBanner);
router.delete('/:id', authenticateToken, TeamController.deleteTeam);

export default router;