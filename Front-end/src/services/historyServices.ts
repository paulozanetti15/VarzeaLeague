import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function getTeamFriendlyMatchesHistory(teamId: number) {
  const response = await axios.get(`${API_BASE}/history/teams/${teamId}/friendly-matches`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getTeamChampionshipMatchesHistory(teamId: number, championshipId?: number) {
  const url = championshipId 
    ? `${API_BASE}/history/teams/${teamId}/championship-matches?championshipId=${championshipId}`
    : `${API_BASE}/history/teams/${teamId}/championship-matches`;
    
  const response = await axios.get(url, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getFriendlyMatchReport(matchId: number) {
  const response = await axios.get(`${API_BASE}/history/friendly-matches/${matchId}/report`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function createFriendlyMatchReport(reportData: any) {
  const response = await axios.post(`${API_BASE}/history/friendly-matches/report`, reportData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function updateFriendlyMatchReport(matchId: number, reportData: any) {
  const response = await axios.put(`${API_BASE}/history/friendly-matches/${matchId}/report`, reportData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteFriendlyMatchReport(matchId: number) {
  const response = await axios.delete(`${API_BASE}/history/friendly-matches/${matchId}/report`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getChampionshipMatchReport(matchId: number) {
  const response = await axios.get(`${API_BASE}/history/championship-matches/${matchId}/report`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function updateChampionshipMatchReport(matchId: number, reportData: any) {
  const response = await axios.put(`${API_BASE}/history/championship-matches/${matchId}/report`, reportData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteChampionshipMatchReport(matchId: number) {
  const response = await axios.delete(`${API_BASE}/history/championship-matches/${matchId}/report`, {
    headers: getAuthHeaders()
  });
  return response.data;
}
