import express, { RequestHandler } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas de presença
router.get(
  '/matches/:matchId/attendance',
  AttendanceController.getMatchAttendance as RequestHandler
);

router.post(
  '/matches/:matchId/attendance',
  AttendanceController.updateAttendance as RequestHandler
);

router.get(
  '/teams/:teamId/matches/:matchId/attendance',
  AttendanceController.getTeamAttendanceStats as RequestHandler
);

router.post(
  '/matches/:matchId/notify-pending',
  AttendanceController.notifyPendingPlayers as RequestHandler
);

export default router; 