import React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import SportsIcon from '@mui/icons-material/Sports';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';

interface HistoricoData {
  amistosos?: number;
  campeonatos?: number;
  vitoriasGeral?: number;
  derrotasGeral?: number;
  empatesGeral?: number;
  aproveitamentoCampeonatos?: number;
  aproveitamentoAmistosos?: number;
}

interface TeamStatsProps {
  historico: HistoricoData | null;
  primaryColor?: string;
}

const TeamStats: React.FC<TeamStatsProps> = ({ historico, primaryColor = '#29b6f6' }) => {
  return (
    <div className="team-stats-wrapper">
      <h3 className="team-section-title">
        <BarChartIcon style={{ marginRight: 8, color: primaryColor }} />
        Estatísticas do Time
      </h3>
      <div className="team-stats-grid" onClick={() => window.location.href = "/historico"}>
        <div className="team-stat-card" title="Partidas disputadas">
          <SportsIcon className="stat-icon" />
          <div className="stat-value">{historico?.amistosos || 0}</div>
          <div className="stat-label">Amistosos participados</div>
        </div>
        <div className="team-stat-card" title="Campeonatos inscritos">
          <MilitaryTechIcon className="stat-icon" />
          <div className="stat-value">{historico?.campeonatos || 0}</div>
          <div className="stat-label">Campeonatos Participados</div>
        </div>
        <div className="team-stat-card" title="Vitórias">
          <TrendingUpIcon className="stat-icon" />
          <div className="stat-value" style={{ color: '#4caf50' }}>
            {historico?.vitoriasGeral || 0}
          </div>
          <div className="stat-label">Vitórias</div>
        </div>
        <div className="team-stat-card" title="Derrotas">
          <WhatshotIcon className="stat-icon" />
          <div className="stat-value" style={{ color: '#ef5350' }}>
            {historico?.derrotasGeral || 0}
          </div>
          <div className="stat-label">Derrotas</div>
        </div>
        <div className="team-stat-card" title="Empates">
          <WhatshotIcon className="stat-icon" />
          <div className="stat-value" style={{ color: '#f0eaea65' }}>
            {historico?.empatesGeral || 0}
          </div>
          <div className="stat-label">Empates</div>
        </div>
        <div className="team-stat-card wide" title="% de aproveitamento (vitórias/partidas)">
          <TrendingUpIcon className="stat-icon" />
          <div className="stat-value">{historico?.aproveitamentoCampeonatos || 0}%</div>
          <div className="stat-label">Aproveitamento em Campeonatos</div>
        </div>
        <div className="team-stat-card wide" title="% de aproveitamento (vitórias/partidas)">
          <TrendingUpIcon className="stat-icon" />
          <div className="stat-value">{historico?.aproveitamentoAmistosos || 0}%</div>
          <div className="stat-label">Desempenho em amistosos</div>
        </div>
      </div>
    </div>
  );
};

export default TeamStats;