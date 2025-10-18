import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Goal, Card } from '../types';

interface SumulaStatsProps {
  goals: Goal[];
  cards: Card[];
}

export const SumulaStats: React.FC<SumulaStatsProps> = ({ goals, cards }) => {
  const yellowCards = cards.filter(c => c.type === 'Amarelo').length;
  const redCards = cards.filter(c => c.type === 'Vermelho').length;

  return (
    <div className="summary-stats">
      <Row className="text-center">
        <Col>
          <div className="fw-bold">{goals.length}</div>
          <small>Gols</small>
        </Col>
        <Col>
          <div className="fw-bold">{yellowCards}</div>
          <small>Cartões Amarelos</small>
        </Col>
        <Col>
          <div className="fw-bold">{redCards}</div>
          <small>Cartões Vermelhos</small>
        </Col>
      </Row>
    </div>
  );
};
