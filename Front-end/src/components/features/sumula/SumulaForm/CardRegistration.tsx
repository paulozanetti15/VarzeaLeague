import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Player, Team } from '../types';

interface CardRegistrationProps {
  players: Player[];
  teams: Team[];
  selectedPlayer: string;
  cardType: 'Amarelo' | 'Vermelho';
  minute: number | '';
  onPlayerChange: (playerId: string) => void;
  onCardTypeChange: (type: 'Amarelo' | 'Vermelho') => void;
  onMinuteChange: (minute: number | '') => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const CardRegistration: React.FC<CardRegistrationProps> = ({
  players,
  teams,
  selectedPlayer,
  cardType,
  minute,
  onPlayerChange,
  onCardTypeChange,
  onMinuteChange,
  onSubmit,
  disabled = false
}) => {
  return (
    <div className="form-section section-warning">
      <h5 className="text-warning">Registrar Cartão</h5>
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
        <Col sm={6} xs={6}>
          <Form.Group>
            <Form.Label>Tipo do Cartão</Form.Label>
            <Form.Select 
              value={cardType} 
              onChange={(e) => onCardTypeChange(e.target.value as 'Amarelo' | 'Vermelho')}
              disabled={disabled}
            >
              <option value="Amarelo">Cartão Amarelo</option>
              <option value="Vermelho">Cartão Vermelho</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6} xs={6}>
          <Form.Group>
            <Form.Label>Minuto</Form.Label>
            <Form.Control 
              type="number" 
              min="1"
              max="120"
              placeholder="1-120"
              value={minute} 
              onChange={(e) => onMinuteChange(e.target.value === '' ? '' : Number(e.target.value))} 
              disabled={disabled}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Button 
            variant="warning" 
            className="w-100" 
            onClick={onSubmit}
            disabled={disabled || !selectedPlayer || !minute}
          >
            Registrar Cartão
          </Button>
        </Col>
      </Row>
    </div>
  );
};
