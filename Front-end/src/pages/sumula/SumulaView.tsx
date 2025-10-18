import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import {
  SumulaHeader,
  SumulaStats,
  GoalsTable,
  CardsTable,
  SumulaActions
} from '../../../components/features/sumula';
import { useSumulaData, useSumulaPDF } from '../hooks';

interface SumulaViewProps {
  matchId: number;
  isChampionship?: boolean;
  onClose: () => void;
  show: boolean;
}

export const SumulaView: React.FC<SumulaViewProps> = ({ 
  matchId, 
  isChampionship = false, 
  onClose,
  show 
}) => {
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

  const {
    teams,
    loading: dataLoading,
    error: dataError,
    fetchTeams,
    fetchMatchDetails,
    setError
  } = useSumulaData();

  const { exportPDF } = useSumulaPDF();

  useEffect(() => {
    if (show && matchId) {
      fetchTeams(matchId, isChampionship);
      
      fetchMatchDetails(matchId, isChampionship).then(details => {
        if (details) {
          setMatchDate(details.matchDate);
          setMatchLocation(details.matchLocation);
          setHomeTeam(details.homeTeam);
          setAwayTeam(details.awayTeam);
          setHomeTeamName(details.homeTeamName);
          setAwayTeamName(details.awayTeamName);
          setHomeScore(details.homeScore);
          setAwayScore(details.awayScore);
          setGoals(details.goals);
          setCards(details.cards);
        }
      });
    }
  }, [show, matchId, isChampionship, fetchTeams, fetchMatchDetails]);

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

  if (dataLoading) {
    return (
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Body className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Visualizar Súmula</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <SumulaHeader
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          homeScore={homeScore}
          awayScore={awayScore}
          isSaved={true}
        />

        <div className="mt-3">
          <p><strong>Data:</strong> {matchDate || 'Não informada'}</p>
          <p><strong>Local:</strong> {matchLocation || 'Não informado'}</p>
        </div>

        <SumulaStats goals={goals} cards={cards} />

        <hr />

        {goals.length > 0 && (
          <>
            <GoalsTable goals={goals} />
            <hr />
          </>
        )}

        {cards.length > 0 && <CardsTable cards={cards} />}

        {goals.length === 0 && cards.length === 0 && (
          <div className="alert alert-info text-center">
            Nenhum evento registrado nesta partida.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <SumulaActions
          isSaved={true}
          canSave={false}
          loading={false}
          isFormValid={false}
          onSave={() => {}}
          onExportPDF={handleExportPDF}
          onClose={onClose}
        />
      </Modal.Footer>
    </Modal>
  );
};
