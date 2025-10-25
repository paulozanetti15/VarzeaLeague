import React from 'react';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

interface MatchHeaderProps {
  title: string;
  organizerName: string;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({ title, organizerName }) => {
  return (
    <div className="match-header">
      <h1>{title}</h1>
      <div className="match-organizer">
        <SportsSoccerIcon /> Organizado por: {organizerName || 'Desconhecido'}
      </div>
    </div>
  );
};

export default MatchHeader;
