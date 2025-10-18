import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { TeamSelector } from '../../components/features/sumula/SumulaForm/TeamSelector';
import { GoalRegistration } from '../../components/features/sumula/SumulaForm/GoalRegistration';
import { CardRegistration } from '../../components/features/sumula/SumulaForm/CardRegistration';
import { SumulaHeader } from '../../components/features/sumula/SumulaDisplay/SumulaHeader';
import { SumulaStats } from '../../components/features/sumula/SumulaDisplay/SumulaStats';
import { GoalsTable } from '../../components/features/sumula/SumulaDisplay/GoalsTable';
import { CardsTable } from '../../components/features/sumula/SumulaDisplay/CardsTable';
import { SumulaActions } from '../../components/features/sumula/SumulaActions/SumulaActions';
import { useSumulaData } from './hooks/useSumulaData';
import { useSumulaForm } from './hooks/useSumulaForm';
import { useSumulaPDF } from './hooks/useSumulaPDF';

interface SumulaEditProps {
  matchId: number;
  isChampionship?: boolean;
  onClose: () => void;
  show: boolean;
}

export const SumulaEdit: React.FC<SumulaEditProps> = ({ 
  matchId, 
  isChampionship = false, 
  onClose,
  show 
}) => {
  const [isSaved, setIsSaved] = useState(true);
  const [matchDate, setMatchDate] = useState('');
  const [matchLocation, setMatchLocation] = useState('');

  const {
    teams,
    players,
    loading: dataLoading,
    error: dataError,
    fetchTeams,
    fetchPlayers,
    fetchMatchDetails,
    saveSumula,
    setError
  } = useSumulaData();

  const {
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
    resetForm,
    loadExistingData
  } = useSumulaForm();

  const { exportPDF } = useSumulaPDF();

  useEffect(() => {
    if (show && matchId) {
      fetchTeams(matchId, isChampionship);
      fetchPlayers(matchId, isChampionship);
      
      fetchMatchDetails(matchId, isChampionship).then(details => {
        if (details) {
          setMatchDate(details.matchDate);
          setMatchLocation(details.matchLocation);
          loadExistingData(
            details.homeTeam,
            details.awayTeam,
            details.goals,
            details.cards
          );
        }
      });
    }
  }, [show, matchId, isChampionship, fetchTeams, fetchPlayers, fetchMatchDetails, loadExistingData]);

  useEffect(() => {
    if (dataError) {
      toast.error(dataError);
      setError(null);
    }
  }, [dataError, setError]);

  const handleSave = async () => {
    if (!isFormValid) {
      toast.error('Selecione os times da casa e visitante.');
      return;
    }

    const homeTeamName = teams.find(t => t.id === homeTeam)?.name || '';
    const awayTeamName = teams.find(t => t.id === awayTeam)?.name || '';

    const sumulaData = {
      matchId,
      homeTeam,
      awayTeam,
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      goals,
      cards,
      matchDate,
      matchLocation
    };

    const success = await saveSumula(sumulaData, isChampionship);
    
    if (success) {
      toast.success('Súmula atualizada com sucesso!');
      setIsSaved(true);
    } else {
      toast.error('Erro ao atualizar súmula.');
    }
  };

  const handleExportPDF = () => {
    const homeTeamName = teams.find(t => t.id === homeTeam)?.name || '';
    const awayTeamName = teams.find(t => t.id === awayTeam)?.name || '';

    const sumulaData = {
      matchId,
      homeTeam,
      awayTeam,
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      goals,
      cards,
      matchDate,
      matchLocation
    };

    const matchType = isChampionship ? 'Campeonato' : 'Partida Amistosa';
    exportPDF(sumulaData, matchType);
    toast.success('PDF exportado com sucesso!');
  };

  const handleClose = () => {
    resetForm();
    setIsSaved(true);
    onClose();
  };

  const homeTeamName = teams.find(t => t.id === homeTeam)?.name || '';
  const awayTeamName = teams.find(t => t.id === awayTeam)?.name || '';

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Súmula</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <TeamSelector
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          teams={teams}
          onHomeTeamChange={setHomeTeam}
          onAwayTeamChange={setAwayTeam}
          disabled={dataLoading}
        />

        <hr />

        <GoalRegistration
          players={players}
          teams={teams}
          selectedPlayer={selectedGoalPlayer}
          minute={selectedGoalMinute}
          onPlayerChange={setSelectedGoalPlayer}
          onMinuteChange={setSelectedGoalMinute}
          onAddGoal={() => addGoal(teams, players)}
        />

        <hr />

        <CardRegistration
          players={players}
          teams={teams}
          selectedPlayer={selectedCardPlayer}
          cardType={selectedCardType}
          minute={selectedCardMinute}
          onPlayerChange={setSelectedCardPlayer}
          onCardTypeChange={setSelectedCardType}
          onMinuteChange={setSelectedCardMinute}
          onAddCard={() => addCard(teams, players)}
        />

        <hr />

        {(goals.length > 0 || cards.length > 0) && (
          <>
            <SumulaStats goals={goals} cards={cards} />
            <hr />
          </>
        )}

        {goals.length > 0 && (
          <>
            <GoalsTable goals={goals} editable onRemoveGoal={removeGoal} />
            <hr />
          </>
        )}

        {cards.length > 0 && <CardsTable cards={cards} />}
      </Modal.Body>

      <Modal.Footer>
        <SumulaActions
          isSaved={isSaved}
          canSave={isFormValid}
          loading={dataLoading}
          isFormValid={isFormValid}
          onSave={handleSave}
          onExportPDF={handleExportPDF}
          onClose={handleClose}
        />
      </Modal.Footer>
    </Modal>
  );
};
