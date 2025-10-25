import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Player, Team } from '../types';

interface GoalRegistrationProps {
  players: Player[];
  teams: Team[];
  selectedPlayer: string;
  minute: number | '';
  onPlayerChange: (playerId: string) => void;
  onMinuteChange: (minute: number | '') => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const GoalRegistration: React.FC<GoalRegistrationProps> = ({
  players,
  teams,
  selectedPlayer,
  minute,
  onPlayerChange,
  onMinuteChange,
  onSubmit,
  disabled = false
}) => {
  return (
    <div className="form-section section-success">
      <h5 className="text-success">Registrar Gol</h5>
      <Row className="g-3">
        <Col xs={12}>
          <Form.Group>
            <Form.Label>Jogador</Form.Label>
            <Form.Select 
              value={selectedPlayer} 
              onChange={(e) => onPlayerChange(e.target.value)}
              disabled={disabled}
            >
              <option value="">Selecione um jogador</option>
              {players.map((player) => {
                const team = teams.find(t => t.id === player.teamId);
                return (
                  <option key={player.playerId} value={player.playerId}>
                    {player.nome} - {team?.name || 'Time não identificado'}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={8} xs={7}>
          <Form.Group>
            <Form.Label>Minuto da Partida</Form.Label>
            <Form.Control 
              type="number" 
              min="1"
              max="120"
              placeholder="Digite o minuto (1-120)"
              value={minute} 
              onChange={(e) => onMinuteChange(e.target.value === '' ? '' : Number(e.target.value))} 
              disabled={disabled}
            />
          </Form.Group>
        </Col>
        <Col sm={4} xs={5} className="d-flex align-items-end">
          <Button 
            variant="success" 
            className="w-100" 
            onClick={onSubmit}
            disabled={disabled || !selectedPlayer || !minute}
          >
            Registrar Gol
          </Button>
        </Col>
      </Row>
    </div>
  );
};
