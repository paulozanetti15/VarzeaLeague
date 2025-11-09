import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import type { Team } from '../../../features/sumula/types';
import type { Player } from '../../../features/sumula/types';
import type { SumulaData } from '../../../features/sumula/types';

interface UseSumulaDataReturn {
  teams: Team[];
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchTeams: (matchId: number, isChampionship?: boolean) => Promise<void>;
  fetchPlayers: (matchId: number, isChampionship?: boolean) => Promise<void>;
  fetchMatchDetails: (matchId: number, isChampionship?: boolean) => Promise<SumulaData | null>;
  saveSumula: (data: SumulaData, isChampionship?: boolean) => Promise<boolean>;
  updateSumula: (data: SumulaData, isChampionship?: boolean) => Promise<boolean>;
  deleteSumula: (matchId: number, isChampionship?: boolean) => Promise<boolean>;
  setError: (error: string | null) => void;
}

export const useSumulaData = (): UseSumulaDataReturn => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async (matchId: number, isChampionship = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return;
      }

      const endpoint = isChampionship 
        ? `${API_BASE_URL}/championships/${matchId}/teams`
        : `${API_BASE_URL}/friendly-matches/${matchId}/teams`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeams(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar times.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlayers = useCallback(async (matchId: number, isChampionship = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const teamsEndpoint = isChampionship
        ? `${API_BASE_URL}/championships/${matchId}/teams`
        : `${API_BASE_URL}/friendly-matches/${matchId}/teams`;

      const teamsResponse = await axios.get(teamsEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (teamsResponse.status !== 200) {
        setPlayers([]);
        return;
      }

      const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
      
      if (teams.length === 0) {
        setPlayers([]);
        return;
      }

      const allPlayers: any[] = [];

      for (const team of teams) {
        try {
          const playersResponse = await axios.get(`${API_BASE_URL}/players/team/${team.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (playersResponse.status === 200 && Array.isArray(playersResponse.data)) {
            const teamPlayers = playersResponse.data.map((player: any) => ({
              playerId: player.id,
              nome: player.name || player.nome,
              teamId: team.id,
              posicao: player.position || player.posicao,
              sexo: player.gender || player.sexo
            }));
            allPlayers.push(...teamPlayers);
          }
        } catch (err) {
          console.error(`Erro ao buscar jogadores do time ${team.id}:`, err);
        }
      }

      console.log('Jogadores carregados:', allPlayers);
      setPlayers(allPlayers);
    } catch (err) {
      console.error('Erro ao buscar jogadores:', err);
      setPlayers([]);
    }
  }, []);

  const fetchMatchDetails = useCallback(async (matchId: number, isChampionship = false): Promise<SumulaData | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const matchEndpoint = isChampionship
        ? `${API_BASE_URL}/championships/${matchId}`
        : `${API_BASE_URL}/friendly-matches/${matchId}`;

      const matchResponse = await axios.get(matchEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (matchResponse.status !== 200) return null;

      const matchData = matchResponse.data;

      const sumulaEndpoint = isChampionship
        ? `${API_BASE_URL}/championship-reports/${matchId}`
        : `${API_BASE_URL}/friendly-match-reports/${matchId}`;

      let homeTeam = 0;
      let awayTeam = 0;
      let homeTeamName = '';
      let awayTeamName = '';
      let homeScore = 0;
      let awayScore = 0;
      let goals: any[] = [];
      let cards: any[] = [];
      let isPenalty = false;

      try {
        const sumulaResponse = await axios.get(sumulaEndpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (sumulaResponse.status === 200 && sumulaResponse.data) {
          const sumula = sumulaResponse.data;
          homeTeam = sumula.team_home || sumula.homeTeam || 0;
          awayTeam = sumula.team_away || sumula.awayTeam || 0;
          homeTeamName = sumula.homeTeamName || '';
          awayTeamName = sumula.awayTeamName || '';
          homeScore = sumula.team_home_score || sumula.homeScore || 0;
          awayScore = sumula.team_away_score || sumula.awayScore || 0;
          isPenalty = sumula.is_penalty || false;
          goals = (sumula.goals || []).map((goal: any) => ({
            player: goal.playerName || '',
            playerName: goal.playerName || '',
            team: goal.teamName || 'Time não identificado',
            teamName: goal.teamName || 'Time não identificado',
            minute: goal.minute || 0,
            playerId: goal.playerId || 0,
            teamId: goal.teamId || 0
          }));
          cards = (sumula.cards || []).map((card: any) => ({
            player: card.playerName || '',
            playerName: card.playerName || '',
            team: card.teamName || 'Time não identificado',
            teamName: card.teamName || 'Time não identificado',
            type: card.type || '',
            minute: card.minute || 0,
            playerId: card.playerId || 0,
            teamId: card.teamId || 0
          }));
        }
      } catch (sumulaError) {
        console.log('Súmula não encontrada, retornando dados básicos da partida');
      }

      return {
        matchId,
        homeTeam,
        awayTeam,
        homeTeamName,
        awayTeamName,
        homeScore,
        awayScore,
        goals,
        cards,
        matchDate: matchData.date ? new Date(matchData.date).toLocaleDateString('pt-BR') : '',
        matchLocation: matchData.location || matchData.nomequadra || 'Local não informado',
        isPenalty
      };
    } catch (err) {
      console.error('Erro ao buscar detalhes da partida:', err);
      return null;
    }
  }, []);

  const saveSumula = useCallback(async (data: SumulaData, isChampionship = false): Promise<boolean> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return false;
      }

      const sumula = {
        match_id: data.matchId,
        team_home: data.homeTeam,
        team_away: data.awayTeam,
        teamHome_score: data.homeScore ?? 0,
        teamAway_score: data.awayScore ?? 0,
      };

      const endpoint = isChampionship
        ? `${API_BASE_URL}/championship-reports`
        : `${API_BASE_URL}/friendly-match-reports`;

      const response = await axios.post(endpoint, sumula, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        const goalsEndpoint = isChampionship
          ? `${API_BASE_URL}/championship-reports/${data.matchId}/events/goals`
          : `${API_BASE_URL}/friendly-match-reports/${data.matchId}/events/goals`;

        const cardsEndpoint = isChampionship
          ? `${API_BASE_URL}/championship-reports/${data.matchId}/events/cards`
          : `${API_BASE_URL}/friendly-match-reports/${data.matchId}/events/cards`;

        // Remover todos os goals existentes
        try {
          await axios.delete(`${goalsEndpoint}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
          // Ignorar erro se não houver goals para remover
        }

        // Remover todos os cards existentes
        try {
          await axios.delete(`${cardsEndpoint}`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
          // Ignorar erro se não houver cards para remover
        }

        // Adicionar novos goals
        await Promise.all(data.goals.map(goal => 
          axios.post(goalsEndpoint, {
            playerId: goal.playerId,
            minute: goal.minute
          }, { headers: { Authorization: `Bearer ${token}` } })
        ));

        // Adicionar novos cards
        await Promise.all(data.cards.map(card =>
          axios.post(cardsEndpoint, {
            playerId: card.playerId,
            cardType: card.type.toLowerCase() === 'amarelo' ? 'yellow' : 'red',
            minute: card.minute
          }, { headers: { Authorization: `Bearer ${token}` } })
        ));

        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Erro ao salvar súmula:', err);
      console.error('Resposta de erro:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao salvar súmula.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSumula = useCallback(async (data: SumulaData, isChampionship = false): Promise<boolean> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return false;
      }

      const sumula = {
        match_id: data.matchId,
        team_home: data.homeTeam,
        team_away: data.awayTeam,
        teamHome_score: data.homeScore ?? 0,
        teamAway_score: data.awayScore ?? 0,
      };

      const endpoint = isChampionship
        ? `${API_BASE_URL}/championship-reports/${data.matchId}`
        : `${API_BASE_URL}/friendly-match-reports/${data.matchId}`;

      const response = await axios.put(endpoint, sumula, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const goalsEndpoint = isChampionship
          ? `${API_BASE_URL}/championship-reports/${data.matchId}/events/goals`
          : `${API_BASE_URL}/friendly-match-reports/${data.matchId}/events/goals`;

        await Promise.all(data.goals.map(goal => 
          axios.post(goalsEndpoint, {
            playerId: goal.playerId,
            minute: goal.minute
          }, { headers: { Authorization: `Bearer ${token}` } })
        ));

        const cardsEndpoint = isChampionship
          ? `${API_BASE_URL}/championship-reports/${data.matchId}/events/cards`
          : `${API_BASE_URL}/friendly-match-reports/${data.matchId}/events/cards`;

        await Promise.all(data.cards.map(card =>
          axios.post(cardsEndpoint, {
            playerId: card.playerId,
            cardType: card.type.toLowerCase() === 'amarelo' ? 'yellow' : 'red',
            minute: card.minute
          }, { headers: { Authorization: `Bearer ${token}` } })
        ));

        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar súmula.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSumula = useCallback(async (matchId: number, isChampionship = false): Promise<boolean> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token de autorização não encontrado.');
        return false;
      }

      const endpoint = isChampionship
        ? `${API_BASE_URL}/championship-reports/${matchId}`
        : `${API_BASE_URL}/friendly-match-reports/${matchId}`;

      const response = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao deletar súmula.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    teams,
    players,
    loading,
    error,
    fetchTeams,
    fetchPlayers,
    fetchMatchDetails,
    saveSumula,
    updateSumula,
    deleteSumula,
    setError
  };
};
