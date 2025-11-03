import { useState, useEffect } from 'react';
import axios from 'axios';

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  yellowCards?: number;
  activeSuspension?: any;
  details?: string;
}

export const usePlayerEligibility = (
  playerId: number | null,
  matchId: number | null,
  isChampionship: boolean = false
) => {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async () => {
    if (!playerId || !matchId) {
      setEligibility(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await axios.get(
        `http://localhost:3001/api/players/${playerId}/eligibility/${matchId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { isChampionship: isChampionship.toString() },
        }
      );

      setEligibility(response.data);
    } catch (err: any) {
      console.error('Erro ao verificar elegibilidade:', err);
      setError(err.response?.data?.error || 'Erro ao verificar elegibilidade');
      setEligibility(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEligibility();
  }, [playerId, matchId, isChampionship]);

  return {
    eligibility,
    loading,
    error,
    refetch: checkEligibility,
  };
};

export default usePlayerEligibility;
