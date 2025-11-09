import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../config/api';

export type MonthCount = { month: string; count: number };
export type StatusCount = { status: string; count: number };
export type MatchListItem = { id: number | string; title?: string; date?: string; location?: string; status?: string };

export interface OverviewData {
  kpis: {
    amistososPeriodo: number;
    campeonatosPeriodo: number;
    inscricoesAmistososPeriodo: number;
    inscricoesCampeonatosPeriodo: number;
    cancelledMatches: number;
    completedMatches: number;
    championshipsInProgress: number;
    newUsers: number;
    totalUsers: number;
    totalTeams: number;
    totalPlayers: number;
  };
  matchesByMonth: MonthCount[];
  applicationsByMonth: MonthCount[];
  teamsByMonth: MonthCount[];
  championshipsByMonth: MonthCount[];
  matchRegistrationsByMonth: MonthCount[];
  statusBreakdown: StatusCount[];
  championshipStatusBreakdown: StatusCount[];
}

export const useDashboardStore = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (signal?: AbortSignal, queryParams?: string) => {
    setLoadingOverview(true);
    setError(null);
    try {
  const url = queryParams ? `${API_BASE_URL}/overview?${queryParams}` : `${API_BASE_URL}/overview`;
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { signal, headers });
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
