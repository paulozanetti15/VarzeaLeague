import React from 'react';
import { Button, Card } from 'react-bootstrap';
import './ParticipantTeamCard.css';

interface TeamCardProps {
  team: any;
  userId?: number;
  isOrganizer: boolean;
  isAdmin: boolean;
  matchId: string | undefined;
  canLeaveMatch: boolean;
  onLeaveMatch: (matchId: string | undefined, teamId: number) => void;
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
  return (
    <Card className="team-card simple">
      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center py-4">
        <div className="team-name" title={team.name}>{team.name}</div>

        <div className="mt-3 action-buttons">
          {(team.captainId === userId && canLeaveMatch) && (
            <Button size="sm" variant="danger" onClick={() => onLeaveMatch(matchId, team.id)}>
              Sair da partida
            </Button>
          )}

          {((isOrganizer || isAdmin) && team.captainId !== userId && canLeaveMatch) && (
            <Button size="sm" variant="outline-danger" onClick={() => onLeaveMatch(matchId, team.id)} className="ms-2">
              Remover time
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeamCard;
