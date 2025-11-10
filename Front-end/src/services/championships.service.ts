import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export interface Championship {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  modalidade?: string;
  nomequadra?: string;
  tipo?: string;
  genero?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllChampionships() {
  const response = await axios.get(`${API_BASE_URL}/championships`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function createChampionship(champData: any) {
  const response = await axios.post(`${API_BASE_URL}/championships`, champData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function getChampionshipById(champId: number) {
  const response = await axios.get(`${API_BASE_URL}/championships/${champId}`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function updateChampionship(champId: number, champData: any) {
  const response = await axios.put(`${API_BASE_URL}/championships/${champId}`, champData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function deleteChampionship(champId: number) {
  const response = await axios.delete(`${API_BASE_URL}/championships/${champId}`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function joinChampionship(champId: number) {
  const response = await axios.post(`${API_BASE_URL}/championships/${champId}/join`, {}, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function joinChampionshipWithTeam(champId: number, teamId: number) {
  const response = await axios.post(`${API_BASE_URL}/championships/${champId}/teams`, { teamId }, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function leaveChampionshipWithTeam(champId: number, teamId: number) {
  const response = await axios.delete(`${API_BASE_URL}/championships/${champId}/teams/${teamId}`, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function leaveChampionship(champId: number) {
  const response = await axios.post(`${API_BASE_URL}/championships/${champId}/leave`, {}, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function getChampionshipTeams(champId: number) {
  const response = await axios.get(`${API_BASE_URL}/championships/${champId}/teams`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function uploadChampionshipLogo(championshipId: number, file: File) {
  const fd = new FormData();
  fd.append('logo', file);
  const response = await axios.post(`${API_BASE_URL}/championships/${championshipId}/logo`, fd, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function createChampionshipMatch(championshipId: number, matchData: {
  teamHomeId: number;
  teamAwayId: number;
  date: string;
  time: string;
  location: string;
  rodada: number;
}) {
  const response = await axios.post(`${API_BASE_URL}/championships/${championshipId}/matches`, matchData, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getChampionshipMatches(championshipId: number) {
  const response = await axios.get(`${API_BASE_URL}/championships/${championshipId}/matches`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export default {
  getAllChampionships,
  createChampionship,
  getChampionshipById,
  updateChampionship,
  deleteChampionship,
  joinChampionship,
  joinChampionshipWithTeam,
  leaveChampionshipWithTeam,
  leaveChampionship,
  getChampionshipTeams,
  uploadChampionshipLogo,
  createChampionshipMatch,
  getChampionshipMatches
};
