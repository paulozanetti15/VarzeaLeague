import { useEffect, useState } from 'react';
import { fetchMatches } from '../../services/matchesFriendlyServices';
import { useNavigate } from 'react-router-dom';
import './MatchesWidgetFixed.css';

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
  location?: string;
}

export function MatchesWidgetFixed() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const navigate = useNavigate();

  // Função para obter o dia de hoje normalizado
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Função para filtrar jogos por data específica
  const getMatchesForDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return matches.filter(match => {
      if (!match.date) return false;
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);

      const isSameDay = matchDate.getTime() === normalizedDate.getTime();

      if (isSameDay) {
        return match.status === 'live' || match.status === 'upcoming' || match.status === 'finished';
      }

      return false;
    });
  };

  // Função para obter jogos do dia atual ou próximos se não houver
  const getTodayMatches = () => {
    const todayMatches = getMatchesForDate(getToday());

    // Se não há jogos hoje, buscar próximos jogos
    if (todayMatches.length === 0) {
      const upcoming = getUpcomingMatches();
      return upcoming.length > 0 ? upcoming.slice(0, 4) : getMockMatches().slice(0, 4);
    }

    return todayMatches.slice(0, 4);
  };

  // Função para obter próximos jogos
  const getUpcomingMatches = () => {
    const today = getToday();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return matches.filter(match => {
      if (!match.date) return false;
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate >= today && matchDate <= nextWeek && match.status === 'upcoming';
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Garantir que sempre inicie no dia de hoje
  useEffect(() => {
    const today = getToday();
    setSelectedDate(today);
  }, []);

  // Event listeners para arrastar
  useEffect(() => {
    // Removido - funcionalidade simplificada
  }, []);

  const loadData = async () => {
    try {
      const matchesData = await fetchMatches();
      if (matchesData && matchesData.length > 0) {
        const processedMatches = matchesData.map((match: any) => ({
          id: match.id,
          date: new Date(match.date).toISOString(),
          time: new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          homeTeam: {
            id: match.organizer?.id || 0,
            name: match.organizer?.name || 'Organizador',
            banner: undefined
          },
          awayTeam: {
            id: 0,
            name: 'Time Adversário',
            banner: undefined
          },
          score: undefined,
          status: 'upcoming' as 'upcoming' | 'live' | 'finished',
          championship: match.title || 'Partida Amistosa',
          location: match.location
        }));
        setMatches(processedMatches);
      } else {
        setMatches(getMockMatches());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMatches(getMockMatches());
    } finally {
      setLoading(false);
    }
  };

  const getMockMatches = (): Match[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const saturday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    const fmtTime = (d: Date, hours: number, minutes: number) => {
      const dt = new Date(d);
      dt.setHours(hours, minutes, 0, 0);
      return dt.toISOString();
    };

    return [
      {
        id: 1,
        date: fmtTime(today, 19, 0),
        time: '19:00',
        homeTeam: { id: 1, name: 'Lucato FC' },
        awayTeam: { id: 2, name: 'Atlético Micas' },
        status: 'upcoming',
        championship: 'Campeonato Brasileiro',
        location: 'Maracanã'
      },
      {
        id: 2,
        date: fmtTime(today, 21, 0),
        time: '21:00',
        homeTeam: { id: 3, name: 'PZFC' },
        awayTeam: { id: 4, name: 'Rafa Perfeita' },
        status: 'upcoming',
        championship: 'Paulistão 2025',
        location: 'Allianz Parque'
      },
      {
        id: 3,
        date: fmtTime(tomorrow, 16, 0),
        time: '16:00',
        homeTeam: { id: 5, name: 'Lucato FC' },
        awayTeam: { id: 6, name: 'PZFC' },
        status: 'upcoming',
        championship: 'Copa Libertadores',
        location: 'Vila Belmiro'
      },
      {
        id: 4,
        date: fmtTime(tomorrow, 18, 30),
        time: '18:30',
        homeTeam: { id: 7, name: 'Atlético Micas' },
        awayTeam: { id: 8, name: 'Rafa Perfeita' },
        status: 'upcoming',
        championship: 'Cariocão 2025',
        location: 'São Januário'
      },
      {
        id: 5,
        date: fmtTime(saturday, 15, 0),
        time: '15:00',
        homeTeam: { id: 9, name: 'PZFC' },
        awayTeam: { id: 10, name: 'Lucato FC' },
        status: 'upcoming',
        championship: 'Campeonato Brasileiro',
        location: 'Nilton Santos'
      },
      {
        id: 6,
        date: fmtTime(saturday, 17, 30),
        time: '17:30',
        homeTeam: { id: 11, name: 'Rafa Perfeita' },
        awayTeam: { id: 12, name: 'Atlético Micas' },
        status: 'upcoming',
        championship: 'Série A',
        location: 'Beira-Rio'
      },
      {
        id: 7,
        date: fmtTime(sunday, 16, 0),
        time: '16:00',
        homeTeam: { id: 13, name: 'Lucato FC' },
        awayTeam: { id: 14, name: 'Rafa Perfeita' },
        status: 'upcoming',
        championship: 'Brasileirão',
        location: 'Arena da Baixada'
      },
      {
        id: 8,
        date: fmtTime(sunday, 18, 30),
        time: '18:30',
        homeTeam: { id: 15, name: 'Atlético Micas' },
        awayTeam: { id: 16, name: 'PZFC' },
        status: 'upcoming',
        championship: 'Cearense',
        location: 'Castelão'
      }
    ];
  };

  const getGameStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return '🔴';
      case 'finished': return '✅';
      default: return '⏰';
    }
  };

  const getGameStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'AO VIVO';
      case 'finished': return 'FINALIZADO';
      default: return 'PRÓXIMO';
    }
  };

  const formatMatchDate = (isoDate?: string) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    d.setHours(0, 0, 0, 0);
    const today = getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.getTime() === today.getTime()) return 'Hoje';
    if (d.getTime() === tomorrow.getTime()) return 'Amanhã';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2 className="loading-title">Carregando dados...</h2>
        <p className="loading-message">Aguarde enquanto carregamos as partidas...</p>
      </div>
    );
  }

  return (
    <div className="matches-widget-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            A plataforma completa para organizar seu futebol
          </h1>
          <p className="hero-description">
            Gerencie times, agende partidas, organize campeonatos e acompanhe estatísticas.
            Tudo em um só lugar para você se concentrar no que realmente importa: <strong>jogar futebol</strong>.
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="content-container">
        {/* Seção: Jogos em Destaque */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Jogos em Destaque</h2>
            <p className="section-description">
              Acompanhe as principais partidas e eventos do futebol
            </p>
          </div>

          {/* Container principal */}
          <div className="cards-container">
            {/* Área dos cards */}
            <div className="cards-area">
              <div className="cards-wrapper">
                {getTodayMatches().slice(0, 4).map((match) => (
                  <div
                    key={match.id}
                    className="match-card"
                    onClick={() => navigate(`/matches/${match.id}`)}
                  >
                    {/* Header Compacto */}
                    <div className="card-header-compact">
                      <div className="championship-badge">{match.championship}</div>
                      <div className={`status-pill ${match.status}`}>
                        {match.status === 'live' && <span className="live-dot"></span>}
                        {match.status === 'live' ? 'AO VIVO' :
                         match.status === 'finished' ? 'ENCERRADO' : 'PRÓXIMO'}
                      </div>
                    </div>

                    {/* Informação de Data e Hora */}
                    <div className="match-datetime">
                      <i className="far fa-calendar"></i>
                      <span>{formatMatchDate(match.date)} • {match.time}</span>
                    </div>

                    {/* Times Confronto */}
                    <div className="teams-confrontation">
                      {/* Time Casa */}
                      <div className="team-info">
                        <div className="team-logo-placeholder">
                          <i className="fas fa-shield-alt"></i>
                        </div>
                        <span className="team-name-compact">{match.homeTeam.name}</span>
                      </div>

                      {/* VS Central */}
                      <div className="vs-divider">
                        <span className="vs-text">VS</span>
                        {match.score && (
                          <div className="score-compact">
                            {match.score.home} - {match.score.away}
                          </div>
                        )}
                      </div>

                      {/* Time Visitante */}
                      <div className="team-info">
                        <div className="team-logo-placeholder">
                          <i className="fas fa-shield-alt"></i>
                        </div>
                        <span className="team-name-compact">{match.awayTeam.name}</span>
                      </div>
                    </div>

                    {/* Footer com Local */}
                    {match.location && (
                      <div className="card-footer-compact">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{match.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Agenda Inteligente */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Agenda de Partidas</h2>
            <p className="section-description">
              Acompanhe jogos e eventos do futebol. Selecione uma data para ver as partidas.
            </p>
          </div>

          {/* Lista de Partidas */}
          <div className="matches-list">
            {getMatchesForDate(selectedDate).length > 0 ? (
              getMatchesForDate(selectedDate).slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  className="match-list-item"
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  <div className="match-time">
                    <span>{match.time}</span>
                  </div>

                  <div className="match-details">
                    <div className="match-teams">
                      <span className="team-home">{match.homeTeam.name}</span>
                      <span className="vs-indicator">x</span>
                      <span className="team-away">{match.awayTeam.name}</span>
                    </div>
                    <div className="match-meta">
                      <span className="championship-label">{match.championship}</span>
                      {match.location && (
                        <span className="location-label">📍 {match.location}</span>
                      )}
                    </div>
                  </div>

                  <div className="match-status-display">
                    <span className={`status-indicator ${match.status}`}>
                      {getGameStatusIcon(match.status)} {getGameStatusText(match.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚽</div>
                <h3 className="empty-title">Nenhuma partida encontrada</h3>
                <p className="empty-message">Não há jogos programados para esta data.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}