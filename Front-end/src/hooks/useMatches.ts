import { useState, useEffect } from 'react';
import { matchService, Match } from '../services/matchService';

interface User {
  id: number;
  token: string;
  userTypeId: number;
}

export const useMatches = (currentUser: User) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    try {
      const token = currentUser.token || localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        return;
      }

      const data = await matchService.fetchMatches(token);
      // Mantém somente partidas criadas pelo usuário logado
      const onlyMine = currentUser?.id
        ? data.filter((m: Match) => m.organizerId === currentUser.id)
        : [];
      setMatches(onlyMine);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar partidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return { matches, loading, error, refetch: fetchMatches };
};