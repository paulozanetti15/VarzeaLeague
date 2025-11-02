import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function getChampionshipTeams(champId: number) {
  const response = await axios.get(`${API_BASE}/championships/${champId}/teams`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function joinChampionshipTeam(champId: number, teamData: any) {
  const response = await axios.post(`${API_BASE}/championships/${champId}/teams`, teamData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function leaveChampionshipTeam(champId: number, teamId: number) {
  const response = await axios.delete(`${API_BASE}/championships/${champId}/teams/${teamId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function applyToChampionship(champId: number, applicationData: any) {
  const response = await axios.post(`${API_BASE}/championships/${champId}/applications`, applicationData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function getChampionshipApplications(champId: number) {
  const response = await axios.get(`${API_BASE}/championships/${champId}/applications`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function updateApplicationStatus(champId: number, applicationId: number, statusData: any) {
  const response = await axios.put(`${API_BASE}/championships/${champId}/applications/${applicationId}/status`, statusData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function publishChampionship(champId: number) {
  const response = await axios.put(`${API_BASE}/championships/${champId}/publish`, {}, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getChampionshipPenalty(champId: number) {
  const response = await axios.get(`${API_BASE}/championships/${champId}/penalty`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function createChampionshipPenalty(champId: number, penaltyData: any) {
  const response = await axios.post(`${API_BASE}/championships/${champId}/penalty`, penaltyData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function updateChampionshipPenalty(champId: number, penaltyData: any) {
  const response = await axios.put(`${API_BASE}/championships/${champId}/penalty`, penaltyData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteChampionshipPenalty(champId: number) {
  const response = await axios.delete(`${API_BASE}/championships/${champId}/penalty`, {
    headers: getAuthHeaders()
  });
  return response.data;
}
