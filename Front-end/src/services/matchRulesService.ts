import axios from 'axios';
import { createMatch } from './matchesFriendlyServices';

import { API_BASE } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

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
   * Cria regras para uma partida
   */
  async createRules(rulesData: MatchRulesData) {
    try {
      const response = await axios.post(`${API_BASE}/rules`, rulesData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar regras:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova partida
   */
  async createMatch(matchData: MatchData) {
    try {
      const matchPayload = {
        title: matchData.title,
        description: matchData.description || '',
        location: matchData.location,
        date: matchData.date,
        time: '00:00', // valor padrão
        duration: '90', // valor padrão
        price: '0', // valor padrão
        modalidade: matchData.modalidade,
        quadra: matchData.quadraNome,
        organizerId: matchData.userId.toString()
      };
      const response = await createMatch(matchPayload);
      return response;
    } catch (error) {
      console.error('Erro ao criar partida:', error);
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
      const response = await axios.get(`${API_BASE}/rules/match/${matchId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
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
      const response = await axios.put(`${API_BASE}/rules/${rulesId}`, rulesData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
      });
      return response.data;
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
      const response = await axios.delete(`${API_BASE}/rules/${rulesId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao remover regras ${rulesId}:`, error);
      throw error;
    }
  }
}

export const matchRulesService = new MatchRulesService();