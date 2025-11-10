import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export async function request<T = any>(
  endpoint: string,
  method: string = 'GET',
  data?: any
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: any = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers,
    ...(data && { data })
  };

  const response = await axios(config);
  return response.data;
}

