import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { SumulaHeader } from '../../features/sumula/SumulaDisplay/SumulaHeader';
import { SumulaStats } from '../../features/sumula/SumulaDisplay/SumulaStats';
import { GoalsTable } from '../../features/sumula/SumulaDisplay/GoalsTable';
import { CardsTable } from '../../features/sumula/SumulaDisplay/CardsTable';
import { EventsTimeline } from '../../features/sumula/SumulaDisplay/EventsTimeline';
import { useSumulaData } from './hooks/useSumulaData';
import { useSumulaPDF } from './hooks/useSumulaPDF';
import './Sumula.css';

interface SumulaViewProps {
  matchId: number;
  isChampionship?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  show: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  showDeleteConfirm?: () => void;
}

export const SumulaView: React.FC<SumulaViewProps> = ({ 
  matchId, 
  isChampionship = false, 
  onClose,
  onEdit,
  show,
  canEdit,
  canDelete,
  showDeleteConfirm
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [matchDate, setMatchDate] = useState('');
  const [matchLocation, setMatchLocation] = useState('');
  const [homeTeam, setHomeTeam] = useState(0);
  const [awayTeam, setAwayTeam] = useState(0);
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [goals, setGoals] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [isWO, setIsWO] = useState(false);

  const {
    loading: dataLoading,
    error: dataError,
    fetchMatchDetails,
    deleteSumula,
    setError
  } = useSumulaData();

  const { exportPDF } = useSumulaPDF();

  useEffect(() => {
    if (show && matchId) {
      const loadData = async () => {
        const details = await fetchMatchDetails(matchId, isChampionship);
        if (details) {
          setMatchDate(details.matchDate || '');
          setMatchLocation(details.matchLocation || '');
          setHomeTeam(details.homeTeam);
          setAwayTeam(details.awayTeam);
          setHomeTeamName(details.homeTeamName);
          setAwayTeamName(details.awayTeamName);
          setHomeScore(details.homeScore);
          setAwayScore(details.awayScore);
          setGoals(details.goals);
          setCards(details.cards);
          if (
            (details.goals.length === 0 && details.cards.length === 0) &&
            ((details.homeScore === 0 && details.awayScore >= 1) || (details.awayScore === 0 && details.homeScore >= 1))
          ) {
            setIsWO(true);
          } else {
            setIsWO(false);
          }
        }
      };
      loadData();
    }
  }, [show, matchId, isChampionship, fetchMatchDetails]);

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

  const handleExportPDF = () => {
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

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Tem certeza que deseja deletar esta súmula?\n\nEsta ação não pode ser desfeita e todos os gols e cartões serão removidos permanentemente.')) {
      return;
    }
    
    const loadingToast = toast.loading('Deletando súmula...');

    const success = await deleteSumula(matchId, isChampionship);
    
    toast.dismiss(loadingToast);
    
    if (success) {
      onClose();
      toast.success('🗑️ Súmula deletada com sucesso!', {
        duration: 3000,
      });
    } else {
      toast.error('❌ Erro ao deletar súmula. Tente novamente.', {
        duration: 4000,
      });
    }
  };

  return (
  <dialog ref={dialogRef} className="sumula-dialog" onClose={onClose}>
      {dataLoading ? (
        <div className="dialog-body">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando súmula...</p>
          </div>
        </div>
      ) : (
        <>
      <div className="dialog-header">
        <h2 className="dialog-title">
          <i className="fas fa-eye me-2"></i>
          {isWO ? 'Partida cancelada por WO' : 'Visualizar Súmula'}
        </h2>
        <button className="dialog-close" onClick={onClose} type="button">
          <i className="bi bi-x"></i>
        </button>
      </div>

      <div className="dialog-body">
        <div className="container-fluid p-4">
          <SumulaHeader
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            homeScore={isWO ? (homeScore > awayScore ? homeScore : 0) : homeScore}
            awayScore={isWO ? (awayScore > homeScore ? awayScore : 0) : awayScore}
          />
          {isWO && (
            <div className="alert alert-warning text-center mt-3 mb-4" style={{ fontWeight: 600, fontSize: 18 }}>
              Partida encerrada automaticamente por WO (Walk Over).
            </div>
          )}

          <div className="form-section">
            <h5>
              <i className="fas fa-info-circle me-2"></i>
              Informações da Partida
            </h5>
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2">
                  <i className="fas fa-calendar me-2 text-primary"></i>
                  <strong>Data:</strong> {matchDate || 'Não informada'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                  <strong>Local:</strong> {matchLocation || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          <SumulaStats goals={goals} cards={cards} />

          <div className="row mb-4">
            <div className="col-lg-6 mb-3">
              <EventsTimeline goals={goals} cards={cards} />
            </div>
            <div className="col-lg-6">
              <div className="row">
                {goals.length > 0 && (
                  <div className="col-12 mb-3">
                    <GoalsTable goals={goals} />
                  </div>
                )}
                {cards.length > 0 && (
                  <div className="col-12">
                    <CardsTable cards={cards} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {goals.length === 0 && cards.length === 0 && (
            <div className="alert alert-info text-center">
              <i className="fas fa-info-circle me-2"></i>
              Nenhum evento registrado nesta partida.
            </div>
          )}
        </div>
      </div>

      <div className="dialog-footer">
        <div className="d-flex justify-content-between w-100">
          {!isWO && canDelete !== false && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={dataLoading}
            >
              <i className="fas fa-trash me-2"></i>
              Deletar Súmula
            </button>
          )}

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={dataLoading}
            >
              <i className="fas fa-times me-2"></i>
              Fechar
            </button>
            {!isWO && onEdit && canEdit !== false && (
              <button
                className="btn btn-warning"
                onClick={onEdit}
                disabled={dataLoading}
              >
                <i className="fas fa-edit me-2"></i>
                Editar Súmula
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleExportPDF}
              disabled={dataLoading}
            >
              <i className="fas fa-file-pdf me-2"></i>
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </dialog>
  );
};
