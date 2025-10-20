import { useState, useCallback, useMemo } from 'react';
import type { Team } from '../../../components/features/sumula/types';
import type { Player } from '../../../components/features/sumula/types';
import type { Goal } from '../../../components/features/sumula/types';
import type { Card } from '../../../components/features/sumula/types';

interface UseSumulaFormReturn {
  homeTeam: number;
  awayTeam: number;
  homeScore: number;
  awayScore: number;
  goals: Goal[];
  cards: Card[];
  selectedGoalPlayer: number;
  selectedGoalMinute: number;
  selectedCardPlayer: number;
  selectedCardType: 'Amarelo' | 'Vermelho';
  selectedCardMinute: number;
  isFormValid: boolean;
  setHomeTeam: (teamId: number) => void;
  setAwayTeam: (teamId: number) => void;
  setSelectedGoalPlayer: (playerId: number) => void;
  setSelectedGoalMinute: (minute: number) => void;
  setSelectedCardPlayer: (playerId: number) => void;
  setSelectedCardType: (type: 'Amarelo' | 'Vermelho') => void;
  setSelectedCardMinute: (minute: number) => void;
  addGoal: (teams: Team[], players: Player[]) => void;
  addCard: (teams: Team[], players: Player[]) => void;
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
  
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState(0);
  const [selectedGoalMinute, setSelectedGoalMinute] = useState(0);
  
  const [selectedCardPlayer, setSelectedCardPlayer] = useState(0);
  const [selectedCardType, setSelectedCardType] = useState<'Amarelo' | 'Vermelho'>('Amarelo');
  const [selectedCardMinute, setSelectedCardMinute] = useState(0);

  const isFormValid = useMemo(() => {
    return homeTeam > 0 && awayTeam > 0 && homeTeam !== awayTeam;
  }, [homeTeam, awayTeam]);

  const addGoal = useCallback((teams: Team[], players: Player[]) => {
    if (selectedGoalPlayer === 0 || selectedGoalMinute <= 0) return;

    const player = players.find(p => p.id === selectedGoalPlayer);
    if (!player) return;

    const team = teams.find(t => t.id === player.teamId);
    if (!team) return;

    const newGoal: Goal = {
      playerId: player.id,
      playerName: player.nome,
      teamId: team.id,
      teamName: team.name,
      minute: selectedGoalMinute
    };

    setGoals(prev => [...prev, newGoal]);

    if (team.id === homeTeam) {
      setHomeScore(prev => prev + 1);
    } else if (team.id === awayTeam) {
      setAwayScore(prev => prev + 1);
    }

    setSelectedGoalPlayer(0);
    setSelectedGoalMinute(0);
  }, [selectedGoalPlayer, selectedGoalMinute, homeTeam, awayTeam]);

  const addCard = useCallback((teams: Team[], players: Player[]) => {
    if (selectedCardPlayer === 0 || selectedCardMinute <= 0) return;

    const player = players.find(p => p.id === selectedCardPlayer);
    if (!player) return;

    const team = teams.find(t => t.id === player.teamId);
    if (!team) return;

    const newCard: Card = {
      playerId: player.id,
      playerName: player.nome,
      teamId: team.id,
      teamName: team.name,
      type: selectedCardType,
      minute: selectedCardMinute
    };

    setCards(prev => [...prev, newCard]);
    setSelectedCardPlayer(0);
    setSelectedCardMinute(0);
    setSelectedCardType('Amarelo');
  }, [selectedCardPlayer, selectedCardType, selectedCardMinute]);

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
    setSelectedGoalPlayer(0);
    setSelectedGoalMinute(0);
    setSelectedCardPlayer(0);
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
