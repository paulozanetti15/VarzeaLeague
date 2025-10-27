import axios from 'axios';
// date-fns not required here

const API_BASE = 'http://localhost:3001/api';

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
  quadra?: string;
  modalidade?: string;
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
  modalidade?: string;
  nomequadra?: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

// -- Create Match related
export async function createMatch(matchData: MatchFormData & { organizerId: string }): Promise<any> {
  const resp = await axios.post(`${API_BASE}/matches`, matchData, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
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
  const url = `/matches${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(`${API_BASE}${url}`, { headers: getAuthHeaders() });
  return response.data || [];
}

export async function fetchMatchesFiltered(filters?: Record<string, string>): Promise<Match[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  }
  const url = `/matches/filtered${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(`${API_BASE}${url}`, { headers: getAuthHeaders() });
  return response.data || [];
}

export async function fetchMatchesByOrganizer(): Promise<Match[]> {
  const response = await axios.get(`${API_BASE}/matches/organizer`, { headers: getAuthHeaders() });
  return response.data || [];
}

export async function fetchMatchById(id: number): Promise<Match> {
  const response = await axios.get(`${API_BASE}/matches/${id}`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getMatchStatus(matchId: string | number): Promise<{ id: number; status: string }> {
  const response = await axios.get(`${API_BASE}/matches/${matchId}/status`, { headers: getAuthHeaders() });
  return response.data;
}

export async function loadPlayersForMatch(matchId: number): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE}/matches/${matchId}/players`, { headers: getAuthHeaders() });
    return response.data?.players || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// -- Single match simple helpers (used by hook)
export async function getMatch(matchId: string) {
  return axios.get(`${API_BASE}/matches/${matchId}`, { headers: getAuthHeaders() });
}

export async function updateMatch(matchId: string, payload: any) {
  return axios.put(`${API_BASE}/matches/${matchId}`, payload, { headers: getAuthHeaders() });
}

// -- Teams / registra;tions
export async function getJoinedTeams(matchId: string | number) {
  return axios.get(`${API_BASE}/matches/${matchId}/join-team`, { headers: getAuthHeaders() });
}

export async function joinTeam(matchId: string | number, payload: any) {
  return axios.post(`${API_BASE}/matches/${matchId}/join-team`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}

export async function leaveTeam(matchId: string | number, teamId: number) {
  return axios.delete(`${API_BASE}/matches/${matchId}/join-team/${teamId}`, { headers: getAuthHeaders() });
}

export async function getAvailableForMatch(matchId: string | number) {
  return axios.get(`${API_BASE}/matches/${matchId}/available`, { headers: getAuthHeaders() });
}

// -- Punicao (penalty) endpoints
export async function getPunicao(matchId: string | number) {
  return axios.get(`${API_BASE}/matches/${matchId}/punicao`, { headers: getAuthHeaders() });
}

export async function createPunicao(matchId: string | number, payload: any) {
  return axios.post(`${API_BASE}/matches/${matchId}/punicao`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}

export async function updatePunicao(matchId: string | number, payload: any) {
  return axios.put(`${API_BASE}/matches/${matchId}/punicao`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
}

export async function deletePunicao(matchId: string | number) {
  return axios.delete(`${API_BASE}/matches/${matchId}/punicao`, { headers: getAuthHeaders() });
}

// -- Events / sumula
export async function getMatchEvents(matchId: string | number) {
  return axios.get(`${API_BASE}/matches/${matchId}/events`, { headers: getAuthHeaders() });
}

// -- Finalize / delete
export async function finalizeMatch(matchId: string | number) {
  return axios.post(`${API_BASE}/matches/${matchId}/finalize`, {}, { headers: getAuthHeaders() });
}

export async function deleteMatch(matchId: string | number) {
  return axios.delete(`${API_BASE}/matches/${matchId}`, { headers: getAuthHeaders() });
}

// -- Attendance
export async function getAttendance(matchId: string | number) {
  return axios.get(`${API_BASE}/matches/${matchId}/attendance`, { headers: getAuthHeaders() });
}

export async function postAttendance(matchId: string | number, payload: any) {
  return axios.post(`${API_BASE}/matches/${matchId}/attendance`, payload, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
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