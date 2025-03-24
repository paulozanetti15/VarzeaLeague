const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Erro na requisição:', {
      status: response.status,
      data: data
    });

    if (response.status === 401 || response.status === 403) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    throw new Error(data.message || data.error || 'Erro na requisição');
  }

  return data;
};

export const api = {
  matches: {
    create: async (matchData: any) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Enviando requisição para criar partida:', {
        url: `${API_BASE_URL}/matches`,
        token: token ? 'Token presente' : 'Token ausente',
        data: matchData
      });

      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(matchData),
      });

      return handleResponse(response);
    },
    list: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    },
  },
}; 