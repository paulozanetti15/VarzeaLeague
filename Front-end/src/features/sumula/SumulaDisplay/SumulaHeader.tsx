import React from 'react';

interface SumulaHeaderProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
}

export const SumulaHeader: React.FC<SumulaHeaderProps> = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore
}) => {
  return (
    <div className="scoreboard text-center text-white bg-primary" style={{ backgroundColor: '#1976d2 !important', color: 'white !important' }}>
      <h4 className="text-white" style={{ color: 'white !important', margin: 0 }}>
        {homeTeamName} {homeScore} x {awayScore} {awayTeamName}
      </h4>
    </div>
  );
};
