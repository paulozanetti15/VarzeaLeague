const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response: Response) => {
  try {
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
      
      // Erro 500 - permitir simulação local para testes
      if (response.status === 500) {
        const error = new Error(data.message || data.error || 'Erro ao conectar com o servidor');
        (error as any).simulateLocally = true;
        throw error;
      }
      
      throw new Error(data.message || data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Erro de parsing JSON
      console.error('Erro ao processar resposta da API:', error);
      throw new Error('Formato de resposta inválido do servidor');
    }
    throw error;
  }
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
    join: async (matchId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Enviando requisição para entrar na partida:', {
        url: `${API_BASE_URL}/matches/${matchId}/join`,
        token: token ? 'Token presente' : 'Token ausente'
      });

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      return handleResponse(response);
    },
    joinWithTeam: async (matchId: number, teamId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Enviando requisição para entrar na partida ${matchId} com o time ${teamId}:`, {
        url: `${API_BASE_URL}/matches/${matchId}/join-team`,
        token: token ? 'Token presente' : 'Token ausente'
      });

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/join-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId })
      });

      return handleResponse(response);
    },
    getById: async (matchId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    },
    leave: async (matchId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      return handleResponse(response);
    },
  },
  teams: {
    getUserTeams: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Buscando times do usuário');

      try {
        // Usar diretamente a API de times e filtrar pelo usuário atual
        const allTeamsResponse = await fetch(`${API_BASE_URL}/teams`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const allTeams = await handleResponse(allTeamsResponse);
        
        // Obtém o ID do usuário atual
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Filtra pelos times onde o usuário é o capitão ou jogador
        if (Array.isArray(allTeams)) {
          // Na resposta da API, os times já estão filtrados para o usuário atual
          // então não precisamos filtrar novamente
          console.log(`A API retornou ${allTeams.length} times para o usuário`);
          
          // Verificar quais times o usuário é capitão
          const teamsAsCaptain = allTeams.filter(team => 
            team && team.isCurrentUserCaptain === true
          );
          console.log(`O usuário é capitão de ${teamsAsCaptain.length} times`);
          
          return allTeams;
        }
        
        // Se não conseguir filtrar, retorna a lista completa
        return allTeams;
      } catch (error) {
        console.error("Erro ao buscar times do usuário:", error);
        throw error;
      }
    },
    
    list: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    },
    
    getById: async (teamId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleResponse(response);
    },
  }
}; 