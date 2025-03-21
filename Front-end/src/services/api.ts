const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  matches: {
    create: async (matchData: any) => {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(matchData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao criar partida');
      }

      return data;
    },
    list: async () => {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao listar partidas');
      }

      return data;
    },
  },
}; 