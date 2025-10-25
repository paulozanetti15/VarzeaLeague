import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './MatchInfo.css';

interface MatchInfoProps {
  match: any;
}

export const MatchInfo: React.FC<MatchInfoProps> = ({ match }) => {
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) {
      if (match?.date && match.date.includes(' ')) {
        const timePart = match.date.split(' ')[1];
        return timePart.slice(0, 5);
      }
      return 'Horário não informado';
    }
    return timeString.slice(0, 5);
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return 'Gratuito';
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="match-info">
      <div className="info-row">
        <div className="info-label">Data:</div>
        <div className="info-value">{formatDate(match.date)}</div>
      </div>

      <div className="info-row">
        <div className="info-label">Horário:</div>
        <div className="info-value">{formatTime(match.time)}</div>
      </div>

      {match.duration && (
        <div className="info-row">
          <div className="info-label">Duração:</div>
          <div className="info-value">{match.duration}</div>
        </div>
      )}

      <div className="info-row">
        <div className="info-label">Nome Quadra:</div>
        <div className="info-value">
          {match.nomequadra || 'Nome da quadra não informado'}
        </div>
      </div>

      <div className="info-row">
        <div className="info-label">Local:</div>
        <div className="info-value">
          {match.location?.address || 
           (typeof match.location === 'string' ? match.location : 'Endereço não informado')}
        </div>
      </div>

      <div className="info-row">
        <div className="info-label">Modalidade:</div>
        <div className="info-value">
          {match.modalidade || 'Modalidade não informada'}
        </div>
      </div>

      <div className="info-row">
        <div className="info-label">Valor da quadra:</div>
        <div className="info-value">{formatPrice(match.price)}</div>
      </div>
    </div>
  );
};
