import axios from 'axios';
import { API_BASE_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

// Auth services
export async function register(userData: any) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(response.data.message || 'Erro ao registrar usuário');
  }

  return response.data;
}

export async function checkCPF(cpf: string) {
  const response = await axios.get(`${API_BASE_URL}/auth/check-cpf/${cpf.replace(/\D/g, '')}`);
  return response.data;
}

export async function login(credentials: { email: string; password: string }) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.status !== 200) {
    throw new Error(response.data.message || 'Erro ao fazer login');
  }

  return response.data;
}

export default {
  register,
  checkCPF,
  login
};