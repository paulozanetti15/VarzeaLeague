import { api } from './api';

export interface MatchRulesData {
  userId: number;
  partidaId: number;
  dataLimite: string;
  idadeMinima: number;
  idadeMaxima: number;
  genero: string;
}

export interface MatchData {
  title: string;
  date: string;
  location: string;
  maxPlayers: number;
  description?: string;
  modalidade?: string;
  quadraNome?: string;
  genero?: string;
  userId: number;
}

class MatchRulesService {
  /**
   * Cria uma nova partida
   */
  async createMatch(matchData: MatchData) {
    try {
      const response = await api.matches.create(matchData);
      return response;
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      throw error;
    }
  }

  /**
   * Cria regras para uma partida
   */
  async createRules(rulesData: MatchRulesData) {
    try {
      const response = await api.post('/rules/', rulesData);
      return response;
    } catch (error) {
      console.error('Erro ao criar regras:', error);
      throw error;
    }
  }

  /**
   * Cria partida e regras em sequência
   */
  async createMatchWithRules(matchData: MatchData, rulesData: Omit<MatchRulesData, 'partidaId'>) {
    try {
      // Primeiro cria a partida
      const matchResponse = await this.createMatch(matchData);

      if (matchResponse && matchResponse.id) {
        // Depois cria as regras com o ID da partida
        const completeRulesData: MatchRulesData = {
          ...rulesData,
          partidaId: matchResponse.id
        };

        const rulesResponse = await this.createRules(completeRulesData);

        return {
          match: matchResponse,
          rules: rulesResponse
        };
      } else {
        throw new Error('Falha ao obter ID da partida criada');
      }
    } catch (error) {
      console.error('Erro ao criar partida com regras:', error);
      throw error;
    }
  }

  /**
   * Busca regras de uma partida específica
   */
  async getRulesByMatchId(matchId: number) {
    try {
      const response = await api.get(`/rules/match/${matchId}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar regras da partida ${matchId}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza regras de uma partida
   */
  async updateRules(rulesId: number, rulesData: Partial<MatchRulesData>) {
    try {
      const response = await api.put(`/rules/${rulesId}`, rulesData);
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar regras ${rulesId}:`, error);
      throw error;
    }
  }

  /**
   * Remove regras de uma partida
   */
  async deleteRules(rulesId: number) {
    try {
      const response = await api.delete(`/rules/${rulesId}`);
      return response;
    } catch (error) {
      console.error(`Erro ao remover regras ${rulesId}:`, error);
      throw error;
    }
  }
}

export const matchRulesService = new MatchRulesService();