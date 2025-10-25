import React from 'react';
import { Card as BootstrapCard, Table } from 'react-bootstrap';
import { Card } from '../types';

interface CardsTableProps {
  cards: Card[];
  editable?: boolean;
  onRemoveCard?: (index: number) => void;
}

export const CardsTable: React.FC<CardsTableProps> = ({ cards, editable = false, onRemoveCard }) => {
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
                <th className="text-center">Jogador</th>
                <th className="text-center">Time</th>
                <th className="text-center">Tipo</th>
                <th className="text-center">Minuto</th>
                {editable && <th className="text-center" style={{ width: '60px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {cards.length > 0 ? cards.map((card, index) => (
                <tr key={index}>
                  <td className="fw-semibold text-center" title={card.player}>
                    {card.player}
                  </td>
                  <td className="text-center" title={card.team}>
                    {card.team}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${card.type === 'Amarelo' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {card.type}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-secondary">{card.minute}'</span>
                  </td>
                  {editable && (
                    <td className="text-center">
                      <i 
                        className="bi bi-trash text-danger" 
                        onClick={() => onRemoveCard?.(index)}
                        title="Remover cartão"
                        style={{ cursor: 'pointer', fontSize: '1rem' }}
                      ></i>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={editable ? 5 : 4} className="text-center text-muted py-3">
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
