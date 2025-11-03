import React from 'react';
import { ListGroup, Alert } from 'react-bootstrap';
import PlayerEligibilityBadge from './PlayerEligibilityBadge';

interface Player {
  id: number;
  nome: string;
}

interface PlayerListWithEligibilityProps {
  players: Player[];
  matchId: number;
  isChampionship?: boolean;
  onPlayerSelect?: (player: Player) => void;
  selectedPlayers?: number[];
}

export const PlayerListWithEligibility: React.FC<PlayerListWithEligibilityProps> = ({
  players,
  matchId,
  isChampionship = false,
  onPlayerSelect,
  selectedPlayers = [],
}) => {
  if (!players || players.length === 0) {
    return (
      <Alert variant="info">
        Nenhum jogador disponível para escalar.
      </Alert>
    );
  }

  return (
    <ListGroup>
      {players.map((player) => {
        const isSelected = selectedPlayers.includes(player.id);
        
        return (
          <ListGroup.Item
            key={player.id}
            action={!!onPlayerSelect}
            active={isSelected}
            onClick={() => onPlayerSelect?.(player)}
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: onPlayerSelect ? 'pointer' : 'default' }}
          >
            <div className="d-flex align-items-center">
              <span>{player.nome}</span>
              <PlayerEligibilityBadge
                playerId={player.id}
                matchId={matchId}
                isChampionship={isChampionship}
                showDetails={true}
              />
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default PlayerListWithEligibility;
