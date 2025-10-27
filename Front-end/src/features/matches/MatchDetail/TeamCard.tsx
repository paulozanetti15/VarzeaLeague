import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaUsers, FaCrown } from 'react-icons/fa';
import './ParticipantTeamCard.css';

interface TeamCardProps {
  team: any;
  userId?: number;
  isOrganizer: boolean;
  isAdmin: boolean;
  matchId: string | undefined;
  canLeaveMatch: boolean;
  onLeaveMatch: (matchId: string | undefined, teamId: number, teamName: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  userId,
  isOrganizer,
  isAdmin,
  matchId,
  canLeaveMatch,
  onLeaveMatch
}) => {
  const isUserCaptain = team.captainId === userId;

  return (
    <Card className={`team-card simple ${isUserCaptain ? 'captain-team' : ''}`}>
      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center py-4">
        <div className="team-icon mb-2">
          <FaUsers size={32} color="#007bff" />
        </div>

        <div className="team-name-container">
          <div className="team-name" title={team.name}>
            {team.name}
          </div>
          {isUserCaptain && (
            <div className="captain-badge">
              <FaCrown size={12} color="#ffd700" />
              <span>Capitão</span>
            </div>
          )}
        </div>

        <div className="mt-3 action-buttons">
          {(team.captainId === userId && canLeaveMatch) && (
            <Button size="sm" variant="danger" onClick={() => onLeaveMatch(matchId, team.id, team.name)}>
              Sair da partida
            </Button>
          )}

          {((isOrganizer || isAdmin) && team.captainId !== userId && canLeaveMatch) && (
            <Button size="sm" variant="outline-danger" onClick={() => onLeaveMatch(matchId, team.id, team.name)} className="ms-2">
              Remover time
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeamCard;
