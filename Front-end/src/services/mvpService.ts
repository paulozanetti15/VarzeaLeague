import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface FinishedMatch {
  id: number;
  title: string;
  date: string;
  location: string;
  modalidade?: string;
  nomequadra?: string;
}

class MvpService {
  private api = axios.create({ baseURL: API_BASE_URL });

  async listFinished(): Promise<FinishedMatch[]> {
    const resp = await this.api.get('/matches/status/finished/list');
    return Array.isArray(resp.data) ? resp.data : [];
    
  }

  async listPlayers(matchId: number): Promise<Array<{ playerId: number; nome: string; posicao: string; sexo: string; teamId: number }>> {
    const resp = await this.api.get(`/matches/${matchId}/players`);
    return resp.data?.players || [];
  }

  async getSummary(matchId: number): Promise<{ votes: Array<{ playerId: number; votes: number }>; leader: { playerId: number; votes: number } | null }>{
    const resp = await this.api.get(`/matches/${matchId}/mvp-votes/summary`);
    return resp.data;
  }

  async vote(matchId: number, playerId: number) {
    const resp = await this.api.post(`/matches/${matchId}/mvp-votes`, { playerId });
    return resp.data;
  }
}

export const mvpService = new MvpService();
