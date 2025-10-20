import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Goal } from '../types';

interface GoalsTableProps {
  goals: Goal[];
  editable?: boolean;
  onRemoveGoal?: (index: number) => void;
}

export const GoalsTable: React.FC<GoalsTableProps> = ({ goals, editable = false, onRemoveGoal }) => {
  return (
    <Card className="h-100">
      <Card.Header className="bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Gols Registrados</h6>
          <span className="badge bg-light text-success">{goals.length}</span>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0" size="sm">
            <thead>
              <tr>
                <th className="text-center">Jogador</th>
                <th className="text-center">Time</th>
                <th className="text-center">Minuto</th>
                {editable && <th className="text-center" style={{ width: '60px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {goals.length > 0 ? goals.map((goal, index) => (
                <tr key={index}>
                  <td className="fw-semibold text-center" title={goal.player}>
                    {goal.player}
                  </td>
                  <td className="text-center" title={goal.team}>
                    {goal.team}
                  </td>
                  <td className="text-center">
                    <span className="badge bg-secondary">{goal.minute}'</span>
                  </td>
                  {editable && (
                    <td className="text-center">
                      <i 
                        className="bi bi-trash text-danger" 
                        onClick={() => onRemoveGoal?.(index)}
                        title="Remover gol"
                        style={{ cursor: 'pointer', fontSize: '1rem' }}
                      ></i>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={editable ? 4 : 3} className="text-center text-muted py-3">
                    Nenhum gol registrado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};
