import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function createFriendlyMatch(matchData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches`, matchData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function getFriendlyMatches(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  const response = await axios.get(`${API_BASE_URL}/friendly-matches?${params.toString()}`);
  return response.data;
}

export async function getFriendlyMatchById(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function updateFriendlyMatch(matchId: number, matchData: any) {
  const response = await axios.put(`${API_BASE_URL}/friendly-matches/${matchId}`, matchData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteFriendlyMatch(matchId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function joinFriendlyMatchTeam(matchId: number, teamData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/teams`, teamData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function getFriendlyMatchTeams(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/teams`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function leaveFriendlyMatchTeam(matchId: number, teamId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/teams/${teamId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getFriendlyMatchPenalty(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/penalty`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function createFriendlyMatchPenalty(matchId: number, penaltyData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/penalty`, penaltyData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function updateFriendlyMatchPenalty(matchId: number, penaltyData: any) {
  const response = await axios.put(`${API_BASE_URL}/friendly-matches/${matchId}/penalty`, penaltyData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function deleteFriendlyMatchPenalty(matchId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/penalty`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function finalizeFriendlyMatch(matchId: number, finalizeData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/finalize`, finalizeData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function addFriendlyMatchGoal(matchId: number, goalData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/events/goals`, goalData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function addFriendlyMatchCard(matchId: number, cardData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/events/cards`, cardData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function getFriendlyMatchEvents(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/events`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function deleteFriendlyMatchGoal(matchId: number, eventId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/events/goals/${eventId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function deleteFriendlyMatchCard(matchId: number, eventId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/events/cards/${eventId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function clearFriendlyMatchGoals(matchId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/events/goals`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function clearFriendlyMatchCards(matchId: number) {
  const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/events/cards`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function getFriendlyMatchEvaluations(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations`, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function upsertFriendlyMatchEvaluation(matchId: number, evaluationData: any) {
  const response = await axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations`, evaluationData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  });
  return response.data;
}

export async function getFriendlyMatchEvaluationSummary(matchId: number) {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/evaluations/summary`, {
    headers: getAuthHeaders()
  });
  return response.data;
}
