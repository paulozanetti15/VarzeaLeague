import { api } from './api';

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
  const response = await api.get('/user');
  return response?.data ?? [];
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await api.post('/user', userData);
  return response.data;
};

export const updateUser = async (userId: number, userData: UpdateUserData): Promise<User> => {
  const response = await api.put(`/user/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/user/${userId}`);
};