import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import './Sumula.css';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
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
    updateSumula,
    deleteSumula,
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
    resetForm,
    loadExistingData
  } = useSumulaForm();

  const { exportPDF } = useSumulaPDF();

  useEffect(() => {
    if (show && matchId) {
      const loadData = async () => {
        await Promise.all([
          fetchTeams(matchId, isChampionship),
          fetchPlayers(matchId, isChampionship),
          fetchMatchDetails(matchId, isChampionship).then(details => {
            if (details) {
              setMatchDate(details.matchDate || '');
              setMatchLocation(details.matchLocation || '');
              loadExistingData(
                details.homeTeam,
                details.awayTeam,
                details.goals,
                details.cards
              );
            }
          })
        ]);
      };
      
      loadData();
    }
  }, [show, matchId, isChampionship, fetchTeams, fetchPlayers, fetchMatchDetails, loadExistingData]);

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

    const loadingToast = toast.loading('Atualizando súmula...');

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

    const success = await updateSumula(sumulaData, isChampionship);
    
    toast.dismiss(loadingToast);
    
    if (success) {
      handleClose();
      toast.success('✅ Súmula atualizada com sucesso!', {
        duration: 4000,
      });
      setIsSaved(true);
    } else {
      toast.dismiss();
      alert('❌ Erro ao atualizar súmula. Tente novamente.');
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

  const homeTeamName = useMemo(() => 
    teams.find(t => t.id === homeTeam)?.name || '', 
    [teams, homeTeam]
  );
  
  const awayTeamName = useMemo(() => 
    teams.find(t => t.id === awayTeam)?.name || '', 
    [teams, awayTeam]
  );

  return (
    <dialog ref={dialogRef} className="sumula-dialog" onClose={handleClose}>
      <div className="dialog-header">
        <h2 className="dialog-title">
          <i className="fas fa-edit me-2"></i>
          Editar Súmula
        </h2>
        <button className="dialog-close" onClick={handleClose} type="button">
          <i className="bi bi-x"></i>
        </button>
      </div>

      <div className="dialog-body">
        <div className="container-fluid p-4">
          {homeTeam > 0 && awayTeam > 0 && (
            <div className="mb-4">
              <SumulaHeader
                key={`${homeScore}-${awayScore}-${goals.length}`}
                homeTeamName={homeTeamName}
                awayTeamName={awayTeamName}
                homeScore={homeScore}
                awayScore={awayScore}
              />
            </div>
          )}

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

          {goals.length > 0 && (
            <div className="mb-4">
              <GoalsTable goals={goals} editable onRemoveGoal={handleRemoveGoal} />
            </div>
          )}

          {cards.length > 0 && (
            <div className="mb-4">
              <CardsTable cards={cards} editable onRemoveCard={handleRemoveCard} />
            </div>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <div className="d-flex justify-content-end gap-2 w-100">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={dataLoading}
          >
            <i className="fas fa-times me-2"></i>
            Cancelar
          </button>
          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={!isFormValid || dataLoading}
          >
            <i className="fas fa-save me-2"></i>
            {dataLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </dialog>
  );
};
