import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import { StatusResultado } from '../../utils/matchResultsUtils';
import styles from './MatchCard.module.css';

interface MatchLocationInfo {
  nomequadra?: string;
  square?: string;
  quadra?: string;
  location?: string;
  date?: Date | string;
  championship?: {
    id: number;
    name: string;
    end_date: Date | string;
  };
  matchChampionship?: {
    id: number;
    name: string;
    end_date: Date | string;
  };
}

interface PartidaAmistosa {
  id: number;
  Match?: MatchLocationInfo;
  friendlyMatch?: MatchLocationInfo;
  reportFriendlyMatch?: MatchLocationInfo;
  team_home: number;
  team_away: number;
  teamHome?: {
    name: string;
  };
  teamAway?: {
    name: string;
  };
  reportTeamHome?: {
    name: string;
  };
  reportTeamAway?: {
    name: string;
  };
  teamAway_score: number;
  teamHome_score: number;
}
interface PartidasCampeonato {
  id: number;
  match?: MatchLocationInfo;
  championshipMatch?: MatchLocationInfo;
  team_home: number;
  team_away: number;
  teamHome?: {
    name: string;
  };
  teamAway?: {
    name: string;
  };
  reportTeamHome?: {
    name: string;
  };
  reportTeamAway?: {
    name: string;
  };
  teamAway_score: number;
  teamHome_score: number;
}

  // Removed misplaced return statement and JSX block

type MatchData = PartidaAmistosa | PartidasCampeonato;

interface MatchCardProps {
  partida: MatchData;
  teamId: number;
  isChampionship?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ partida, teamId, isChampionship = false }) => {
  // opponentName removido (não utilizado)
  const resultado = StatusResultado(
    partida.team_home ?? 0,
    partida.team_away ?? 0,
    partida.teamHome_score ?? 0,
    partida.teamAway_score ?? 0,
    teamId
  );

  let badgeClass = styles.resultBadge;
  if (resultado === 'Vitória') badgeClass += ' ' + styles.vitoria;
  if (resultado === 'Derrota') badgeClass += ' ' + styles.derrota;
  if (resultado === 'Empate') badgeClass += ' ' + styles.empate;

  const matchData: MatchLocationInfo | undefined = isChampionship
    ? (partida as PartidasCampeonato).match ?? (partida as PartidasCampeonato).championshipMatch
    : (partida as PartidaAmistosa).Match ?? (partida as PartidaAmistosa).friendlyMatch ?? (partida as PartidaAmistosa).reportFriendlyMatch;

  const championshipData = isChampionship
    ? matchData?.championship ?? matchData?.matchChampionship
    : undefined;

  const courtName = matchData?.nomequadra ?? matchData?.square ?? matchData?.quadra;
  const matchLocation = matchData?.location ?? matchData?.quadra;
  const matchDate = matchData?.date ? new Date(matchData.date) : null;

  const homeTeamName = partida.teamHome?.name ?? partida.reportTeamHome?.name ?? 'Time Casa';
  const awayTeamName = partida.teamAway?.name ?? partida.reportTeamAway?.name ?? 'Time Fora';

  if (!matchData) {
    return (
      <Col key={partida.id}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <p>Dados da partida indisponíveis</p>
          </Card.Body>
        </Card>
      </Col>
    );
  }

  return (
    <Col key={partida.id}>
  <Card className={`${styles.matchCard} shadow-sm border-0 h-100`}>
        <Card.Body>
          <div className={styles.matchCardScoreboard}>
            <div className={styles.scoreboardTeams}>
              <span className={styles.scoreboardTeamName}>{homeTeamName}</span>
              <span className={styles.scoreboardScore}>{partida.teamHome_score ?? 0}</span>
              <span style={{ fontSize: '1.3rem', color: '#888', fontWeight: 600 }}>x</span>
              <span className={styles.scoreboardScore}>{partida.teamAway_score ?? 0}</span>
              <span className={styles.scoreboardTeamName}>{awayTeamName}</span>
            </div>
          </div>

          <div className={styles.matchCardInfo}>
            {isChampionship && championshipData && (
              <span className={styles.matchCardIcons}>🏆 {championshipData.name}</span>
            )}
            <span className={styles.matchCardIcons}>🏟️ {courtName || 'Quadra não informada'}</span>
            {!isChampionship && <span className={styles.matchCardIcons}>📍 {matchLocation || 'Local não informado'}</span>}
            <span className={styles.matchCardIcons}>🗓 {matchDate ? matchDate.toLocaleDateString('pt-BR') : 'Data não informada'}</span>
            <span className={styles.matchCardIcons}>🕒 {matchDate ? matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>

          <hr />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4, marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="text-muted" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                {partida.team_home === teamId ? '🏠 Casa' : '✈️ Fora'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span className={badgeClass} style={{ minWidth: 70, justifyContent: 'center', display: 'inline-flex' }}>
                {resultado}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default MatchCard;