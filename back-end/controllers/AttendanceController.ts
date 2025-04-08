import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Match from '../models/Match';
import User from '../models/User';
import sequelize from '../config/database';


interface AuthRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
}

export const AttendanceController = {
  getMatchAttendance: async (req: Request, res: Response): Promise<void> => {
    try {
      const { matchId } = req.params;
      
      const attendance = await Attendance.findAll({
        where: { matchId },
        include: [{
          model: User,
          attributes: ['id', 'name']
        }]
      });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar presenças' });
    }
  },

  updateAttendance: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { matchId } = req.params;
      const { userId, status } = req.body;

      // Verificar se a partida existe
      const match = await Match.findByPk(matchId);
      if (!match) {
        res.status(404).json({ error: 'Partida não encontrada' });
        return;
      }

      // Verificar se o usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      // Atualizar ou criar registro de presença
      const [attendance] = await Attendance.upsert({
        matchId: parseInt(matchId),
        userId,
        status,
        confirmationDate: new Date()
      });

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar presença' });
    }
  },

  getTeamAttendanceStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const { teamId, matchId } = req.params;

      const stats = await Attendance.findAll({
        where: { matchId },
        include: [{
          model: User,
          where: { teamId },
          attributes: ['id', 'name']
        }],
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('status')), 'count']
        ],
        group: ['status']
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas de presença' });
    }
  },

  notifyPendingPlayers: async (req: Request, res: Response): Promise<void> => {
    try {
      const { matchId } = req.params;

      // Buscar jogadores com status pendente
      const pendingAttendances = await Attendance.findAll({
        where: { 
          matchId,
          status: 'PENDING'
        },
        include: [{
          model: User,
          attributes: ['id', 'name', 'email']
        }]
      });

      // Aqui você implementaria a lógica de notificação
      // Por exemplo, enviar e-mails ou notificações push

      res.json({ 
        message: 'Notificações enviadas',
        pendingCount: pendingAttendances.length 
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao notificar jogadores' });
    }
  }
}; 