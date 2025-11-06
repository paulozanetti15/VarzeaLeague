import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../config/api';

export type MonthCount = { month: string; count: number };
export type CardsByMonth = { month: string; yellow: number; red: number };
export type StatusCount = { status: string; count: number };
export type MatchListItem = { id: number | string; title?: string; date?: string; location?: string; status?: string };

export interface OverviewData {
  kpis: {
    totalMatches: number;
    upcomingMatches: number;
    pastMatches: number;
    totalTeams: number;
    totalPlayers: number;
    totalGoals: number;
    totalCards: number;
  };
  matchesByMonth: MonthCount[];
  goalsByMonth: MonthCount[];
  cardsByMonth: CardsByMonth[];
  statusBreakdown: StatusCount[];
  nextMatches: MatchListItem[];
  recentMatches: MatchListItem[];
}

export const useDashboardStore = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (signal?: AbortSignal) => {
    setLoadingOverview(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/overview`, { signal });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setOverview(data as OverviewData);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Erro buscando overview:', err);
      setError(err?.message || 'Falha ao carregar overview');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  return { overview, loadingOverview, error, fetchOverview };
};
