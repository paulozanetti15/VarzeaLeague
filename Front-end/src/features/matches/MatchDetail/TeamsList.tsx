import React from 'react';
import { Button } from 'react-bootstrap';
import TeamCard from './TeamCard';

interface TeamsListProps {
  teams: any[];
  match: any;
  userId?: number;
  userTypeId?: number;
  isOrganizer: boolean;
  isAdmin: boolean;
  isCompleted: boolean;
  matchId: string | undefined;
  effectiveMaxTeams: number;
  onLeaveMatch: (matchId: string | undefined, teamId: number, teamName: string) => void;
  onOpenSelectTeamPlayers: () => void;
}

const TeamsList: React.FC<TeamsListProps> = ({
  teams,
  match,
  userId,
  userTypeId,
  isOrganizer,
  isAdmin,
  isCompleted,
  matchId,
  effectiveMaxTeams,
  onLeaveMatch,
  onOpenSelectTeamPlayers
}) => {
  const currentTeamsCount = teams.length;
  
  const userHasTeamInMatch = teams.some(team => team.captainId === userId);

  const isPastDeadline = match.registrationDeadline 
    ? (() => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        const deadline = new Date(match.registrationDeadline);
        deadline.setHours(23, 59, 59, 999);
        
        return now > deadline;
      })()
    : false;

  const canJoinMatch = 
    match.status === 'aberta' && 
    userTypeId === 3 && 
    currentTeamsCount < effectiveMaxTeams &&
    !userHasTeamInMatch &&
    !isPastDeadline;

  const canLeaveMatch = !isPastDeadline && !isCompleted;
  
  const isCancelled = match.status === 'cancelada';
  
  const getCancelReason = () => {
    if (currentTeamsCount === 0) {
      return 'Nenhum time inscrito após prazo de inscrição';
    } else if (currentTeamsCount === 1) {
      return 'Apenas um time inscrito após prazo de inscrição';
    }
    return 'Esta partida foi cancelada';
  };

  return (
    <div className="match-description">
      {!isCancelled && <h3>Times Participantes</h3>}
      
      {isCancelled && (
        <div 
          className="alert mb-3" 
          style={{
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(231, 76, 60, 0.4)',
            textAlign: 'center'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <i className="fas fa-times-circle" style={{ fontSize: '28px', color: 'white !important' }}></i>
            <strong style={{ fontSize: '18px', fontWeight: 600, color: 'white !important' }}>Partida Cancelada</strong>
          </div>
          <p className="mb-0" style={{ 
            fontSize: '15px',
            lineHeight: '1.5',
            color: 'white !important'
          }}>
            {getCancelReason()}
          </p>
        </div>
      )}
      
      <div className="teams-list">
        {teams.length > 0 ? (
          <>
            {teams.map((team: any) => (
              <TeamCard
                key={team.id}
                team={team}
                userId={userId}
                isOrganizer={isOrganizer}
                isAdmin={isAdmin}
                matchId={matchId}
                canLeaveMatch={canLeaveMatch}
                onLeaveMatch={onLeaveMatch}
              />
            ))}
            {teams.length === 1 && <div className="versus-text">X</div>}
            {canJoinMatch && (
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="success"
                  onClick={onOpenSelectTeamPlayers}
                  className="join-match-btn"
                >
                  <i className="fas fa-link"></i>
                  Vincular meu Time
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="no-teams-wrapper">
            <div className="no-teams-text">
              {isCancelled  
                ? '' 
                : 'Nenhum time inscrito ainda.'}
            </div>
            {canJoinMatch && (
              <Button
                variant="success"
                onClick={onOpenSelectTeamPlayers}
                className="join-match-btn"
              >
                <i className="fas fa-link"></i>
                Vincular meu Time
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsList;
