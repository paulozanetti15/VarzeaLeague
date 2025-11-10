import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/NotificationModel';
import User from '../models/UserModel';
import Team from '../models/TeamModel';
import Match from '../models/FriendlyMatchesModel';

// Buscar notificações do usuário
export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const where: any = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      res.status(404).json({ message: 'Notificação não encontrada' });
      return;
    }

    await notification.update({ isRead: true });
    res.json({ message: 'Notificação marcada como lida', notification });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ message: 'Erro ao marcar notificação como lida' });
  }
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ message: 'Erro ao marcar todas as notificações como lidas' });
  }
};

// Criar notificação (função auxiliar para ser usada em outros controllers)
export const createNotification = async (
  userId: number,
  type: 'team_linked_to_match' | 'match_cancelled' | 'match_updated' | 'championship_match_scheduled',
  title: string,
  message: string,
  relatedMatchId?: number,
  relatedTeamId?: number,
  relatedChampionshipId?: number
): Promise<Notification> => {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    relatedMatchId,
    relatedTeamId,
    relatedChampionshipId,
    isRead: false,
  });
};

// Buscar contagem de notificações não lidas
export const getUnreadNotificationCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ count });
  } catch (error) {
    console.error('Erro ao buscar contagem de notificações:', error);
    res.status(500).json({ message: 'Erro ao buscar contagem de notificações' });
  }
};

