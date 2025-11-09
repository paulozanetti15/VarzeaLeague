import { useEffect, useState } from 'react';
import { fetchMatches, fetchMatchesFiltered } from '../services/matchesFriendlyServices'; 

interface Match {
  id: number;
  date: string;
  time: string;
  homeTeam: {
    id: number;
    name: string;
    banner?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    banner?: string;
  };
  score?: {
    home: number;
    away: number;
  };
  status: 'upcoming' | 'live' | 'finished' | 'sem_vagas' | 'aberta' | 'cancelada';
  championship?: string;
  location?: string;
  round?: string;
  category?: string;
}

export const useMatchesWidget = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      console.log('Iniciando carregamento de partidas amistosas...');
      const matchesData = await fetchMatches();
      console.log('Dados recebidos:', matchesData);
      console.debug('raw matchesData:', matchesData);
      if (matchesData && matchesData.length > 0) {
        const processedMatches = matchesData.map((match: any) => {
          let status: 'upcoming' | 'live' | 'finished' | 'sem_vagas' | 'aberta' | 'cancelada' = 'upcoming';
          switch (match.status) {
            case 'em_andamento':
              status = 'live';
              break;
            case 'finalizada':
            case 'finalizado':
              status = 'finished';
              break;
            case 'sem_vagas':
              status = 'sem_vagas';
              break;
            case 'aberta':
              status = 'aberta';
              break;
            case 'cancelada':
              status = 'cancelada';
              break;
            default:
              status = 'upcoming';
          }

          const teams = match.matchTeams || [];
          let homeTeam: any, awayTeam: any;

          if (teams.length >= 2) {
            homeTeam = {
              id: teams[0].team?.id || 0,
              name: teams[0].team?.name || 'Time Casa',
              banner: undefined
            };
            awayTeam = {
              id: teams[1].team?.id || 0,
              name: teams[1].team?.name || 'Time Visitante',
              banner: undefined
            };

            // Ordenar alfabeticamente se ambos os times existem
            if (homeTeam?.name && awayTeam?.name) {
              const a = homeTeam.name.toLowerCase();
              const b = awayTeam.name.toLowerCase();
              if (a > b) {
                const tmp = homeTeam;
                homeTeam = awayTeam;
                awayTeam = tmp;
              }
            }
          } else if (teams.length === 1) {
            homeTeam = {
              id: teams[0].team?.id || 0,
              name: teams[0].team?.name || match.title || 'Time Casa',
              banner: undefined
            };
            awayTeam = {
              id: 0,
              name: 'Aberto',
              banner: undefined
            };
          } else {
            // Sem times inscritos: para amistosa mostrar título da partida
            const matchTitle = match.title || 'Partida Amistosa';
            homeTeam = {
              id: match.organizer?.id || 0,
              name: matchTitle,
              banner: undefined
            };
            awayTeam = {
              id: 0,
              name: 'Aberto',
              banner: undefined
            };
          }

          return {
            id: match.id,
            date: new Date(match.date).toISOString(),
            time: new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            score: undefined,
            status: status,
            championship: (!match.matchChampionship) ? (match.title || 'Partida Amistosa') : (match.matchChampionship?.championship?.name || match.title || 'Partida'),
            location: match.location,
            round: 'amistosa',
            category: match.modalidade || 'Futebol'
          };
        });
        setMatches(processedMatches);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados das partidas amistosas:', error);
      console.error('Detalhes do erro:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { matches, loading };
};