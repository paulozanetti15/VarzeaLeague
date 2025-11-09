import { request } from './apiBase';

export interface PlayerRanking {
  playerId: number;
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

class RankingService {
  async getPlayerRanking() {
    return request<PlayerRanking[]>('/ranking/players', 'GET');
  }
}

export const rankingService = new RankingService();

export async function getPlayerRanking() {
  return rankingService.getPlayerRanking();
}

export default rankingService;
