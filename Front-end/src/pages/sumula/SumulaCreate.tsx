import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { TeamSelector } from '../../features/sumula/SumulaForm/TeamSelector';
import { GoalRegistration } from '../../features/sumula/SumulaForm/GoalRegistration';
import { CardRegistration } from '../../features/sumula/SumulaForm/CardRegistration';
import { SumulaHeader } from '../../features/sumula/SumulaDisplay/SumulaHeader';
import { SumulaStats } from '../../features/sumula/SumulaDisplay/SumulaStats';
import { GoalsTable } from '../../features/sumula/SumulaDisplay/GoalsTable';
import { CardsTable } from '../../features/sumula/SumulaDisplay/CardsTable';
import { EventsTimeline } from '../../features/sumula/SumulaDisplay/EventsTimeline';
import { SumulaActions } from '../../features/sumula/SumulaActions/SumulaActions';
import { useSumulaData } from './hooks/useSumulaData';
import { useSumulaForm } from './hooks/useSumulaForm';
import { useSumulaPDF } from './hooks/useSumulaPDF';
import './Sumula.css';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
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
    removeCard,
    resetForm
  } = useSumulaForm();

  const { exportPDF } = useSumulaPDF();

  useEffect(() => {
    if (show && matchId) {
      fetchTeams(matchId, isChampionship);
      fetchPlayers(matchId, isChampionship);
      fetchMatchDetails(matchId, isChampionship).then(details => {
        if (details) {
          setMatchDate(details.matchDate ?? '');
          setMatchLocation(details.matchLocation ?? '');
        }
      });
    }
  }, [show, matchId, isChampionship, fetchTeams, fetchPlayers, fetchMatchDetails]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (show) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [show]);

  useEffect(() => {
    if (dataError) {
      toast.error(dataError);
      setError(null);
    }
  }, [dataError, setError]);

  const handleSave = async () => {
    if (!isFormValid) {
      alert('⚠️ Selecione os times da casa e visitante.');
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

    const loadingToast = toast.loading('Salvando súmula...');
    const success = await saveSumula(sumulaData, isChampionship);
    
    toast.dismiss(loadingToast);
    
    if (success) {
      handleClose();
      toast.success('✅ Súmula criada com sucesso!', {
        duration: 4000,
      });
      setIsSaved(true);
    } else {
      toast.dismiss();
      alert('❌ Erro ao salvar súmula. Tente novamente.');
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

  const handleAddGoal = () => {
    const error = addGoal(teams, players);
    
    if (error) {
      alert(`❌ ${error}`);
    }
  };

  const handleAddCard = () => {
    const error = addCard(teams, players);
    
    if (error) {
      alert(`❌ ${error}`);
    }
  };

  const handleRemoveGoal = (index: number) => {
    removeGoal(index);
  };

  const handleRemoveCard = (index: number) => {
    removeCard(index);
  };

  const handleClose = () => {
    resetForm();
    setIsSaved(false);
    onClose();
  };

  const homeTeamName = teams.find(t => t.id === homeTeam)?.name || '';
  const awayTeamName = teams.find(t => t.id === awayTeam)?.name || '';

  return (
    <dialog ref={dialogRef} className="sumula-dialog" onClose={handleClose}>
      <div className="dialog-header">
        <h2 className="dialog-title">
          <i className="fas fa-clipboard-list me-2"></i>
          {isSaved ? 'Súmula Validada' : 'Criar Súmula'}
        </h2>
        <button className="dialog-close" onClick={handleClose} type="button">
          <i className="bi bi-x"></i>
        </button>
      </div>

      <div className="dialog-body">
        <div className="container-fluid p-4">
          {!isSaved ? (
            <>
              <SumulaHeader
                homeTeamName={homeTeamName}
                awayTeamName={awayTeamName}
                homeScore={homeScore}
                awayScore={awayScore}
              />

              <div className="form-section">
                <h5>
                  <i className="fas fa-users me-2"></i>
                  Seleção de Times
                </h5>
                <TeamSelector
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  teams={teams}
                  onHomeTeamChange={setHomeTeam}
                  onAwayTeamChange={setAwayTeam}
                  disabled={dataLoading}
                />
              </div>

              <div className="form-section">
                <h5>
                  <i className="fas fa-futbol me-2"></i>
                  Registro de Gols
                </h5>
                <GoalRegistration
                  players={players}
                  teams={teams}
                  selectedPlayer={selectedGoalPlayer}
                  minute={selectedGoalMinute}
                  onPlayerChange={setSelectedGoalPlayer}
                  onMinuteChange={setSelectedGoalMinute}
                  onSubmit={handleAddGoal}
                />
              </div>

              <div className="form-section">
                <h5>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Registro de Cartões
                </h5>
                <CardRegistration
                  players={players}
                  teams={teams}
                  selectedPlayer={selectedCardPlayer}
                  cardType={selectedCardType}
                  minute={selectedCardMinute}
                  onPlayerChange={setSelectedCardPlayer}
                  onCardTypeChange={setSelectedCardType}
                  onMinuteChange={setSelectedCardMinute}
                  onSubmit={handleAddCard}
                />
              </div>

              {(goals.length > 0 || cards.length > 0) && (
                <SumulaStats goals={goals} cards={cards} />
              )}

              {(goals.length > 0 || cards.length > 0) && (
                <div className="mb-4">
                  <EventsTimeline goals={goals} cards={cards} />
                </div>
              )}

              <div className="mb-4">
                <GoalsTable goals={goals} editable onRemoveGoal={handleRemoveGoal} />
              </div>

              <div className="mb-4">
                <CardsTable cards={cards} editable onRemoveCard={handleRemoveCard} />
              </div>
            </>
          ) : (
            <>
              <SumulaHeader
                homeTeamName={homeTeamName}
                awayTeamName={awayTeamName}
                homeScore={homeScore}
                awayScore={awayScore}
              />

              <SumulaStats goals={goals} cards={cards} />

              {(goals.length > 0 || cards.length > 0) && (
                <div className="mb-4">
                  <EventsTimeline goals={goals} cards={cards} />
                </div>
              )}

              <div className="mb-4">
                <GoalsTable goals={goals} />
              </div>

              <div className="mb-4">
                <CardsTable cards={cards} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <SumulaActions
          isSaved={isSaved}
          canSave={isFormValid}
          loading={dataLoading}
          isFormValid={isFormValid}
          onSave={handleSave}
          onExportPDF={handleExportPDF}
          onClose={handleClose}
        />
      </div>
    </dialog>
  );
};
