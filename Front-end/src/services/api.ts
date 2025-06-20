import { loadPlayersForMatch } from './matchService';
import { getMatchErrorStatus, clearMatchErrors } from './apiHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const token = localStorage.getItem('token');

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

// Função auxiliar para simular erros durante o desenvolvimento
const simulateError = (matchId: number): boolean => {
  // Se estiver em modo de desenvolvimento e o ID da partida termina em 2 ou 7,
  // simular um erro para testes (pode ser ajustado conforme necessário)
  if (process.env.NODE_ENV === 'development') {
    // Para testar, pode descomentar a linha abaixo e comentar a condição real
    // return matchId % 3 === 0; // Simula erro a cada 3 partidas
    return matchId % 10 === 2 || matchId % 10 === 7;
  }
  return false;
};

// Cache local temporário para dados de partidas
const matchesCache: Record<number, { data: any, timestamp: number }> = {};

// Registro de endpoints que retornaram 404 para evitar tentativas repetidas
const invalidEndpoints: Set<string> = new Set();

// Tempo de expiração do cache em ms (2 minutos)
const CACHE_EXPIRATION = 2 * 60 * 1000;

// Limitar o tamanho do cache para evitar consumo excessivo de memória
const MAX_CACHE_SIZE = 20;

// Função para limpar entradas antigas do cache
const cleanupCache = () => {
  const now = Date.now();
  const cacheEntries = Object.entries(matchesCache);
  
  // Se o cache estiver abaixo do limite, apenas remover entradas expiradas
  if (cacheEntries.length <= MAX_CACHE_SIZE) {
    // Remover entradas expiradas
    cacheEntries.forEach(([matchId, entry]) => {
      if (now - entry.timestamp > CACHE_EXPIRATION) {
        console.log(`Removendo partida ${matchId} do cache por expiração`);
        delete matchesCache[Number(matchId)];
      }
    });
    return;
  }
  
  // Se o cache exceder o limite, remover as entradas mais antigas primeiro
  console.log(`Cache de partidas excedeu o limite (${cacheEntries.length}/${MAX_CACHE_SIZE}), limpando...`);
  
  // Ordenar por timestamp (mais antigo primeiro)
  const sortedEntries = cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  // Remover entradas até ficar abaixo do limite
  const entriesToRemove = sortedEntries.slice(0, sortedEntries.length - MAX_CACHE_SIZE);
  entriesToRemove.forEach(([matchId, _]) => {
    console.log(`Removendo partida ${matchId} do cache por limite excedido`);
    delete matchesCache[Number(matchId)];
  });
};

// Limpar o cache a cada 5 minutos
setInterval(cleanupCache, 5 * 60 * 1000);

// Registro de erros por partida para análise
const matchErrors: Record<number, {count: number, lastError: string, timestamp: number}> = {};

// Função para registrar um endpoint como inválido
const markEndpointAsInvalid = (endpoint: string) => {
  console.warn(`Marcando endpoint como inválido: ${endpoint}`);
  invalidEndpoints.add(endpoint);
  
  // Limpar o registro após 30 minutos para caso o endpoint seja corrigido
  setTimeout(() => {
    if (invalidEndpoints.has(endpoint)) {
      console.log(`Removendo endpoint ${endpoint} da lista de inválidos após 30 minutos`);
      invalidEndpoints.delete(endpoint);
    }
  }, 30 * 60 * 1000);
};

// Função para verificar se um endpoint é conhecido como inválido
const isEndpointInvalid = (endpoint: string): boolean => {
  return invalidEndpoints.has(endpoint);
};

