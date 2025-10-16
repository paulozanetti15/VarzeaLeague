import React from 'react';
import { Button, Card } from 'react-bootstrap';

interface TeamCardProps {
  team: any;
  userId?: number;
  isOrganizer: boolean;
  isAdmin: boolean;
  isCompleted: boolean;
  matchId: string | undefined;
  onLeaveMatch: (matchId: string | undefined, teamId: number) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  userId,
  isOrganizer,
  isAdmin,
  isCompleted,
  matchId,
  onLeaveMatch
}) => {
  return (
    <Card className="team-card">
      <Card.Body>
        {team.banner && (
          <Card.Img
            src={`http://localhost:3001/uploads/teams/${team.banner}`}
            variant='top'
          />
        )}
        <div className='d-flex flex-column align-items-center text-center'>
          <Card.Title>{team.name}</Card.Title>
          {(team.captainId === userId && !isCompleted) && (
            <Button variant="danger" onClick={() => onLeaveMatch(matchId, team.id)}>
              Sair da Partida
            </Button>
          )}
          {((isOrganizer || isAdmin) && team.captainId !== userId) && (
            <Button variant="outline-danger" onClick={() => onLeaveMatch(matchId, team.id)}>
              Remover time
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TeamCard;
