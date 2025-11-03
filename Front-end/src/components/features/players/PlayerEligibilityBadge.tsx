import React, { useEffect, useState } from 'react';
import { Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Warning, Block } from '@mui/icons-material';
import axios from 'axios';

interface PlayerEligibilityBadgeProps {
  playerId: number;
  matchId: number;
  isChampionship?: boolean;
  showDetails?: boolean;
}

interface EligibilityData {
  eligible: boolean;
  reason?: string;
  yellowCards?: number;
  activeSuspension?: any;
  details?: string;
}

export const PlayerEligibilityBadge: React.FC<PlayerEligibilityBadgeProps> = ({
  playerId,
  matchId,
  isChampionship = false,
  showDetails = true,
}) => {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `http://localhost:3001/api/players/${playerId}/eligibility/${matchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { isChampionship: isChampionship.toString() },
          }
        );

        setEligibility(response.data);
      } catch (error) {
        console.error('Erro ao verificar elegibilidade:', error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId && matchId) {
      fetchEligibility();
    }
  }, [playerId, matchId, isChampionship]);

  if (loading) {
    return null;
  }

  if (!eligibility) {
    return null;
  }

  if (eligibility.eligible) {
    const hasWarning = eligibility.yellowCards && eligibility.yellowCards >= 2;
    
    if (hasWarning) {
      const tooltip = (
        <Tooltip id={`eligibility-tooltip-${playerId}`}>
          {eligibility.yellowCards} cartão(ões) amarelo(s). Próximo cartão = suspensão!
        </Tooltip>
      );

      return (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <Badge bg="warning" className="ms-2">
            <Warning fontSize="small" style={{ marginRight: 4 }} />
            {showDetails && `${eligibility.yellowCards} amarelos`}
          </Badge>
        </OverlayTrigger>
      );
    }

    if (showDetails && eligibility.yellowCards && eligibility.yellowCards > 0) {
      return (
        <Badge bg="info" className="ms-2" style={{ fontSize: '0.75rem' }}>
          {eligibility.yellowCards} amarelo(s)
        </Badge>
      );
    }

    return null;
  }

  const tooltip = (
    <Tooltip id={`eligibility-tooltip-${playerId}`}>
      <div>
        <strong>Jogador Suspenso</strong>
        <br />
        {eligibility.details || eligibility.reason}
      </div>
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <Badge bg="danger" className="ms-2">
        <Block fontSize="small" style={{ marginRight: 4 }} />
        {showDetails && 'Suspenso'}
      </Badge>
    </OverlayTrigger>
  );
};

export default PlayerEligibilityBadge;