// Função para registrar erro em uma partida específica
const registerMatchError = (matchId: number, errorMessage: string) => {
  if (!matchErrors[matchId]) {
    matchErrors[matchId] = {
      count: 0,
      lastError: '',
      timestamp: 0
    };
  }
  
  matchErrors[matchId].count++;
  matchErrors[matchId].lastError = errorMessage;
  matchErrors[matchId].timestamp = Date.now();
  
  // Log para diagnóstico
  if (matchErrors[matchId].count > 3) {
    console.warn(`Partida ${matchId} teve ${matchErrors[matchId].count} erros. Último erro: ${errorMessage}`);
  }
};

// Função para verificar se há dados em cache válidos
const getCachedMatch = (matchId: number) => {
  cleanupCache(); // Verificar e limpar cache a cada consulta
  
  const cachedData = matchesCache[matchId];
  if (!cachedData) return null;
  
  const now = Date.now();
  if (now - cachedData.timestamp > CACHE_EXPIRATION) {
    // Cache expirado
    console.log(`Cache da partida ${matchId} expirou`);
    delete matchesCache[matchId];
    return null;
  }
  
  // Dados válidos encontrados
  return cachedData.data;
};

// Função para salvar dados no cache
const cacheMatch = (matchId: number, data: any) => {
  // Não armazenar em cache dados com erro
  if (data._hasPlayerLoadError) {
    console.log(`Não armazenando partida ${matchId} em cache devido a erros`);
    return;
  }
  
  // Verificar se há jogadores válidos antes de armazenar em cache
  if (!data.players || !Array.isArray(data.players)) {
    console.log(`Não armazenando partida ${matchId} em cache devido a falta de dados de jogadores`);
    return;
  }
  
  console.log(`Armazenando partida ${matchId} em cache (${data.players.length} jogadores)`);
  matchesCache[matchId] = {
    data,
    timestamp: Date.now()
  };
  
  // Verificar se o cache excedeu o limite
  if (Object.keys(matchesCache).length > MAX_CACHE_SIZE) {
    cleanupCache();
  }
};

