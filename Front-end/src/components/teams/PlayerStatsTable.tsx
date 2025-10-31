import React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import type { PlayerStats } from '../../interfaces/team';

interface PlayerStatsTableProps {
  playerStats: PlayerStats[];
  primaryColor?: string;
}

const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({
  playerStats,
  primaryColor = '#29b6f6'
}) => {
  if (!playerStats || playerStats.length === 0) {
    return (
      <div className="team-stats-wrapper">
        <h3 className="team-section-title">
          <BarChartIcon style={{ marginRight: 8, color: primaryColor }} />
          Estatísticas por Jogador
        </h3>
        <div className="team-no-players">
          <p>Nenhuma estatística encontrada para os jogadores deste time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-stats-wrapper">
      <h3 className="team-section-title">
        <BarChartIcon style={{ marginRight: 8, color: primaryColor }} />
        Estatísticas por Jogador
      </h3>
      <div className="table-container">
        <table className="team-stats-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Jogador</th>
              <th>Posição</th>
              <th>Sexo</th>
              <th>Gols</th>
              <th>Cartões Amarelo</th>
              <th>Cartões Vermelho</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map((p, idx) => (
              <tr key={`${p.playerId}-${idx}`}>
                <td style={{ textAlign: 'left' }}>{p.nome || '-'}</td>
                <td>{p.posicao || '-'}</td>
                <td>{p.sexo || '-'}</td>
                <td>{p.gols || 0}</td>
                <td>{p.amarelos || 0}</td>
                <td>{p.vermelhos || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerStatsTable;