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
  onLeaveMatch: (matchId: string | undefined, teamId: number) => void;
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

  return (
    <div className="match-description">
      <h3>Times Participantes</h3>
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
                isCompleted={isCompleted}
                matchId={matchId}
                onLeaveMatch={onLeaveMatch}
              />
            ))}
            {teams.length === 1 && <div className="versus-text">X</div>}
            {match.status === 'open' && userTypeId === 3 && (currentTeamsCount < effectiveMaxTeams) && (
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
            <div className="no-teams-text">Nenhum time inscrito ainda.</div>
            {match.status === 'open' && userTypeId === 3 && (currentTeamsCount < effectiveMaxTeams) && (
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
