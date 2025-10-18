import React from 'react';
import { Card as BootstrapCard, Table } from 'react-bootstrap';
import { Card } from '../types';

interface CardsTableProps {
  cards: Card[];
}

export const CardsTable: React.FC<CardsTableProps> = ({ cards }) => {
  return (
    <BootstrapCard className="h-100">
      <BootstrapCard.Header className="bg-warning text-dark">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Cartões Registrados</h6>
          <span className="badge bg-dark text-light">{cards.length}</span>
        </div>
      </BootstrapCard.Header>
      <BootstrapCard.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0" size="sm">
            <thead>
              <tr>
                <th>Jogador</th>
                <th>Time</th>
                <th>Tipo</th>
                <th>Minuto</th>
              </tr>
            </thead>
            <tbody>
              {cards.length > 0 ? cards.map((card, index) => (
                <tr key={index}>
                  <td className="fw-semibold">
                    <div className="text-truncate" title={card.player}>
                      {card.player}
                    </div>
                  </td>
                  <td>
                    <div className="text-truncate" title={card.team}>
                      {card.team}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${card.type === 'Amarelo' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {card.type}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{card.minute}'</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-3">
                    Nenhum cartão registrado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </BootstrapCard.Body>
    </BootstrapCard>
  );
};
