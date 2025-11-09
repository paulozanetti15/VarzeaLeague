import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function getTeamFriendlyMatchesHistory(teamId: number) {
  const response = await axios.get(
    `${API_BASE_URL}/teams/${teamId}/history/friendly-matches`,
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function getTeamChampionshipMatchesHistory(teamId: number, championshipId?: number) {
  const url = championshipId
    ? `${API_BASE_URL}/teams/${teamId}/history/championships/${championshipId}/matches`
    : `${API_BASE_URL}/teams/${teamId}/history/championship-matches`;

  const response = await axios.get(url, { headers: getAuthHeaders() });
  return response.data;
}

export async function getFriendlyMatchReport(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-match-reports/${matchId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function createFriendlyMatchReport(reportData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-match-reports`, reportData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function updateFriendlyMatchReport(matchId: number, reportData: any) {
  const response = await axios.put(`${API_BASE_URL}/friendly-match-reports/${matchId}`, reportData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteFriendlyMatchReport(matchId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-match-reports/${matchId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getChampionshipMatchReport(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/championship-reports/${matchId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function updateChampionshipMatchReport(matchId: number, reportData: any) {
  const response = await axios.put(`${API_BASE_URL}/championship-reports/${matchId}`, reportData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteChampionshipMatchReport(matchId: number) {
  const response = await axios.delete(`${API_BASE_URL}/championship-reports/${matchId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}
