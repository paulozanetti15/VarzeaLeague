import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export interface Championship {
  id: number;
  name: string;
  // outros campos conforme necessário
}

// Championships services
export async function getAllChampionships() {
  const response = await axios.get(`${API_BASE}/championships`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function createChampionship(champData: any) {
  const response = await axios.post(`${API_BASE}/championships`, champData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function getChampionshipById(champId: number) {
  const response = await axios.get(`${API_BASE}/championships/${champId}`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function updateChampionship(champId: number, champData: any) {
  const response = await axios.put(`${API_BASE}/championships/${champId}`, champData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function deleteChampionship(champId: number) {
  const response = await axios.delete(`${API_BASE}/championships/${champId}`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function joinChampionship(champId: number) {
  const response = await axios.post(`${API_BASE}/championships/${champId}/join`, {}, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function joinChampionshipWithTeam(champId: number, teamId: number) {
  const response = await axios.post(`${API_BASE}/championships/${champId}/join-team`, { teamId }, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function leaveChampionshipWithTeam(champId: number, teamId: number) {
  const response = await axios.delete(`${API_BASE}/championships/${champId}/join-team/${teamId}`, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function leaveChampionship(champId: number) {
  const response = await axios.post(`${API_BASE}/championships/${champId}/leave`, {}, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });

  return response.data;
}

export async function getChampionshipTeams(champId: number) {
  const response = await axios.get(`${API_BASE}/championships/${champId}/join-team`, {
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
  getChampionshipTeams
};