import React from 'react';

interface SumulaHeaderProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  isSaved: boolean;
}

export const SumulaHeader: React.FC<SumulaHeaderProps> = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  isSaved
}) => {
  return (
    <div className="scoreboard text-center my-3">
      <h4 style={{ color: "black" }}>
        {homeTeamName} {homeScore} x {awayScore} {awayTeamName}
      </h4>
      {isSaved && (
        <div className="text-success mt-2">
          <strong>✓ Súmula validada e salva</strong>
        </div>
      )}
    </div>
  );
};
