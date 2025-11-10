import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Notifications, 
  CheckCircle, 
  SportsSoccer, 
  EmojiEvents,
  Close,
  DoneAll
} from '@mui/icons-material';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  Notification 
} from '../services/notificationService';
import './NotificationDropdown.css';

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(20, 0, false);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }

    setIsOpen(false);

    // Navegar para a página relevante
    if (notification.relatedMatchId) {
      navigate(`/matches/${notification.relatedMatchId}`);
    } else if (notification.relatedChampionshipId) {
      navigate(`/championships/${notification.relatedChampionshipId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'team_linked_to_match':
      case 'championship_match_scheduled':
        return <SportsSoccer className="notification-icon" />;
      case 'match_cancelled':
      case 'match_updated':
        return <EmojiEvents className="notification-icon" />;
      default:
        return <Notifications className="notification-icon" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <Tooltip title="Notificações">
        <IconButton
          className="navbar-notification-button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              fetchNotifications();
            }
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Notifications className={unreadCount > 0 ? 'notification-bell-active' : ''} />
          </Badge>
        </IconButton>
      </Tooltip>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-header">
              <h3>Notificações</h3>
              {unreadCount > 0 && (
                <Tooltip title="Marcar todas como lidas">
                  <IconButton
                    size="small"
                    onClick={handleMarkAllAsRead}
                    className="mark-all-read-button"
                  >
                    <DoneAll fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                className="close-button"
              >
                <Close fontSize="small" />
              </IconButton>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">
                  <div className="loading-spinner"></div>
                  <p>Carregando notificações...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <Notifications className="empty-icon" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="notification-icon-wrapper">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <h4>{notification.title}</h4>
                        {!notification.isRead && <span className="unread-dot"></span>}
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{formatDate(notification.createdAt)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button
                  className="view-all-button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;

