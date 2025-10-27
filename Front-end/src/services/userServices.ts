
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  sexo: string;
  userTypeId: number;
  usertype?: {
    name: string;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  sexo: string;
  userTypeId: string;
  password: string;
}

export interface UpdateUserData extends Omit<CreateUserData, 'password'> {
  password?: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_BASE}/user`, {
      headers: getAuthHeaders()
    });
    return response?.data ?? [];
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error(error.response?.data?.message || 'Erro ao buscar usuários');
  }
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const response = await axios.post(`${API_BASE}/user`, userData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    throw new Error(error.response?.data?.message || 'Erro ao criar usuário');
  }
};

export const updateUser = async (userId: number, userData: UpdateUserData): Promise<User> => {
  try {
    const response = await axios.put(`${API_BASE}/user/${userId}`, userData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error(error.response?.data?.message || 'Erro ao atualizar usuário');
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/user/${userId}`, {
      headers: getAuthHeaders()
    });
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    throw new Error(error.response?.data?.message || 'Erro ao deletar usuário');
  }
};