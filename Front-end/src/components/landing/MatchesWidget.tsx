import { useEffect, useState } from 'react';
import { fetchMatches } from '../../services/matchesFriendlyServices';
import {getAllChampionships} from '../../services/championshipsServices';
import { useNavigate } from 'react-router-dom';
import './MatchesWidget.css';

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

interface Championship {
  id: number;
  name: string;
  teams: Array<{
    id: number;
    name: string;
    points: number;
    position: number;
    lastGames: Array<'win' | 'loss' | 'draw'>;
  }>;
}

export function MatchesWidget() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Debug: verificar se o componente está sendo renderizado
  console.log('MatchesWidget renderizado, loading:', loading);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Tentar carregar dados reais
      const [matchesData, championshipsData] = await Promise.allSettled([
        fetchMatches(),
        getAllChampionships()
      ]);

      if (matchesData.status === 'fulfilled' && matchesData.value?.length > 0) {
        const processedMatches = matchesData.value.slice(0, 4).map((match: any) => ({
          id: match.id,
          date: new Date(match.date).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          time: new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          homeTeam: {
            id: match.homeTeam?.id || 0,
            name: match.homeTeam?.name || 'Time A',
            banner: match.homeTeam?.banner
          },
          awayTeam: {
            id: match.awayTeam?.id || 0,
            name: match.awayTeam?.name || 'Time B',
            banner: match.awayTeam?.banner
          },
          score: match.score ? { home: match.score.home, away: match.score.away } : undefined,
          status: match.status || 'upcoming',
          championship: match.championship?.name || 'Campeonato Local',
          location: match.location
        }));
        setMatches(processedMatches);
      } else {
        // Usar dados mockados se não houver dados reais
        setMatches(getMockMatches());
      }

      if (championshipsData.status === 'fulfilled' && championshipsData.value?.length > 0) {
        const processedChampionships = championshipsData.value.slice(0, 1).map((champ: any) => ({
          id: champ.id,
          name: champ.name,
          teams: champ.teams?.slice(0, 5).map((team: any, index: number) => ({
            id: team.id,
            name: team.name,
            points: Math.floor(Math.random() * 20) + 40,
            position: index + 1,
            lastGames: ['win', 'win', 'loss', 'win', 'draw'].slice(0, 5)
          })) || []
        }));
        setChampionships(processedChampionships);
      } else {
        // Usar dados mockados se não houver dados reais
        setChampionships([getMockChampionship()]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Usar dados mockados em caso de erro
      setMatches(getMockMatches());
      setChampionships([getMockChampionship()]);
    } finally {
      setLoading(false);
    }
  };

  const getMockMatches = (): Match[] => [
    {
      id: 1,
      date: 'Hoje',
      time: '19:00',
      homeTeam: { id: 1, name: 'Real Madrid FC' },
      awayTeam: { id: 2, name: 'Barcelona United' },
      status: 'upcoming',
      championship: 'Campeonato Brasileiro',
      location: 'Estádio Municipal'
    },
    {
      id: 2,
      date: 'Amanhã',
      time: '16:30',
      homeTeam: { id: 3, name: 'Flamengo FC' },
      awayTeam: { id: 4, name: 'São Paulo SC' },
      score: { home: 2, away: 1 },
      status: 'finished',
      championship: 'Copa do Brasil',
      location: 'Maracanã'
    },
    {
      id: 3,
      date: 'Sábado',
      time: '15:00',
      homeTeam: { id: 5, name: 'Palmeiras AC' },
      awayTeam: { id: 6, name: 'Corinthians FC' },
      status: 'upcoming',
      championship: 'Paulistão 2025',
      location: 'Allianz Parque'
    },
    {
      id: 4,
      date: 'Domingo',
      time: '17:00',
      homeTeam: { id: 7, name: 'Santos FC' },
      awayTeam: { id: 8, name: 'Grêmio RS' },
      status: 'live',
      championship: 'Copa Libertadores',
      location: 'Vila Belmiro'
    },
    {
      id: 5,
      date: 'Segunda',
      time: '20:00',
      homeTeam: { id: 9, name: 'Atlético MG' },
      awayTeam: { id: 10, name: 'Cruzeiro EC' },
      status: 'upcoming',
      championship: 'Brasileirão Série A',
      location: 'Mineirão'
    },
    {
      id: 6,
      date: 'Terça',
      time: '21:30',
      homeTeam: { id: 11, name: 'Botafogo RJ' },
      awayTeam: { id: 12, name: 'Vasco da Gama' },
      status: 'upcoming',
      championship: 'Carioca 2025',
      location: 'Nilton Santos'
    }
  ];

  const getMockChampionship = (): Championship => ({
    id: 1,
    name: 'Campeonato Brasileiro Série A 2025',
    teams: [
      { id: 1, name: 'Flamengo', points: 57, position: 1, lastGames: ['win', 'win', 'win', 'win', 'win'] },
      { id: 2, name: 'Palmeiras', points: 54, position: 2, lastGames: ['win', 'win', 'win', 'win', 'loss'] },
      { id: 3, name: 'São Paulo', points: 51, position: 3, lastGames: ['win', 'win', 'win', 'loss', 'win'] },
      { id: 4, name: 'Corinthians', points: 48, position: 4, lastGames: ['win', 'win', 'loss', 'win', 'win'] },
      { id: 5, name: 'Santos', points: 45, position: 5, lastGames: ['win', 'loss', 'win', 'win', 'draw'] }
    ]
  });

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

  const getTeamLogoUrl = (banner?: string) => {
    if (!banner) return null;
    if (banner.startsWith('/uploads')) {
      return `http://localhost:3001${banner}`;
    }
    return `http://localhost:3001/uploads/teams/${banner}`;
  };

  const handleMatchClick = (matchId: number) => {
    navigate(`/matches/${matchId}`);
  };

  const getLastGameIcon = (result: string) => {
    switch (result) {
      case 'win': return '🟢';
      case 'loss': return '🔴';
      case 'draw': return '🟡';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="globo-esporte-layout">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Carregando...</h2>
          <p>Aguarde enquanto carregamos os dados...</p>
        </div>
      </div>
    );
  }

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState('futebol');

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="globo-esporte-layout">
      {/* Hero Section com texto principal */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            Organize seus jogos e campeonatos de futebol com facilidade
          </h1>
          <p className="hero-subtitle">
            Crie times, agende partidas e acompanhe estatísticas. Tudo em um só lugar para você se concentrar apenas em jogar.
          </p>
          <div className="hero-actions">
            <button 
              className="hero-btn primary"
              onClick={() => navigate('/matches/create')}
            >
              Criar Partida
            </button>
            <button 
              className="hero-btn secondary"
              onClick={() => navigate('/matches')}
            >
              Ver Partidas
            </button>
          </div>
        </div>
      </div>

      {/* Seção Principal - Estilo Globo Esporte */}
      <div className="main-content">
        {/* Seção: Jogos e Eventos para não Perder */}
        <section className="section-not-to-miss">
          <div className="section-header">
            <h2>JOGOS E EVENTOS PARA NÃO PERDER</h2>
            <p>Acompanhe os jogos e eventos mais importantes do futebol e mais esportes do mundo</p>
          </div>
          
          <div className="matches-carousel">
            <div className="matches-scroll">
              {matches.slice(0, 4).map((match) => (
                <div 
                  key={match.id} 
                  className="match-card-globo"
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="match-card-header-globo">
                    <div className="match-info">
                      <span className="championship-name-globo">{match.championship}</span>
                      <span className="match-datetime-globo">{match.date} • {match.time}</span>
                    </div>
                    <button className="follow-btn">FIQUE POR DENTRO</button>
                  </div>
                  
                  <div className="match-teams-globo">
                    <div className="team-globo">
                      <div className="team-logo-globo">
                        {getTeamLogoUrl(match.homeTeam.banner) ? (
                          <img 
                            src={getTeamLogoUrl(match.homeTeam.banner)!} 
                            alt={match.homeTeam.name}
                            className="team-logo-img-globo"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="team-logo-fallback-globo" style={{ display: getTeamLogoUrl(match.homeTeam.banner) ? 'none' : 'flex' }}>
                          <span>{match.homeTeam.name.charAt(0)}</span>
                        </div>
                      </div>
                      <span className="team-name-globo">{match.homeTeam.name}</span>
                    </div>
                    
                    <div className="team-globo">
                      <div className="team-logo-globo">
                        {getTeamLogoUrl(match.awayTeam.banner) ? (
                          <img 
                            src={getTeamLogoUrl(match.awayTeam.banner)!} 
                            alt={match.awayTeam.name}
                            className="team-logo-img-globo"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="team-logo-fallback-globo" style={{ display: getTeamLogoUrl(match.awayTeam.banner) ? 'none' : 'flex' }}>
                          <span>{match.awayTeam.name.charAt(0)}</span>
                        </div>
                      </div>
                      <span className="team-name-globo">{match.awayTeam.name}</span>
                    </div>
                  </div>
                  
                  <div className="match-card-footer-globo">
                    <span className="match-round">Rodada 1 • Masculino</span>
                    <div className="watch-info">
                      <span className="watch-icon">▶️</span>
                      <span>Onde assistir?</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="scroll-arrow right">→</button>
          </div>
        </section>

        {/* Seção: Agenda de Futebol */}
        <section className="section-agenda">
          <div className="section-header">
            <h2>AGENDA DE FUTEBOL E MAIS ESPORTES</h2>
            <p>Acompanhe jogos, eventos e resultados do esporte nacional e internacional. Eventos no Horário de Brasília</p>
          </div>
          
          <div className="agenda-controls">
            <div className="date-picker">
              <span className="month-year">{formatMonthYear(selectedDate)}</span>
              <div className="days-scroll">
                <button className="scroll-arrow left">‹</button>
                <div className="days-container">
                  {getDaysInMonth().map((dayInfo) => (
                    <button
                      key={dayInfo.day}
                      className={`day-button ${dayInfo.isToday ? 'today' : ''}`}
                      onClick={() => setSelectedDate(dayInfo.date)}
                    >
                      <span className="day-number">{dayInfo.day}</span>
                      <span className="day-name">{dayInfo.dayName}</span>
                    </button>
                  ))}
                </div>
                <button className="scroll-arrow right">›</button>
              </div>
            </div>
          </div>
          
          <div className="agenda-tabs">
            <button 
              className={`tab-button ${selectedTab === 'futebol' ? 'active' : ''}`}
              onClick={() => setSelectedTab('futebol')}
            >
              Futebol
            </button>
            <button 
              className={`tab-button ${selectedTab === 'mais-esportes' ? 'active' : ''}`}
              onClick={() => setSelectedTab('mais-esportes')}
            >
              Mais Esportes
            </button>
          </div>
          
          <div className="agenda-content">
            <div className="agenda-matches">
              {matches.slice(0, 6).map((match) => (
                <div key={match.id} className="agenda-match-item">
                  <div className="match-time-agenda">
                    <span className="time">{match.time}</span>
                  </div>
                  <div className="match-info-agenda">
                    <div className="teams-agenda">
                      <span className="team-home">{match.homeTeam.name}</span>
                      <span className="vs-agenda">x</span>
                      <span className="team-away">{match.awayTeam.name}</span>
                    </div>
                    <div className="match-details-agenda">
                      <span className="championship-agenda">{match.championship}</span>
                      {match.location && (
                        <span className="location-agenda">📍 {match.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="match-status-agenda">
                    <span className={`status-agenda ${match.status}`}>
                      {getGameStatusIcon(match.status)} {getGameStatusText(match.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
