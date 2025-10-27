import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface TeamActionButtonsProps {
  teamId: number;
  playerStats: any[] | null;
  loadingReport: boolean;
  onGenerateReport: () => void;
  onDownloadPDF: () => void;
  className?: string;
}

const TeamActionButtons: React.FC<TeamActionButtonsProps> = ({
  teamId,
  playerStats,
  loadingReport,
  onGenerateReport,
  onDownloadPDF,
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <div className={`team-bottom-actions ${className}`}>
      <button
        className="edit-team-btn"
        onClick={() => navigate(`/teams/edit/${teamId}`)}
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar meu time
      </button>

      <button
        className="edit-team-btn"
        onClick={onGenerateReport}
        disabled={loadingReport}
      >
        <BarChartIcon sx={{ mr: 1 }} />
        {loadingReport ? 'Gerando…' : 'Gerar relatório de jogadores'}
      </button>

      {playerStats && playerStats.length > 0 && (
        <button
          className="edit-team-btn"
          onClick={onDownloadPDF}
        >
          <TrendingUpIcon sx={{ mr: 1 }} />
          Baixar PDF
        </button>
      )}
    </div>
  );
};

export default TeamActionButtons;