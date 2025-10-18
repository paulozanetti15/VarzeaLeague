import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import {
  TeamSelector,
  GoalRegistration,
  CardRegistration,
  SumulaHeader,
  SumulaStats,
  GoalsTable,
  CardsTable,
  SumulaActions
} from '../../../components/features/sumula';
import { useSumulaData, useSumulaForm, useSumulaPDF } from '../hooks';

interface SumulaCreateProps {
  matchId: number;
  isChampionship?: boolean;
  onClose: () => void;
  show: boolean;
}

export const SumulaCreate: React.FC<SumulaCreateProps> = ({ 
  matchId, 
  isChampionship = false, 
  onClose,
  show 
}) => {
  const [isSaved, setIsSaved] = useState(false);
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
    resetForm
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
        }
      });
    }
  }, [show, matchId, isChampionship, fetchTeams, fetchPlayers, fetchMatchDetails]);

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
      toast.success('Súmula salva com sucesso!');
      setIsSaved(true);
    } else {
      toast.error('Erro ao salvar súmula.');
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
    setIsSaved(false);
    onClose();
  };

  const homeTeamName = teams.find(t => t.id === homeTeam)?.name || '';
  const awayTeamName = teams.find(t => t.id === awayTeam)?.name || '';

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isSaved ? 'Súmula Validada' : 'Criar Súmula'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!isSaved ? (
          <>
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
          </>
        ) : (
          <>
            <SumulaHeader
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
              homeScore={homeScore}
              awayScore={awayScore}
              isSaved={isSaved}
            />

            <SumulaStats goals={goals} cards={cards} />

            <hr />

            {goals.length > 0 && (
              <>
                <GoalsTable goals={goals} />
                <hr />
              </>
            )}

            {cards.length > 0 && <CardsTable cards={cards} />}
          </>
        )}
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
