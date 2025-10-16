import React from 'react';
import { Button } from 'react-bootstrap';

interface MatchDescriptionProps {
  description?: string;
}

const MatchDescription: React.FC<MatchDescriptionProps> = ({ description }) => {
  if (!description) return null;

  return (
    <div className="match-description">
      <h3>Descrição</h3>
      <p>{description}</p>
    </div>
  );
};

export default MatchDescription;
