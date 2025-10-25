export interface Team {
  id: number;
  name: string;
}

export interface Player {
  playerId: number;
  nome: string;
  teamId: number;
}

export interface Goal {
  player: string;
  minute: number;
  team: string;
  playerId?: number;
  teamId?: number;
}

export interface Card {
  player: string;
  team: string;
  type: 'Amarelo' | 'Vermelho';
  minute: number;
  playerId?: number;
  teamId?: number;
}

export interface SumulaData {
  matchId: number;
  homeTeam: number;
  awayTeam: number;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  goals: Goal[];
  cards: Card[];
  matchDate?: string;
  matchLocation?: string;
}

export interface MatchReport {
  match_id: number;
  team_home: number;
  team_away: number;
  team_home_score: number;
  team_away_score: number;
}
