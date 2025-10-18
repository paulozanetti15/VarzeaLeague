import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Goal } from '../types';

interface GoalsTableProps {
  goals: Goal[];
}

export const GoalsTable: React.FC<GoalsTableProps> = ({ goals }) => {
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
                <th>Jogador</th>
                <th>Time</th>
                <th>Minuto</th>
              </tr>
            </thead>
            <tbody>
              {goals.length > 0 ? goals.map((goal, index) => (
                <tr key={index}>
                  <td className="fw-semibold">
                    <div className="text-truncate" title={goal.player}>
                      {goal.player}
                    </div>
                  </td>
                  <td>
                    <div className="text-truncate" title={goal.team}>
                      {goal.team}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-success">{goal.minute}'</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-3">
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
