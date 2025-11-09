import { useState, useCallback } from "react";
import { getUserTeams, getTeamPlayers, getTeamPlayerStats } from "../services/teams.service";
import type { Team, Player, PlayerStats } from '../interfaces/team';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [teamPlayers, setTeamPlayers] = useState<Record<string, Player[]>>({});
  const [loadingPlayers, setLoadingPlayers] = useState<Record<string, boolean>>({});

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('useTeams.fetchTeams error', e);
      setError(e?.message || 'Erro ao carregar times');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamPlayers = useCallback(async (teamId: string | number) => {
    const key = String(teamId);
    setLoadingPlayers(prev => ({ ...prev, [key]: true }));
    try {
      const data = await getTeamPlayers(Number(teamId));
      setTeamPlayers(prev => ({ ...prev, [key]: data }));
    } catch (e) {
      console.error('useTeams.fetchTeamPlayers error', e);
    } finally {
      setLoadingPlayers(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const fetchTeamPlayerStats = useCallback(async (teamId: number) => {
    try {
      const data = await getTeamPlayerStats(teamId);
      return data as { stats?: PlayerStats[] };
    } catch (e) {
      console.error('useTeams.fetchTeamPlayerStats', e);
      return { stats: [] };
    }
  }, []);

  return {
    teams,
    loading,
    error,
    teamPlayers,
    loadingPlayers,
    fetchTeams,
    fetchTeamPlayers,
    fetchTeamPlayerStats,
    setTeams,
  };
}

export default useTeams;
