import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDuration } from '../../../utils/formUtils';

interface MatchInfoSectionProps {
  match: any;
}

const MatchInfoSection: React.FC<MatchInfoSectionProps> = ({ match }) => {
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

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'Horário não informado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Horário inválido';
      return format(date, 'HH:mm');
    } catch (error) {
      return 'Horário inválido';
    }
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined || price === 0) return 'Gratuito';
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="match-info">
      <div className="info-row">
        <div className="info-label">Data:</div>
        <div className="info-value">{formatDate(match?.date)}</div>
      </div>

      <div className="info-row">
        <div className="info-label">Horário:</div>
        <div className="info-value">{formatTime(match?.date)}</div>
      </div>

      {match?.duration && (
        <div className="info-row">
          <div className="info-label">Duração:</div>
          <div className="info-value">{formatDuration(match.duration)}</div>
        </div>
      )}

      <div className="info-row">
        <div className="info-label">Nome Quadra:</div>
        <div className="info-value">
          {match?.square || 'Nome da quadra não informado'}
        </div>
      </div>

      <div className="info-row">
        <div className="info-label">Local:</div>
        <div className="info-value">
          {match?.location?.address || (typeof match?.location === 'string' ? match.location : 'Endereço não informado')}
        </div>
      </div>

      <div className="info-row">
        <div className="info-label">Modalidade:</div>
        <div className="info-value">
          {match?.matchType || match?.modalidade || 'Modalidade não informada'}
        </div>
      </div>

      <div className="info-row">
        <div className="info-label">Valor da quadra:</div>
        <div className="info-value">
          {formatPrice(match?.price)}
        </div>
      </div>
    </div>
  );
};

export default MatchInfoSection;
