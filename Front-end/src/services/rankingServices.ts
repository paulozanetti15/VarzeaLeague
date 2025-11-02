import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function getPlayerRanking() {
  const response = await axios.get(`${API_BASE}/ranking/players`, {
    headers: getAuthHeaders()
  });
  return response.data;
}
