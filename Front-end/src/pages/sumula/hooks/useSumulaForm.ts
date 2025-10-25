import { useState, useCallback, useMemo } from 'react';
import type { Team } from '../../../features/sumula/types';
import type { Player } from '../../../features/sumula/types';
import type { Goal } from '../../../features/sumula/types';
import type { Card } from '../../../features/sumula/types';

interface UseSumulaFormReturn {
  homeTeam: number;
  awayTeam: number;
  homeScore: number;
  awayScore: number;
  goals: Goal[];
  cards: Card[];
  selectedGoalPlayer: string;
  selectedGoalMinute: number;
  selectedCardPlayer: string;
  selectedCardType: 'Amarelo' | 'Vermelho';
  selectedCardMinute: number;
  isFormValid: boolean;
  setHomeTeam: (teamId: number) => void;
  setAwayTeam: (teamId: number) => void;
  setSelectedGoalPlayer: (playerId: string) => void;
  setSelectedGoalMinute: (minute: number) => void;
  setSelectedCardPlayer: (playerId: string) => void;
  setSelectedCardType: (type: 'Amarelo' | 'Vermelho') => void;
  setSelectedCardMinute: (minute: number) => void;
  addGoal: (teams: Team[], players: Player[]) => string | null;
  addCard: (teams: Team[], players: Player[]) => string | null;
  removeGoal: (index: number) => void;
  removeCard: (index: number) => void;
  resetForm: () => void;
  loadExistingData: (homeTeamId: number, awayTeamId: number, goals: Goal[], cards: Card[]) => void;
}

