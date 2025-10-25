import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Team } from '../types';

interface TeamSelectorProps {
  homeTeam: number;
  awayTeam: number;
  teams: Team[];
  onHomeTeamChange: (teamId: number, teamName: string) => void;
  onAwayTeamChange: (teamId: number, teamName: string) => void;
  disabled?: boolean;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  homeTeam,
  awayTeam,
  teams,
  onHomeTeamChange,
  onAwayTeamChange,
  disabled = false
}) => {
  return (
    <div className="form-section section-primary">
      <h5 className="text-primary">Informações da Partida</h5>
      <Row className="g-3">
        <Col lg={6} md={6}>
          <Form.Group>
            <Form.Label>Time da Casa</Form.Label>
            <Form.Select 
              value={homeTeam} 
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const team = teams.find(t => t.id === selectedId);
                if (team) onHomeTeamChange(selectedId, team.name);
              }}
              disabled={disabled}
            >
              <option value="">Selecione o time da casa</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col lg={6} md={6}>
          <Form.Group>
            <Form.Label>Time Visitante</Form.Label>
            <Form.Select 
              value={awayTeam} 
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const team = teams.find(t => t.id === selectedId);
                if (team) onAwayTeamChange(selectedId, team.name);
              }}
              disabled={disabled}
            >
              <option value="">Selecione o time visitante</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};
