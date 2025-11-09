import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { request } from './apiBase';

type TeamLike = Record<string, any> | null;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function normalizeTeam(team: TeamLike) {
  if (!team || typeof team !== 'object') {
    return team;
  }

  const normalized = { ...team };

  if (normalized.estado === undefined && normalized.state !== undefined) {
    normalized.estado = normalized.state;
  }
  if (normalized.cidade === undefined && normalized.city !== undefined) {
    normalized.cidade = normalized.city;
  }
  if (normalized.cep === undefined && normalized.CEP !== undefined) {
    normalized.cep = normalized.CEP;
  }

  return normalized;
}

function normalizeTeamsCollection(data: any) {
  if (Array.isArray(data)) {
    return data.map(normalizeTeam);
  }
  return normalizeTeam(data);
}

function formatCreateValues(payload: Record<string, any>) {
  const requestBody: Record<string, any> = { ...payload };

  if (requestBody.state === undefined && requestBody.estado !== undefined) {
    requestBody.state = requestBody.estado;
  }
  if (requestBody.city === undefined && requestBody.cidade !== undefined) {
    requestBody.city = requestBody.cidade;
  }
  if (requestBody.CEP === undefined && requestBody.cep !== undefined) {
    requestBody.CEP = requestBody.cep;
  }

  delete requestBody.estado;
  delete requestBody.cidade;
  delete requestBody.cep;

  return requestBody;
}

function formatUpdateValues(payload: Record<string, any>) {
  const requestBody: Record<string, any> = { ...payload };

  if (requestBody.estado === undefined && requestBody.state !== undefined) {
    requestBody.estado = requestBody.state;
  }
  if (requestBody.cidade === undefined && requestBody.city !== undefined) {
    requestBody.cidade = requestBody.city;
  }
  if (requestBody.cep === undefined && requestBody.CEP !== undefined) {
    requestBody.cep = requestBody.CEP;
  }

  delete requestBody.state;
  delete requestBody.city;
  delete requestBody.CEP;

  return requestBody;
}

function appendFormValues(formData: FormData, data: Record<string, any>) {
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });
}

export interface Team {
  id: number;
  name: string;
  nome?: string;
  genero?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  banner?: string;
  foto?: string;
  isCurrentUserCaptain?: boolean;
  captainId?: number;
  userId?: number;
  maxParticipantes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getUserTeams() {
  const response = await axios.get(`${API_BASE_URL}/teams`, {
    headers: getAuthHeaders()
  });

  const allTeams = normalizeTeamsCollection(response.data);

  if (Array.isArray(allTeams)) {
    const teamsAsCaptain = allTeams.filter(team =>
      team && team.isCurrentUserCaptain === true
    );
    console.log(`O usuário é capitão de ${teamsAsCaptain.length} times`);

    return allTeams;
  }

  return allTeams;
}

export async function getAllTeams() {
  const response = await axios.get(`${API_BASE_URL}/teams`, {
    headers: getAuthHeaders()
  });
  return normalizeTeamsCollection(response.data);
}

export async function getTeamById(teamId: number) {
  const response = await axios.get(`${API_BASE_URL}/teams/${teamId}`, {
    headers: getAuthHeaders()
  });
  return normalizeTeam(response.data);
}

export async function getByCaptain(captainId: number) {
  return request<Team[]>(`/teams/${captainId}/teamCaptain`, 'GET');
}

export async function getChampionshipRanking(teamId: number) {
  return request(`/teams/${teamId}/championship-ranking`, 'GET');
}

export async function createTeam(payload: Record<string, any>) {
  const body = formatCreateValues(payload);
  const formData = new FormData();

  const bannerFile = payload.banner ?? payload.logo ?? payload.image;
  if (bannerFile) {
    formData.append('banner', bannerFile);
    delete body.banner;
    delete body.logo;
    delete body.image;
  }

  appendFormValues(formData, body);

  const response = await axios.post(`${API_BASE_URL}/teams`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return normalizeTeam(response.data);
}

export async function updateTeam(teamId: number, payload: Record<string, any>) {
  const body = formatUpdateValues(payload);
  const formData = new FormData();

  const bannerFile = payload.banner ?? payload.logo ?? payload.image;
  if (bannerFile) {
    formData.append('banner', bannerFile);
    delete body.banner;
    delete body.logo;
    delete body.image;
  }

  appendFormValues(formData, body);

  const response = await axios.put(`${API_BASE_URL}/teams/${teamId}`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return normalizeTeam(response.data);
}

export async function getTeamPlayerStats(teamId: number) {
  const response = await axios.get(`${API_BASE_URL}/teams/${teamId}/player-stats`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function getTeamPlayers(teamId: number) {
  const response = await axios.get(`${API_BASE_URL}/players/${teamId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function deleteTeam(teamId: number) {
  const response = await axios.delete(`${API_BASE_URL}/teams/${teamId}`, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    data: { confirm: true }
  });
  return response.data;
}

export default {
  getUserTeams,
  getAllTeams,
  getTeamById,
  getByCaptain,
  getChampionshipRanking,
  createTeam,
  updateTeam,
  getTeamPlayerStats,
  getTeamPlayers,
  deleteTeam
};
