import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getUserTeams } from './teamsServices';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function createPlayer(payload: { nome: string; sexo: string; ano: string; posicao: string; teamId?: number }) {
  const response = await axios.post(`${API_BASE_URL}/players`, payload, { headers: getAuthHeaders() });
  return response.data;
}

export async function linkPlayerToTeam(teamId: number, playerId: number) {
  const response = await axios.post(`${API_BASE_URL}/players/${teamId}`, [{ playerId, teamId }], { headers: getAuthHeaders() });
  return response.data;
}

export default { createPlayer, linkPlayerToTeam };
