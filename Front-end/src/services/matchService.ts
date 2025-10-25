import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Match {
  id: number;
  title: string;
  date: string;
  location: string;
  maxPlayers: number;
  description: string;
  price: number | null;
  status: string;
  duration: string;
  organizerId: number;
  organizer?: {
    id: number;
    name: string;
  };
  modalidade?: string;
  nomequadra?: string;
}

export interface MatchFilters {
  status?: string;
  modalidade?: string;
  date?: string;
  price?: string;
}

class MatchService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  private getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`
    };
  }

  async fetchMatches(token: string, filters?: MatchFilters): Promise<Match[]> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const url = `/matches${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.api.get(url, {
        headers: this.getAuthHeaders(token)
      });

      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      throw error;
    }
  }

  async fetchMatchById(id: number, token: string): Promise<Match> {
    try {
      const response = await this.api.get(`/matches/${id}`, {
        headers: this.getAuthHeaders(token)
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar partida:', error);
      throw error;
    }
  }

  async loadPlayersForMatch(matchId: number, token: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/matches/${matchId}/players`, {
        headers: this.getAuthHeaders(token)
      });

      return response.data?.players || [];
    } catch (error) {
      console.error('Erro ao carregar jogadores da partida:', error);
      return [];
    }
  }
}

export const matchService = new MatchService();