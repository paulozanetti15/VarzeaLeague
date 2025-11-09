import { request } from './apiBase';
import { createMatch } from './matchesFriendlyServices';

export interface MatchRulesData {
  matchId: number;
  registrationDeadline: string;
  registrationDeadlineTime?: string;
  minimumAge: number;
  maximumAge: number;
  gender: string;
}

export interface MatchData {
  title: string;
  date: string;
  time?: string;
  duration?: number;
  price?: string;
  location: string;
  number?: string;
  complement?: string;
  Cep?: string;
  Uf?: string;
  description?: string;
  matchType?: string;
  square?: string;
  genero?: string;
  userId: number;
}

class MatchRulesService {
  async createRules(rulesData: MatchRulesData) {
    return request('/match-rules', 'POST', rulesData);
  }

  async createMatch(matchData: MatchData) {
    const matchPayload = {
      title: matchData.title,
      description: matchData.description || '',
      location: matchData.location,
      number: matchData.number,
      complement: matchData.complement,
      date: matchData.date,
      time: matchData.time || '00:00',
      duration: matchData.duration || 90,
      price: matchData.price || '0',
      matchType: matchData.matchType,
      square: matchData.square,
      Cep: matchData.Cep,
      Uf: matchData.Uf,
      organizerId: matchData.userId.toString()
    };
    return createMatch(matchPayload);
  }

  async createMatchWithRules(matchData: MatchData, rulesData: Omit<MatchRulesData, 'matchId'>) {
    const matchResponse = await this.createMatch(matchData);

    if (matchResponse && matchResponse.id) {
      const completeRulesData: MatchRulesData = {
        ...rulesData,
        matchId: matchResponse.id
      };

      const rulesResponse = await this.createRules(completeRulesData);

      return {
        match: matchResponse,
        rules: rulesResponse
      };
    } else {
      throw new Error('Falha ao obter ID da partida criada');
    }
  }

  async getRulesByMatchId(matchId: number) {
    return request(`/match-rules/${matchId}`, 'GET');
  }

  async updateRules(matchId: number, rulesData: Partial<Omit<MatchRulesData, 'matchId'>>) {
    return request(`/match-rules/${matchId}`, 'PUT', rulesData);
  }

  async deleteRules(matchId: number) {
    return request(`/match-rules/${matchId}`, 'DELETE');
  }
}

export const matchRulesService = new MatchRulesService();