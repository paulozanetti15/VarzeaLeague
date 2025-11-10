import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export interface Notification {
  id: number;
  userId: number;
  type: 'team_linked_to_match' | 'match_cancelled' | 'match_updated' | 'championship_match_scheduled';
  title: string;
  message: string;
  relatedMatchId?: number;
  relatedTeamId?: number;
  relatedChampionshipId?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  match?: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  team?: {
    id: number;
    name: string;
    banner?: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export const getNotifications = async (limit = 20, offset = 0, unreadOnly = false): Promise<NotificationsResponse> => {
  const response = await axios.get(`${API_BASE}/notifications`, {
    headers: getAuthHeaders(),
    params: { limit, offset, unreadOnly },
  });
  return response.data;
};

export const getUnreadNotificationCount = async (): Promise<{ count: number }> => {
  const response = await axios.get(`${API_BASE}/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await axios.patch(`${API_BASE}/notifications/${id}/read`, {}, {
    headers: getAuthHeaders(),
  });
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await axios.patch(`${API_BASE}/notifications/read-all`, {}, {
    headers: getAuthHeaders(),
  });
};

