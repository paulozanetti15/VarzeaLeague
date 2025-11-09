import { request } from './apiBase';

interface PunicaoData {
  idTeam: number;
  reason: string;
  team_home: number;
  team_away: number;
}

interface PunicaoCampeonatoData {
  match_championship_id: number;
  team_id: number;
  reason: string;
  team_home: number;
  team_away: number;
}

export const punicaoService = {
  friendlyMatches: {
    get: (matchId: number) => 
      request(`/punishments/friendly-matches/${matchId}`, 'GET'),

    create: (matchId: number, data: PunicaoData) => 
      request(`/punishments/friendly-matches/${matchId}`, 'POST', data),

    update: (matchId: number, data: Partial<PunicaoData>) => 
      request(`/punishments/friendly-matches/${matchId}`, 'PUT', data),

    delete: (matchId: number) => 
      request(`/punishments/friendly-matches/${matchId}`, 'DELETE')
  },

  championships: {
    get: (champId: number, matchId: number) => 
      request(`/punishments/championships/${champId}/match/${matchId}`, 'GET'),

    create: (champId: number, data: PunicaoCampeonatoData) => 
      request(`/punishments/championships/${champId}`, 'POST', data),

    update: (champId: number, matchId: number, data: Partial<PunicaoCampeonatoData>) => 
      request(`/punishments/championships/${champId}/match/${matchId}`, 'PUT', data),

    delete: (champId: number, matchId: number) => 
      request(`/punishments/championships/${champId}/match/${matchId}`, 'DELETE')
  }
};
