import axios from 'axios';
import { API_BASE } from '../config/api';

export interface MatchFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  complement: string;
  cep: string;
  UF: string;
  city: string;
  category: string;
  number: string;
  quadra: string;
  modalidade: string;
}

export interface CreateMatchResponse {
  id: string;
  title: string;
  // outros campos da resposta
}

class CreateMatchService {
  private api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`
    };
  }

  async createMatch(matchData: MatchFormData & { organizerId: string }): Promise<CreateMatchResponse> {
    const response = await this.api.post('/matches', matchData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async searchCEP(cep: string): Promise<any> {
    const cepLimpo = cep.replace(/\D/g, '');
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    return response.data;
  }
}

export const createMatchService = new CreateMatchService();