import { request } from './apiBase';

export interface PlayerData {
  nome: string;
  gender: 'Masculino' | 'Feminino';
  ano: number;
  posicao?: string;
}

export interface PlayerUpdateData {
  nome?: string;
  gender?: 'Masculino' | 'Feminino';
  ano?: number;
  posicao?: string;
}

export interface AddPlayerToTeamData {
  playerId: number;
  numero?: number;
}

export interface Player {
  id: number;
  nome: string;
  gender: string;
  ano: number;
  posicao?: string;
  createdAt: string;
  updatedAt: string;
}

class PlayersService {
  async create(playerData: PlayerData) {
    return request<Player>('/players', 'POST', playerData);
  }

  async getByTeam(teamId: number) {
    return request<Player[]>(`/players/team/${teamId}`, 'GET');
  }

  async addToTeam(teamId: number, data: AddPlayerToTeamData) {
    return request(`/players/${teamId}`, 'POST', data);
  }

  async removeFromTeam(teamId: number, playerId: number) {
    return request(`/players/${teamId}/player/${playerId}`, 'DELETE');
  }

  async update(playerId: number, playerData: PlayerUpdateData) {
    return request<Player>(`/players/${playerId}`, 'PUT', playerData);
  }

  async delete(playerId: number) {
    return request(`/players/${playerId}`, 'DELETE');
  }
}

export const playersService = new PlayersService();

export async function createPlayer(playerData: PlayerData) {
  return playersService.create(playerData);
}

export async function getPlayersByTeam(teamId: number) {
  return playersService.getByTeam(teamId);
}

export async function addPlayerToTeam(teamId: number, data: AddPlayerToTeamData) {
  return playersService.addToTeam(teamId, data);
}

export async function removePlayerFromTeam(teamId: number, playerId: number) {
  return playersService.removeFromTeam(teamId, playerId);
}

export async function updatePlayer(playerId: number, playerData: PlayerUpdateData) {
  return playersService.update(playerId, playerData);
}

export async function deletePlayer(playerId: number) {
  return playersService.delete(playerId);
}

export default playersService;
