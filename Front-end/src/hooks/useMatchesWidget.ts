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
  status: 'upcoming' | 'live' | 'finished';
  championship?: string;
  championshipLogo?: string;
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
        const processedMatches = matchesData
          .map((match: any) => {
          let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
          switch (match.status) {
            case 'em_andamento':
              status = 'live';
              break;
            case 'finalizada':
              status = 'finished';
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
              banner: teams[0].team?.banner || undefined
            };
            awayTeam = {
              id: teams[1].team?.id || 0,
              name: teams[1].team?.name || 'Time Visitante',
              banner: teams[1].team?.banner || undefined
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
              banner: teams[0].team?.banner || undefined
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
            championshipLogo: match.matchChampionship?.championship?.logo || undefined,
            location: match.location,
            round: match.matchChampionship ? `Rodada ${match.matchChampionship.Rodada}` : 'amistosa',
            category: match.modalidade || match.matchChampionship?.championship?.modalidade || 'Futebol'
          };
        })
        .sort((a: Match, b: Match) => {
          // Ordenar por data (mais próximas primeiro)
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
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