export const useSumulaForm = (): UseSumulaFormReturn => {
  const [homeTeam, setHomeTeam] = useState(0);
  const [awayTeam, setAwayTeam] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState('');
  const [selectedGoalMinute, setSelectedGoalMinute] = useState(0);
  
  const [selectedCardPlayer, setSelectedCardPlayer] = useState('');
  const [selectedCardType, setSelectedCardType] = useState<'Amarelo' | 'Vermelho'>('Amarelo');
  const [selectedCardMinute, setSelectedCardMinute] = useState(0);

  const isFormValid = useMemo(() => {
    return homeTeam > 0 && awayTeam > 0 && homeTeam !== awayTeam;
  }, [homeTeam, awayTeam]);

  const addGoal = useCallback((teams: Team[], players: Player[]): string | null => {
    if (!selectedGoalPlayer || selectedGoalMinute <= 0) {
      return 'Selecione um jogador e informe o minuto do gol.';
    }

    if (selectedGoalMinute > 120) {
      return 'O minuto do gol não pode ser maior que 120 minutos.';
    }

    const player = players.find(p => p.playerId === Number(selectedGoalPlayer));
    if (!player) {
      return 'Jogador não encontrado.';
    }

    const redCard = cards.find(
      c => c.playerId === player.playerId && 
      c.type === 'Vermelho' && 
      c.minute < selectedGoalMinute
    );

    if (redCard) {
      return `${player.nome} recebeu cartão vermelho no minuto ${redCard.minute}. Não pode marcar gol após ser expulso.`;
    }

    const team = teams.find(t => t.id === player.teamId);
    if (!team) {
      return 'Time não encontrado.';
    }

    const newGoal: Goal = {
      playerId: player.playerId,
      player: player.nome,
      teamId: team.id,
      team: team.name,
      minute: selectedGoalMinute
    };

    setGoals(prev => [...prev, newGoal]);

    if (team.id === homeTeam) {
      setHomeScore(prev => prev + 1);
    } else if (team.id === awayTeam) {
      setAwayScore(prev => prev + 1);
    }

    setSelectedGoalPlayer('');
    setSelectedGoalMinute(0);
    return null;
  }, [selectedGoalPlayer, selectedGoalMinute, homeTeam, awayTeam, cards]);

  const addCard = useCallback((teams: Team[], players: Player[]): string | null => {
    if (!selectedCardPlayer || selectedCardMinute <= 0) {
      return 'Selecione um jogador e informe o minuto do cartão.';
    }

    if (selectedCardMinute > 120) {
      return 'O minuto do cartão não pode ser maior que 120 minutos.';
    }

    const player = players.find(p => p.playerId === Number(selectedCardPlayer));
    if (!player) {
      return 'Jogador não encontrado.';
    }

    const existingRedCard = cards.find(
      c => c.playerId === player.playerId && c.type === 'Vermelho'
    );

    if (existingRedCard) {
      return `${player.nome} já recebeu cartão vermelho no minuto ${existingRedCard.minute}. Não pode receber outro cartão.`;
    }

    if (selectedCardType === 'Vermelho') {
      const playerGoalsBefore = goals.filter(
        g => g.playerId === player.playerId && g.minute < selectedCardMinute
      );

      if (playerGoalsBefore.length > 0) {
        return `${player.nome} tem gol(s) registrado(s) antes do minuto ${selectedCardMinute}. Um jogador não pode receber cartão vermelho antes de ter marcado gol.`;
      }

      const playerGoalsAfter = goals.filter(
        g => g.playerId === player.playerId && g.minute > selectedCardMinute
      );

      if (playerGoalsAfter.length > 0) {
        return `${player.nome} tem gol(s) registrado(s) após o minuto ${selectedCardMinute}. Remova os gols antes de adicionar o cartão vermelho.`;
      }
    }

    const team = teams.find(t => t.id === player.teamId);
    if (!team) {
      return 'Time não encontrado.';
    }

    const newCard: Card = {
      playerId: player.playerId,
      player: player.nome,
      teamId: team.id,
      team: team.name,
      type: selectedCardType,
      minute: selectedCardMinute
    };

    setCards(prev => [...prev, newCard]);
    setSelectedCardPlayer('');
    setSelectedCardMinute(0);
    setSelectedCardType('Amarelo');
    return null;
  }, [selectedCardPlayer, selectedCardType, selectedCardMinute, cards, goals]);

  const removeGoal = useCallback((index: number) => {
    const goalToRemove = goals[index];
    if (!goalToRemove) return;

    setGoals(prev => prev.filter((_, i) => i !== index));

    if (goalToRemove.teamId === homeTeam) {
      setHomeScore(prev => Math.max(0, prev - 1));
    } else if (goalToRemove.teamId === awayTeam) {
      setAwayScore(prev => Math.max(0, prev - 1));
    }
  }, [goals, homeTeam, awayTeam]);

  const removeCard = useCallback((index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetForm = useCallback(() => {
    setHomeTeam(0);
    setAwayTeam(0);
    setHomeScore(0);
    setAwayScore(0);
    setGoals([]);
    setCards([]);
    setSelectedGoalPlayer('');
    setSelectedGoalMinute(0);
    setSelectedCardPlayer('');
    setSelectedCardType('Amarelo');
    setSelectedCardMinute(0);
  }, []);

  const loadExistingData = useCallback((
    homeTeamId: number,
    awayTeamId: number,
    existingGoals: Goal[],
    existingCards: Card[]
  ) => {
    setHomeTeam(homeTeamId);
    setAwayTeam(awayTeamId);
    setGoals(existingGoals);
    setCards(existingCards);
    
    const homeGoals = existingGoals.filter(g => g.teamId === homeTeamId).length;
    const awayGoals = existingGoals.filter(g => g.teamId === awayTeamId).length;
    setHomeScore(homeGoals);
    setAwayScore(awayGoals);
  }, []);

  return {
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    goals,
    cards,
    selectedGoalPlayer,
    selectedGoalMinute,
    selectedCardPlayer,
    selectedCardType,
    selectedCardMinute,
    isFormValid,
    setHomeTeam,
    setAwayTeam,
    setSelectedGoalPlayer,
    setSelectedGoalMinute,
    setSelectedCardPlayer,
    setSelectedCardType,
    setSelectedCardMinute,
    addGoal,
    addCard,
    removeGoal,
    removeCard,
    resetForm,
    loadExistingData
  };
};
