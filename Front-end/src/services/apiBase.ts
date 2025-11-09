const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
};

export const request = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  isFormData: boolean = false
) => {
  const headers: HeadersInit = {
    ...getAuthHeaders()
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method,
    headers
  };

  if (data && method !== 'GET') {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  return handleResponse(response);
};

export { API_URL };
