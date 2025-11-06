import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function getPlayerRanking() {
  const response = await axios.get(`${API_BASE_URL}/ranking/players`, {
    headers: getAuthHeaders()
  });
  return response.data;
}
