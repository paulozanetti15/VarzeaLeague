import React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';

interface PlayerStats {
  playerId?: number | string;
  nome?: string;
  posicao?: string;
  sexo?: string;
  gols?: number;
  amarelos?: number;
  vermelhos?: number;
}

interface PlayerStatsTableProps {
  playerStats: PlayerStats[] | null;
  primaryColor?: string;
  className?: string;
}

const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({
  playerStats,
  primaryColor = '#29b6f6',
  className = ''
}) => {
  if (!playerStats) return null;

  return (
    <div className={`team-stats-wrapper ${className}`}>
      <h3 className="team-section-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <BarChartIcon style={{ marginRight: 8, color: primaryColor }} />
        Estatísticas por Jogador
      </h3>

      {playerStats.length === 0 ? (
        <div className="team-no-players">
          <p>Nenhuma estatística encontrada para os jogadores deste time.</p>
        </div>
      ) : (
        <div className="team-stats-table-container">
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
              {playerStats.map((p: PlayerStats, idx: number) => (
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
      )}
    </div>
  );
};

export default PlayerStatsTable;