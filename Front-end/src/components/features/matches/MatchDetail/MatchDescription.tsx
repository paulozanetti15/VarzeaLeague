import React from 'react';
import { Button } from 'react-bootstrap';

interface MatchDescriptionProps {
  description?: string;
}

const MatchDescription: React.FC<MatchDescriptionProps> = ({ description }) => {
  if (!description) return null;

  const cleanDescription = description.replace(/\[CANCELADA:.*?\]\s*/g, '').trim();
  
  if (!cleanDescription) return null;

  return (
    <div className="match-description" style={{ textAlign: 'center' }}>
      <h3>Descrição</h3>
      <p>{cleanDescription}</p>
    </div>
  );
};

export default MatchDescription;
