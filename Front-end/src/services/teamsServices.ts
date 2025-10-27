import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export interface Team {
  id: number;
  name: string;
  // outros campos conforme necessário
}

// Teams services
export async function getUserTeams() {
  const response = await axios.get(`${API_BASE}/teams`, {
    headers: getAuthHeaders()
  });

  const allTeams = response.data;

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
  const response = await axios.get(`${API_BASE}/teams`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function getTeamById(teamId: number) {
  const response = await axios.get(`${API_BASE}/teams/${teamId}`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function createTeam(payload: Record<string, any>) {
  const response = await axios.post(`${API_BASE}/teams`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function updateTeam(teamId: number, payload: { name: string; description?: string }) {
  const response = await axios.put(`${API_BASE}/teams/${teamId}`, payload, {
    headers: getAuthHeaders()
  });
  return response.data;
}

export async function uploadTeamLogo(teamId: number, file: File) {
  const fd = new FormData();
  fd.append('logo', file);
  const response = await axios.post(`${API_BASE}/teams/${teamId}/logo`, fd, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function getTeamPlayerStats(teamId: number) {
  const response = await axios.get(`${API_BASE}/teams/${teamId}/player-stats`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function getTeamPlayers(teamId: number) {
  const response = await axios.get(`${API_BASE}/teamplayers/${teamId}`, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export default {
  getUserTeams,
  getAllTeams,
  getTeamById,
  getTeamPlayerStats
};