export interface Player {
  id: string;
  nome: string;
  sexo: string;
  ano: string;
  posicao: string;
  dateOfBirth?: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  playerCount?: number;
  matchCount?: number;
  ownerId?: number;
  isCurrentUserCaptain?: boolean;
  banner?: string;
  createdAt?: string;
  players?: Player[];
  primaryColor?: string;
  secondaryColor?: string;
  estado?: string;
  cidade?: string;
}

export interface PlayerStats {
  playerId?: number | string;
  nome?: string;
  posicao?: string;
  sexo?: string;
  gols?: number;
  amarelos?: number;
  vermelhos?: number;
}

export default Team;
