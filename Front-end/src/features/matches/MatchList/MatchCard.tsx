import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { GiSoccerField } from "react-icons/gi";
import { FaFutbol } from 'react-icons/fa';
import { formatDuration } from '../../../utils/formUtils';
import { OrganizerBadge } from './OrganizerBadge';

interface MatchCardProps {
  match: Match;
  currentUserId: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, currentUserId }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastMatch = (matchDate: string) => {
    const date = new Date(matchDate);
    return date < new Date();
  };

  return (
    <div
      className="match-card"
      onClick={() => navigate(`/matches/${match.id}`)}
      data-match-id={match.id}
    >
      <div className="match-card-corner"></div>
      <div className="match-card-inner">
        <div className="match-card-gradient"></div>
        <div className="match-header">
          <h2 className="match-title">{match.title}</h2>
        </div>

        <div className="match-info">
          <div className="info-row" style={{color: '#ffffff'}}>
            <EventIcon fontSize="small" />
            <strong>Data:</strong> {formatDate(match.date)}
          </div>
          <div className="info-row" style={{color: '#ffffff'}}>
            <AccessTimeIcon fontSize="small" />
            <strong>Hora:</strong> {formatTime(match.date)}
          </div>
          {match.duration && (
            <div className="info-row" style={{color: '#ffffff'}}>
              <AccessTimeIcon fontSize="small" />
              <strong>Duração:</strong> {formatDuration(match.duration)}
            </div>
          )}
          <div className='info-row' style={{color: '#ffffff'}}>
            <GiSoccerField fontSize={"medium"}/>
            <strong>Quadra:</strong> {match.nomequadra}
          </div>
          <div className="info-row" style={{color: '#ffffff'}}>
            <LocationOnIcon fontSize="small" />
            <strong>Local:</strong> {match.location}
          </div>
          <div className="info-row" style={{color: '#ffffff'}}>
            <FaFutbol fontSize="small" />
            <strong>Modalidade:</strong> {match.modalidade}
          </div>
        </div>

        {match.price && (
          <div className="match-price">
            <span>💰</span> R$ {(() => {
              try {
                return typeof match.price === 'number'
                  ? match.price.toFixed(2)
                  : parseFloat(String(match.price)).toFixed(2);
              } catch (e) {
                return '0.00';
              }
            })()
            } por jogador
          </div>
        )}

        <div className="match-action-container">
          {!isPastMatch(match.date) &&
           (match.status === 'aberta' || match.status === 'finalizada') &&
           match.organizerId !== currentUserId && (
            <div className="match-full-message">
            </div>
          )}
          <OrganizerBadge isOrganizer={match.organizerId === currentUserId} />
        </div>
      </div>
    </div>
  );
};