// Adicionar função para gerenciar requisições com timeout e retry
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000, retries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      lastError = error;
      
      // Se for o último retry, lançar o erro
      if (attempt === retries) {
        throw error;
      }
      
      // Aguardar antes de tentar novamente (exponential backoff)
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const api = {
  defaults: {
    headers: {
      common: {} as Record<string, string>
    }
  },
  auth: {
    register: async (userData: any) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao registrar usuário');
      }
      
      return response.json();
    },

    checkCPF: async (cpf: string) => {
      const response = await fetch(`${API_URL}/auth/check-cpf/${cpf.replace(/\D/g, '')}`);
      return response.json();
    },

    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }
      
      return response.json();
    },
  },
  matches: {
    create: async (matchData: any) => {
      const token = localStorage.getItem('token');
      console.log('Criando partida com dados:', matchData);
      console.log('Token encontrado:', token);
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Enviando requisição para criar partida:', {
        url: `${API_URL}/matches`,
        token: token ? 'Token presente' : 'Token ausente',
        data: matchData
      });

      const response = await fetch(`${API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(matchData),
      });
      return handleResponse(response);
    },
    list: async () => {
      try {
        // Verificar se temos localização do usuário no localStorage
        const userLocationStr = localStorage.getItem('userLocation');
        let locationParam = '';
        
        if (userLocationStr) {
          try {
            const userLocation = JSON.parse(userLocationStr);
            if (userLocation && userLocation.latitude && userLocation.longitude) {
              // Adicionar parâmetros de localização para o backend poder calcular distâncias
              locationParam = `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
              console.log('Enviando localização do usuário para busca de partidas:', locationParam);
            }
          } catch (error) {
            console.error('Erro ao processar localização salva:', error);
          }
        }
        
        console.log(`Buscando lista de partidas${locationParam ? ' com localização' : ''}`);
        
        // Corrigir para usar fetch diretamente ou modificar como usamos fetchWithTimeout
        const response = await fetch(`${API_URL}/matches${locationParam}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const matchesData = await handleResponse(response);
        
        console.log(`${matchesData.length} partidas encontradas`);
        
        // Processar cada partida para garantir que tenha as propriedades necessárias
        const processedMatches = matchesData.map((match: any) => {
          // Extrair coordenadas da localização se existirem no formato "lat,lng"
          if (match.location && typeof match.location === 'string') {
            // Verificar vários formatos de coordenadas
            const coordPatterns = [
              /\(?(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)?/,                  // Formato básico: 12.345, -67.890
              /\(?(-?\d+\.?\d*)[,;]\s*(-?\d+\.?\d*)\)?/,               // Com separador vírgula ou ponto e vírgula
              /latitude\s*[=:]\s*(-?\d+\.?\d*).*longitude\s*[=:]\s*(-?\d+\.?\d*)/i, // Formato com rótulos
              /lat\s*[=:]\s*(-?\d+\.?\d*).*lng\s*[=:]\s*(-?\d+\.?\d*)/i            // Formato abreviado
            ];
            
            // Tentar extrair coordenadas usando os padrões
            for (const pattern of coordPatterns) {
              const match2 = match.location.match(pattern);
              if (match2 && match2.length >= 3) {
                const lat = parseFloat(match2[1]);
                const lng = parseFloat(match2[2]);
                
                if (!isNaN(lat) && !isNaN(lng) && 
                    lat >= -90 && lat <= 90 && 
                    lng >= -180 && lng <= 180) {
                  match.latitude = lat;
                  match.longitude = lng;
                  break;
                }
              }
            }
          }
          
          // Se a API já enviou latitude e longitude diretamente, usar esses valores
          // caso contrário, manter os que encontramos ou deixar indefinido
          match.latitude = match.latitude || match.location?.latitude;
          match.longitude = match.longitude || match.location?.longitude;
          
          // Se temos coordenadas do usuário e da partida, calcular a distância
          if (userLocationStr && match.latitude && match.longitude) {
            const userLocation = JSON.parse(userLocationStr);
            match.distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              match.latitude,
              match.longitude
            );
          }
          
          return match;
        });
        
        return processedMatches;
      } catch (error) {
        console.error('Erro ao buscar lista de partidas:', error);
        throw error;
      }
    },
    join: async (matchId: number) => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (!userId) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetchWithTimeout(
          `${API_URL}/matches/${matchId}/join`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
          }
        );
        
        return response;
      } catch (error) {
        console.error(`Erro ao entrar na partida ${matchId}:`, error);
        throw new Error('Não foi possível entrar na partida. Tente novamente mais tarde.');
      }
    },
    joinWithTeam: async (matchId: number, teamId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Enviando requisição para entrar na partida ${matchId} com o time ${teamId}:`, {
        url: `${API_URL}/matches/${matchId}/join-team`,
        token: token ? 'Token presente' : 'Token ausente'
      });

      const response = await fetch(`${API_URL}/matches/${matchId}/join-team`, {
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

      console.log(`Buscando detalhes da partida ${matchId}`);

      // Verificar se devemos simular um erro para testes
      if (simulateError(matchId)) {
        console.warn(`[SIMULAÇÃO] Erro simulado para a partida ${matchId}`);
        return {
          id: matchId,
          title: `Partida ${matchId} (Simulação de Erro)`,
          date: new Date().toISOString(),
          location: 'Local Simulado',
          maxPlayers: 10,
          status: 'open',
          organizerId: 1,
          _hasPlayerLoadError: true,
          players: []
        };
      }

      // Verificar se temos dados válidos em cache
      const cachedData = getCachedMatch(matchId);
      if (cachedData) {
        console.log(`Usando dados em cache para partida ${matchId}`);
        return cachedData;
      }

      // Contagem de tentativas para esta chamada
      let retryCount = 0;
      const maxRetries = 2;

      const tryFetchMatch = async () => {
        try {
          // Solicitar explicitamente inclusão de jogadores e times
          const match = await fetchWithTimeout(
            `${API_URL}/matches/${matchId}?includeAllPlayers=true&includeTotalCounts=true`,
            { method: 'GET' },
            8000 // Timeout maior para garantir que temos tempo para buscar todos os detalhes
          );
          
          // Verificar se os jogadores foram carregados corretamente
          if (!match.players || !Array.isArray(match.players)) {
            // Se não temos jogadores, tentar buscar apenas os jogadores
            try {
              const playersData = await fetchWithTimeout(
                `${API_URL}/matches/${matchId}/players`,
                { method: 'GET' },
                5000
              );
              
              // Adicionar jogadores ao objeto match
              match.players = playersData || [];
            } catch (playerError) {
              // Marcar que tivemos um erro ao carregar jogadores
              match._hasPlayerLoadError = true;
              match.players = [];
            }
          }
          
          return match;
        } catch (error) {
          console.error(`Erro ao buscar detalhes da partida ${matchId}:`, error);
          return {
            id: matchId,
            title: 'Erro ao carregar partida',
            players: [],
            _hasPlayerLoadError: true
          };
        }
      };

      return tryFetchMatch();
    },
    leave: async (matchId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`${API_URL}/matches/${matchId}/leave`, {
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
        const allTeamsResponse = await fetch(`${API_URL}/teams`, {
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

      const response = await fetch(`${API_URL}/teams`, {
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

      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response); 
    },
  },
  championships: {
    list: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/championships`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
    },
    create: async (champData: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/championships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(champData)
      });
      return handleResponse(response);
    },
    getById: async (champId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Buscando detalhes do campeonato ${champId}`);
      const response = await fetch(`${API_URL}/championships/${champId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    update: async (champId: number, champData: any) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Atualizando campeonato ${champId}`);
      const response = await fetch(`${API_URL}/championships/${champId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(champData)
      });
      return handleResponse(response);
    },
    delete: async (champId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Excluindo campeonato ${champId}`);
      const response = await fetch(`${API_URL}/championships/${champId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    join: async (champId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Entrando no campeonato ${champId}`);
      const response = await fetch(`${API_URL}/championships/${champId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    joinWithTeam: async (champId: number, teamId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Entrando no campeonato ${champId} com o time ${teamId}`);
      const response = await fetch(`${API_URL}/championships/${champId}/join-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamId })
      });
      return handleResponse(response);
    },
    leave: async (champId: number) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Saindo do campeonato ${champId}`);
      const response = await fetch(`${API_URL}/championships/${champId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    }
  },
};

function calculatePlayerStats(match: any) {
  if (match.playerStats && typeof match.playerStats === 'object') {
    console.log(`Usando estatísticas de jogadores existentes para partida ${match.id}`);
    return;
  }
  
  // Se não, calcular com base nos jogadores
  if (!match.players || !Array.isArray(match.players)) {
    console.warn(`Não é possível calcular estatísticas: jogadores inválidos para partida ${match.id}`);
    match.playerStats = {
      totalIndividualPlayers: 0,
      totalTeams: 0,
      totalTeamPlayers: 0,
      totalPlayers: 0,
      isEmpty: true
    };
    return;
  }
  
  // Contar jogadores individuais e times
  const individualPlayers = match.players.filter((p: any) => !p.isTeam);
  const teams = match.players.filter((p: any) => p.isTeam);
  
  // Calcular jogadores em times
  const teamPlayers = teams.reduce((acc: number, team: any) => 
    acc + (parseInt(team?.playerCount, 10) || 1), 0);
  
  match.playerStats = {
    totalIndividualPlayers: individualPlayers.length,
    totalTeams: teams.length,
    totalTeamPlayers: teamPlayers,
    totalPlayers: individualPlayers.length + teamPlayers,
    isEmpty: match.players.length === 0
  };
  
  console.log(`Estatísticas calculadas para partida ${match.id}:`, match.playerStats);
}

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}