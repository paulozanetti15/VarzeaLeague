import { request } from './apiBase';

export interface FriendlyMatchData {
  title: string;
  description?: string;
  date: string;
  location: string;
  duration?: string;
  price?: number;
  matchType: string;
  square: string;
}

export interface TeamJoinData {
  teamId: number;
}

export interface MatchEvaluationData {
  rating: number;
  comment?: string;
}

export async function createFriendlyMatch(matchData: FriendlyMatchData) {
  return request('/friendly-matches', 'POST', matchData);
}

export async function getFriendlyMatches(filters?: Record<string, string>) {
  const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';
  return request(`/friendly-matches${params}`, 'GET');
}

export async function getFriendlyMatchById(matchId: number) {
  return request(`/friendly-matches/${matchId}`, 'GET');
}

export async function updateFriendlyMatch(matchId: number, matchData: Partial<FriendlyMatchData>) {
  return request(`/friendly-matches/${matchId}`, 'PUT', matchData);
}

export async function deleteFriendlyMatch(matchId: number) {
  return request(`/friendly-matches/${matchId}`, 'DELETE');
}

export async function joinFriendlyMatchTeam(matchId: number, teamData: TeamJoinData) {
  return request(`/friendly-matches/${matchId}/teams`, 'POST', teamData);
}

export async function getFriendlyMatchTeams(matchId: number) {
  return request(`/friendly-matches/${matchId}/teams`, 'GET');
}

export async function leaveFriendlyMatchTeam(matchId: number, teamId: number) {
  return request(`/friendly-matches/${matchId}/teams/${teamId}`, 'DELETE');
}

export async function finalizeFriendlyMatch(matchId: number) {
  return request(`/friendly-matches/${matchId}/finalize`, 'PUT');
}

export async function getFriendlyMatchEvaluations(matchId: number) {
  return request(`/friendly-matches/${matchId}/evaluations`, 'GET');
}

export async function createFriendlyMatchEvaluation(matchId: number, evaluationData: MatchEvaluationData) {
  return request(`/friendly-matches/${matchId}/evaluations`, 'POST', evaluationData);
}

export async function updateFriendlyMatchEvaluation(matchId: number, evaluationData: MatchEvaluationData) {
  return request(`/friendly-matches/${matchId}/evaluations`, 'PUT', evaluationData);
}

export async function getFriendlyMatchEvaluationSummary(matchId: number) {
  return request(`/friendly-matches/${matchId}/evaluations/summary`, 'GET');
}

export const createMatch = createFriendlyMatch;
