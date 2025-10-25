import React from 'react';

interface OrganizerBadgeProps {
  isOrganizer: boolean;
}

export const OrganizerBadge: React.FC<OrganizerBadgeProps> = ({ isOrganizer }) => {
  if (!isOrganizer) return null;

  return (
    <div className="organizer-badge" style={{ color: '#050505ff' }}>
      Você é o organizador
    </div>
  );
};