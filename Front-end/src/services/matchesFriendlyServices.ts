import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface MatchFormData {
  title: string;
  description: string;
  location?: string;
  date: string;
  time: string;
  duration?: string;
  price?: string;
  complement?: string;
  cep?: string;
  UF?: string;
  city?: string;
  category?: string;
  number?: string;
  square?: string;
  matchType?: string;
}

export interface Match {
  id: number;
  title: string;
  date: string;
  location?: string;
  maxPlayers?: number;
  description?: string;
  price?: number | null;
  status?: string;
  duration?: string;
  organizerId?: number;
  organizer?: { id: number; name: string };
  matchType?: string;
  square?: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// -- Create Match related
export async function createMatch(matchData: MatchFormData & { organizerId: string }): Promise<any> {
  const resp = await axios.post(`${API_BASE_URL}/friendly-matches`, matchData, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
  return resp.data;
}

export async function searchCEP(cep: string): Promise<any> {
  const cepLimpo = (cep || '').replace(/\D/g, '');
  const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  return response.data;
}

// -- General match APIs
export async function fetchMatches(filters?: Record<string, string>): Promise<Match[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  }
  const url = `/friendly-matches${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(`${API_BASE_URL}${url}`, { headers: getAuthHeaders() });
  return response.data || [];
}

export async function fetchMatchesFiltered(filters?: Record<string, string>): Promise<Match[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  }
  const url = `/friendly-matches/filtered${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(`${API_BASE_URL}${url}`, { headers: getAuthHeaders() });
  return response.data || [];
}

export async function fetchMatchesByOrganizer(): Promise<Match[]> {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/organizer`, { headers: getAuthHeaders() });
  return response.data || [];
}

export async function fetchMatchById(id: number): Promise<Match> {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${id}`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getMatchStatus(matchId: string | number): Promise<{ id: number; status: string }> {
  const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/status`, { headers: getAuthHeaders() });
  return response.data;
}

export async function loadPlayersForMatch(matchId: number): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/players`, { headers: getAuthHeaders() });
    return response.data?.players || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getMatch(matchId: string) {
  return axios.get(`${API_BASE_URL}/friendly-matches/${matchId}`, { headers: getAuthHeaders() });
}

export async function updateMatch(matchId: string, payload: any) {
  return axios.put(`${API_BASE_URL}/friendly-matches/${matchId}`, payload, { headers: getAuthHeaders() });
}

export async function getJoinedTeams(matchId: string | number) {
  return axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/teams`, { headers: getAuthHeaders() });
}

export async function joinTeam(matchId: string | number, payload: any) {
  return axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/teams`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}

export async function leaveTeam(matchId: string | number, teamId: number) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}/teams/${teamId}`, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
    });
    return response;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Sem permissão para remover este time. Apenas o capitão do time, organizador da partida ou administrador podem fazer isso.');
    }
    if (error.response?.status === 404) {
      throw new Error('Time não está inscrito nesta partida ou a partida não foi encontrada.');
    }
    throw error;
  }
}

export async function getAvailableForMatch(matchId: string | number) {
  return axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/teams/available`, { headers: getAuthHeaders() });
}

// -- Punicao (penalty) endpoints
export async function getPunicao(matchId: string | number) {
  return axios.get(`${API_BASE_URL}/punishments/friendly-matches/${matchId}`, { headers: getAuthHeaders() });
}

export async function createPunicao(matchId: string | number, payload: any) {
  return axios.post(`${API_BASE_URL}/punishments/friendly-matches/${matchId}`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}

export async function updatePunicao(matchId: string | number, payload: any) {
  return axios.put(`${API_BASE_URL}/punishments/friendly-matches/${matchId}`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}

export async function deletePunicao(matchId: string | number) {
  return axios.delete(`${API_BASE_URL}/punishments/friendly-matches/${matchId}`, { headers: getAuthHeaders() });
}

export async function getMatchEvents(matchId: string | number) {
  return axios.get(`${API_BASE_URL}/friendly-match-reports/${matchId}/events`, { headers: getAuthHeaders() });
}

export async function finalizeMatch(matchId: string | number) {
  return axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/finalize`, {}, { headers: getAuthHeaders() });
}

export async function deleteMatch(matchId: string | number) {
  return axios.delete(`${API_BASE_URL}/friendly-matches/${matchId}`, { headers: getAuthHeaders() });
}

export async function getAttendance(matchId: string | number) {
  return axios.get(`${API_BASE_URL}/friendly-matches/${matchId}/attendance`, { headers: getAuthHeaders() });
}

export async function postAttendance(matchId: string | number, payload: any) {
  return axios.post(`${API_BASE_URL}/friendly-matches/${matchId}/attendance`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}


export default {
  createMatch,
  searchCEP,
  fetchMatches,
  fetchMatchesFiltered,
  fetchMatchesByOrganizer,
  fetchMatchById,
  loadPlayersForMatch,
  getMatch,
  updateMatch,
  getMatchStatus
};