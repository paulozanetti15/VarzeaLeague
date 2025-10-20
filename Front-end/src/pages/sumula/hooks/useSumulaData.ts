import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Team } from '../../../components/features/sumula/types';
import type { Player } from '../../../components/features/sumula/types';
import type { SumulaData } from '../../../components/features/sumula/types';

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
        ? `http://localhost:3001/api/championships/${matchId}/join-team`
        : `http://localhost:3001/api/matches/${matchId}/join-team`;

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

      const endpoint = isChampionship
        ? `http://localhost:3001/api/championships/${matchId}/roster-players`
        : `http://localhost:3001/api/matches/${matchId}/roster-players`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setPlayers(response.data.players || []);
      }
    } catch (err) {
      setPlayers([]);
    }
  }, []);

  const fetchMatchDetails = useCallback(async (matchId: number, isChampionship = false): Promise<SumulaData | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const matchEndpoint = isChampionship
        ? `http://localhost:3001/api/championships/${matchId}`
        : `http://localhost:3001/api/matches/${matchId}`;

      const matchResponse = await axios.get(matchEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (matchResponse.status !== 200) return null;

      const matchData = matchResponse.data;

      const sumulaEndpoint = isChampionship
        ? `http://localhost:3001/api/historico/sumula-campeonato/${matchId}`
        : `http://localhost:3001/api/historico/sumula/${matchId}`;

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
            team: goal.teamName || 'Time não identificado',
            minute: goal.minute || 0,
            playerId: goal.playerId || 0,
            teamId: goal.teamId || 0
          }));
          cards = (sumula.cards || []).map((card: any) => ({
            player: card.playerName || '',
            team: card.teamName || 'Time não identificado',
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
        team_home_score: data.homeScore,
        team_away_score: data.awayScore,
      };

      const endpoint = isChampionship
        ? 'http://localhost:3001/api/historico/adicionar-sumula-campeonato'
        : 'http://localhost:3001/api/historico/adicionar-sumula';

      const response = await axios.post(endpoint, sumula, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        const goalsEndpoint = isChampionship
          ? `http://localhost:3001/api/championships/${data.matchId}/goals`
          : `http://localhost:3001/api/matches/${data.matchId}/goals`;

        await Promise.all(data.goals.map(goal => 
          axios.post(goalsEndpoint, {
            playerId: goal.playerId,
            minute: goal.minute
          }, { headers: { Authorization: `Bearer ${token}` } })
        ));

        const cardsEndpoint = isChampionship
          ? `http://localhost:3001/api/championships/${data.matchId}/cards`
          : `http://localhost:3001/api/matches/${data.matchId}/cards`;

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
        team_home_score: data.homeScore,
        team_away_score: data.awayScore,
      };

      const endpoint = isChampionship
        ? `http://localhost:3001/api/historico/sumula-campeonato/${data.matchId}`
        : `http://localhost:3001/api/historico/sumula/${data.matchId}`;

      const response = await axios.put(endpoint, sumula, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const goalsEndpoint = isChampionship
          ? `http://localhost:3001/api/championships/${data.matchId}/goals`
          : `http://localhost:3001/api/matches/${data.matchId}/goals`;

        await Promise.all(data.goals.map(goal => 
          axios.post(goalsEndpoint, {
            playerId: goal.playerId,
            minute: goal.minute
          }, { headers: { Authorization: `Bearer ${token}` } })
        ));

        const cardsEndpoint = isChampionship
          ? `http://localhost:3001/api/championships/${data.matchId}/cards`
          : `http://localhost:3001/api/matches/${data.matchId}/cards`;

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
        ? `http://localhost:3001/api/historico/sumula-campeonato/${matchId}`
        : `http://localhost:3001/api/historico/sumula/${matchId}`;

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
