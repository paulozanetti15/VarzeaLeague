import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import { StatusResultado } from '../../utils/matchResultsUtils';
import styles from './MatchCard.module.css';

interface PartidaAmistosa {
  id: number;
  Match: {
    nomequadra: string;
    date: Date;
    location: string;
  };
  team_home: number;
  team_away: number;
  teamHome: {
    name: string;
  };
  teamAway: {
    name: string;
  };
  date: Date;
  teamAway_score: number;
  teamHome_score: number;
}
interface PartidasCampeonato {
  id: number;
  match: {
    nomequadra: string;
    date: Date;
    location: string;
    championship: {
      id: number;
      name: string;
      end_date: Date;
    };
  };
  team_home: number;
  team_away: number;
  teamHome: {
    name: string;
  };
  teamAway: {
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

  const matchData: any = isChampionship ? (partida as PartidasCampeonato).match : (partida as PartidaAmistosa).Match;

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
              <span className={styles.scoreboardTeamName}>{partida.teamHome?.name || 'Time Casa'}</span>
              <span className={styles.scoreboardScore}>{partida.teamHome_score ?? 0}</span>
              <span style={{ fontSize: '1.3rem', color: '#888', fontWeight: 600 }}>x</span>
              <span className={styles.scoreboardScore}>{partida.teamAway_score ?? 0}</span>
              <span className={styles.scoreboardTeamName}>{partida.teamAway?.name || 'Time Fora'}</span>
            </div>
          </div>

          <div className={styles.matchCardInfo}>
            {isChampionship && matchData.championship && (
              <span className={styles.matchCardIcons}>🏆 {matchData.championship.name}</span>
            )}
            <span className={styles.matchCardIcons}>🏟️ {matchData.nomequadra || 'Quadra não informada'}</span>
            {!isChampionship && <span className={styles.matchCardIcons}>📍 {matchData.location || 'Local não informado'}</span>}
            <span className={styles.matchCardIcons}>🗓 {matchData.date ? new Date(matchData.date).toLocaleDateString('pt-BR') : 'Data não informada'}</span>
            <span className={styles.matchCardIcons}>🕒 {matchData.date ? new Date(matchData.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
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