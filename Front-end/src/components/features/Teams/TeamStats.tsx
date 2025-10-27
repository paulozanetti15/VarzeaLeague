import React from 'react';
import { motion } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import SportsIcon from '@mui/icons-material/Sports';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';

interface TeamStatsProps {
  historico: {
    amistosos?: number;
    campeonatos?: number;
    vitoriasGeral?: number;
    derrotasGeral?: number;
    empatesGeral?: number;
    aproveitamentoCampeonatos?: number;
    aproveitamentoAmistosos?: number;
  } | null;
  primaryColor?: string;
  className?: string;
}

const TeamStats: React.FC<TeamStatsProps> = ({
  historico,
  primaryColor = '#29b6f6',
  className = ''
}) => {
  const stats = [
    {
      icon: <SportsIcon className="stat-icon" />,
      value: historico?.amistosos || 0,
      label: 'Amistosos participados',
      title: 'Partidas disputadas'
    },
    {
      icon: <MilitaryTechIcon className="stat-icon" />,
      value: historico?.campeonatos || 0,
      label: 'Campeonatos Participados',
      title: 'Campeonatos inscritos'
    },
    {
      icon: <TrendingUpIcon className="stat-icon" />,
      value: historico?.vitoriasGeral || 0,
      label: 'Vitórias',
      title: 'Vitórias',
      valueStyle: { color: '#4caf50' }
    },
    {
      icon: <WhatshotIcon className="stat-icon" />,
      value: historico?.derrotasGeral || 0,
      label: 'Derrotas',
      title: 'Derrotas',
      valueStyle: { color: '#ef5350' }
    },
    {
      icon: <WhatshotIcon className="stat-icon" />,
      value: historico?.empatesGeral || 0,
      label: 'Empates',
      title: 'Empates',
      valueStyle: { color: '#f0eaea65' }
    },
    {
      icon: <TrendingUpIcon className="stat-icon" />,
      value: `${historico?.aproveitamentoCampeonatos || 0}%`,
      label: 'Aproveitamento em Campeonatos',
      title: '% de aproveitamento (vitórias/partidas)',
      isWide: true
    },
    {
      icon: <TrendingUpIcon className="stat-icon" />,
      value: `${historico?.aproveitamentoAmistosos || 0}%`,
      label: 'Desempenho em amistosos',
      title: '% de aproveitamento (vitórias/partidas)',
      isWide: true
    }
  ];

  return (
    <div className={`team-stats-wrapper ${className}`}>
      <h3 className="team-section-title">
        <BarChartIcon
          style={{ marginRight: 8, color: primaryColor }}
        />
        Estatísticas do Time
      </h3>
      <div
        className="team-stats-grid"
        onClick={() => window.location.href = "/historico"}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`team-stat-card ${stat.isWide ? 'wide' : ''}`}
            title={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: index * 0.05, duration: 0.3 }
            }}
          >
            {stat.icon}
            <div
              className="stat-value"
              style={stat.valueStyle}
            >
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamStats;