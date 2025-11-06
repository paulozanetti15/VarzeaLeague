import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface Team {
  id: number;
  name: string;
}

export const useTeamCaptain = () => {
  const [team, setTeam] = useState<Team>({ id: 0, name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const idUser = parseInt(user.id);
        const token = localStorage.getItem('token');

        if (!user.id || !token) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/teams/${idUser}/teamCaptain`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTeam({ id: response.data.id, name: response.data.name });
      } catch (err) {
        console.error('Erro ao buscar time:', err);
        setError('Erro ao buscar time');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return { team, loading, error };
};