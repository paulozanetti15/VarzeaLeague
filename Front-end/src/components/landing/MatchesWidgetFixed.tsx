import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
    today.setHours(0, 0, 0, 0); // Garantir que sempre inicie no dia de hoje
    return today;
  });
  const [selectedTab, setSelectedTab] = useState('futebol');
  const [cardScrollPosition, setCardScrollPosition] = useState(0);
  const [calendarScrollPosition, setCalendarScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, position: 0 });
  const [showAllGames, setShowAllGames] = useState(false);
  const navigate = useNavigate();

  // Função para obter o dia de hoje normalizado
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação
    return today;
  };

  // Função para filtrar jogos por data específica
  const getMatchesForDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const today = getToday();
    const isToday = normalizedDate.getTime() === today.getTime();
    
    return matches.filter(match => {
      // Para hoje: mostrar jogos ao vivo e próximos
      if (isToday) {
        return match.status === 'live' || match.status === 'upcoming';
      }
      // Para outros dias: mostrar apenas próximos
      return match.status === 'upcoming';
    });
  };

  // Função para obter jogos do dia atual ou próximos se não houver
  const getTodayMatches = () => {
    const todayMatches = getMatchesForDate(getToday());
    
    // Se não há jogos hoje, buscar próximos jogos
    if (todayMatches.length === 0) {
      return getUpcomingMatches().slice(0, 4);
    }
    
    return todayMatches.slice(0, 4);
  };

  // Função para verificar se uma data é hoje
  const isToday = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const today = getToday();
    return normalizedDate.getTime() === today.getTime();
  };

  // Função para obter próximos jogos
  const getUpcomingMatches = () => {
    const today = getToday();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return matches.filter(match => {
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
    
    // Definir posição inicial do calendário baseada no dia de hoje
    const todayDay = today.getDate();
    const initialPosition = Math.max(0, todayDay - 4); // Mostrar alguns dias antes do hoje
    setCalendarScrollPosition(initialPosition);
  }, []);

  // Event listeners para arrastar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const barWidth = 300;
        const daysInMonth = getDaysInMonth();
        const maxScroll = Math.max(0, daysInMonth.length - 7);
        
        const sensitivity = maxScroll / barWidth;
        const newPosition = Math.max(0, Math.min(maxScroll, dragStart.position + (deltaX * sensitivity)));
        setCalendarScrollPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const loadData = async () => {
    try {
      const matchesData = await api.matches.list();
      if (matchesData && matchesData.length > 0) {
        const processedMatches = matchesData.slice(0, 6).map((match: any) => ({
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
        setMatches(getMockMatches());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMatches(getMockMatches());
    } finally {
      setLoading(false);
    }
  };

  const getMockMatches = (): Match[] => [
    {
      id: 1,
      date: 'Hoje',
      time: '19:00',
      homeTeam: { id: 1, name: 'Lucato FC' },
      awayTeam: { id: 2, name: 'Atlético Micas' },
      status: 'upcoming',
      championship: 'Campeonato Brasileiro',
      location: 'Maracanã'
    },
    {
      id: 2,
      date: 'Hoje',
      time: '21:00',
      homeTeam: { id: 3, name: 'PZFC' },
      awayTeam: { id: 4, name: 'Rafa Perfeita' },
      status: 'upcoming',
      championship: 'Paulistão 2025',
      location: 'Allianz Parque'
    },
    {
      id: 3,
      date: 'Amanhã',
      time: '16:00',
      homeTeam: { id: 5, name: 'Lucato FC' },
      awayTeam: { id: 6, name: 'PZFC' },
      status: 'upcoming',
      championship: 'Copa Libertadores',
      location: 'Vila Belmiro'
    },
    {
      id: 4,
      date: 'Amanhã',
      time: '18:30',
      homeTeam: { id: 7, name: 'Atlético Micas' },
      awayTeam: { id: 8, name: 'Rafa Perfeita' },
      status: 'upcoming',
      championship: 'Cariocão 2025',
      location: 'São Januário'
    },
    {
      id: 5,
      date: 'Sábado',
      time: '15:00',
      homeTeam: { id: 9, name: 'PZFC' },
      awayTeam: { id: 10, name: 'Lucato FC' },
      status: 'upcoming',
      championship: 'Campeonato Brasileiro',
      location: 'Nilton Santos'
    },
    {
      id: 6,
      date: 'Sábado',
      time: '17:30',
      homeTeam: { id: 11, name: 'Rafa Perfeita' },
      awayTeam: { id: 12, name: 'Atlético Micas' },
      status: 'upcoming',
      championship: 'Série A',
      location: 'Beira-Rio'
    },
    {
      id: 7,
      date: 'Domingo',
      time: '16:00',
      homeTeam: { id: 13, name: 'Lucato FC' },
      awayTeam: { id: 14, name: 'Rafa Perfeita' },
      status: 'upcoming',
      championship: 'Brasileirão',
      location: 'Arena da Baixada'
    },
    {
      id: 8,
      date: 'Domingo',
      time: '18:30',
      homeTeam: { id: 15, name: 'Atlético Micas' },
      awayTeam: { id: 16, name: 'PZFC' },
      status: 'upcoming',
      championship: 'Cearense',
      location: 'Castelão'
    }
  ];

  const getTeamLogoUrl = (banner?: string) => {
    if (!banner) return null;
    if (banner.startsWith('/uploads')) {
      return `http://localhost:3001${banner}`;
    }
    return `http://localhost:3001/uploads/teams/${banner}`;
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

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0); // Normalizar data
      days.push({
        day,
        date,
        isToday: isToday(date), // Usar a função isToday corrigida
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' })
      });
    }
    
    return days;
  };

  // Funções para rolagem dos cards
  const scrollCardsLeft = () => {
    setCardScrollPosition(prev => Math.max(0, prev - 1));
  };

  const scrollCardsRight = () => {
    const maxScroll = Math.max(0, getTodayMatches().length - 3);
    setCardScrollPosition(prev => Math.min(maxScroll, prev + 1));
  };

  // Funções para arrastar a barra de rolagem
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, position: calendarScrollPosition });
    e.preventDefault();
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const barWidth = 300; // Largura da barra
    const daysInMonth = getDaysInMonth();
    const maxScroll = Math.max(0, daysInMonth.length - 7);
    
    const sensitivity = maxScroll / barWidth;
    const newPosition = Math.max(0, Math.min(maxScroll, dragStart.position + (deltaX * sensitivity)));
    setCalendarScrollPosition(newPosition);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };


  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        <h2>Carregando dados...</h2>
        <p>Aguarde enquanto carregamos as partidas...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F5F7FA', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero Banner - "O que é" sutil */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #f0f4f8 100%)',
        padding: '2rem 1.5rem',
        color: '#2d3748',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          position: 'absolute',
          top: '-5%',
          right: '-3%',
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.03))',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-5%',
          left: '-3%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.06), rgba(25, 118, 210, 0.02))',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: '0 0 0.8rem 0',
            lineHeight: '1.3',
            color: '#1a202c',
            letterSpacing: '-0.02em'
          }}>
            A plataforma completa para organizar seu futebol
          </h1>
          
          <p style={{
            fontSize: '1rem',
            margin: '0 auto',
            opacity: '0.75',
            lineHeight: '1.5',
            fontWeight: '400',
            color: '#4a5568',
            maxWidth: '550px'
          }}>
            Gerencie times, agende partidas, organize campeonatos e acompanhe estatísticas. 
            Tudo em um só lugar para você se concentrar no que realmente importa: <strong>jogar futebol</strong>.
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Seção: Jogos em Destaque */}
        <section style={{ marginBottom: '3rem', paddingTop: '3rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#2D3748',
              margin: '0 0 0.5rem 0'
            }}>
              Jogos em Destaque
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#4A5568',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Acompanhe as principais partidas e eventos do futebol
            </p>
          </div>
          
          {/* Container principal */}
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Botão de navegação esquerdo - FORA da estrutura */}
            <button
              onClick={scrollCardsLeft}
              style={{
                position: 'absolute',
                left: '-80px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'white',
                border: '2px solid #E2E8F0',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={{ fontSize: '1.2rem', color: '#4A5568' }}>←</span>
            </button>

            {/* Área dos cards - alinhada com o texto */}
            <div style={{ 
              width: '100%',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                transform: `translateX(-${cardScrollPosition * (380 + 24)}px)`,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                width: 'fit-content'
              }}>
              {getTodayMatches().map((match) => (
                <div 
                  key={match.id} 
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '380px',
                    height: '200px',
                    flexShrink: 0
                  }}
                onClick={() => navigate(`/matches/${match.id}`)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  background: match.status === 'live' ? '#FF6B6B' : 
                             match.status === 'finished' ? '#4ECDC4' : '#1976D2',
                  color: 'white'
                }}>
                  {match.status === 'live' ? '🔴 AO VIVO' : 
                   match.status === 'finished' ? '✅ FINALIZADO' : '⏰ PRÓXIMO'}
                </div>

                {/* Header do Card */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: '#1976D2',
                    marginBottom: '0.5rem'
                  }}>
                    {match.championship}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#718096',
                    fontWeight: '500'
                  }}>
                    {match.date} • {match.time}
                  </div>
                </div>
                
                {/* Times - Layout Horizontal */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  {/* Time Casa */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      width: '45px', 
                      height: '45px', 
                      borderRadius: '50%',
                      background: match.homeTeam.logo 
                        ? `url(${match.homeTeam.logo}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1976D2, #0D47A1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: match.homeTeam.logo ? 'transparent' : 'white',
                      fontWeight: '700',
                      fontSize: match.homeTeam.logo ? '0' : '1.4rem',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      border: match.homeTeam.logo ? '2px solid #E2E8F0' : 'none',
                      flexShrink: 0
                    }}>
                      {!match.homeTeam.logo && match.homeTeam.name.charAt(0)}
                    </div>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#2D3748',
                      fontSize: '0.8rem',
                      flex: 1,
                      minWidth: 0,
                      lineHeight: '1.2',
                      textAlign: 'left'
                    }}>
                      {match.homeTeam.name}
                    </span>
                  </div>
                  
                  {/* VS e Placar */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '0.25rem',
                    minWidth: '50px'
                  }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '600',
                      color: '#718096'
                    }}>
                      VS
                    </span>
                    {match.score && (
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700',
                        color: '#2D3748'
                      }}>
                        {match.score.home} - {match.score.away}
                      </div>
                    )}
                  </div>
                  
                  {/* Time Visitante */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#2D3748',
                      fontSize: '0.8rem',
                      textAlign: 'right',
                      flex: 1,
                      minWidth: 0,
                      lineHeight: '1.2'
                    }}>
                      {match.awayTeam.name}
                    </span>
                    <div style={{ 
                      width: '45px', 
                      height: '45px', 
                      borderRadius: '50%',
                      background: match.awayTeam.logo 
                        ? `url(${match.awayTeam.logo}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1976D2, #0D47A1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: match.awayTeam.logo ? 'transparent' : 'white',
                      fontWeight: '700',
                      fontSize: match.awayTeam.logo ? '0' : '1.4rem',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      border: match.awayTeam.logo ? '2px solid #E2E8F0' : 'none',
                      flexShrink: 0
                    }}>
                      {!match.awayTeam.logo && match.awayTeam.name.charAt(0)}
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #E2E8F0',
                  marginTop: 'auto'
                }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#718096',
                    fontWeight: '500'
                  }}>
                    Rodada 1 • Masculino
                  </span>
                  {match.location && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#1976D2',
                      fontWeight: '500'
                    }}>
                      📍 {match.location}
                    </span>
                  )}
                </div>
              </div>
              ))}
              </div>
            </div>

            {/* Botão de navegação direito - FORA da estrutura */}
            <button
              onClick={scrollCardsRight}
              style={{
                position: 'absolute',
                right: '-80px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'white',
                border: '2px solid #E2E8F0',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={{ fontSize: '1.2rem', color: '#4A5568' }}>→</span>
            </button>
          </div>
        </section>

        {/* Seção: Agenda Inteligente */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#2D3748',
              margin: '0 0 0.5rem 0'
            }}>
              Agenda de Partidas
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#4A5568',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Acompanhe jogos e eventos do futebol. Selecione uma data para ver as partidas.
            </p>
          </div>
          
          {/* Controles de Data Modernos */}
          <div style={{ 
            marginBottom: '2rem',
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Seletor de Mês */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <select
                  value={selectedDate.getMonth()}
                  onChange={(e) => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(parseInt(e.target.value));
                    setSelectedDate(newDate);
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#2D3748',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    minWidth: '140px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(2024, i, 1);
                    return (
                      <option key={i} value={i}>
                        {date.toLocaleDateString('pt-BR', { month: 'long' })}
                      </option>
                    );
                  })}
                </select>
                
                <select
                  value={selectedDate.getFullYear()}
                  onChange={(e) => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(parseInt(e.target.value));
                    setSelectedDate(newDate);
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#2D3748',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    minWidth: '80px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {Array.from({ length: 3 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                overflow: 'hidden',
                paddingBottom: '0.5rem',
                flex: 1,
                minWidth: 0
              }}>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  transform: `translateX(-${calendarScrollPosition * (70 + 8)}px)`,
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: 'fit-content'
                }}>
                {getDaysInMonth().map((dayInfo) => (
                  <button
                    key={dayInfo.day}
                    style={{
                      background: dayInfo.isToday ? '#1976D2' : 'transparent',
                      color: dayInfo.isToday ? 'white' : '#4A5568',
                      border: dayInfo.isToday ? 'none' : '2px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      minWidth: '70px',
                      width: '70px',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.3s ease',
                      fontWeight: '600'
                    }}
                    onClick={() => setSelectedDate(dayInfo.date)}
                    onMouseOver={(e) => {
                      if (!dayInfo.isToday) {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.color = '#1976D2';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!dayInfo.isToday) {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.color = '#4A5568';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                      {dayInfo.day}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {dayInfo.dayName}
                    </span>
                  </button>
                ))}
                </div>
              </div>
            </div>

            {/* Barra de rolagem personalizada melhorada */}
            <div style={{ 
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '300px',
                height: '8px',
                background: 'linear-gradient(90deg, #E2E8F0 0%, #F7FAFC 50%, #E2E8F0 100%)',
                borderRadius: '4px',
                position: 'relative',
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseDown={handleDragStart}
              onClick={(e) => {
                if (!isDragging) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const daysInMonth = getDaysInMonth();
                  const maxScroll = Math.max(0, daysInMonth.length - 7);
                  const newPosition = Math.round(percentage * maxScroll);
                  setCalendarScrollPosition(Math.max(0, Math.min(maxScroll, newPosition)));
                }
              }}
              onMouseOver={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #CBD5E0 0%, #EDF2F7 50%, #CBD5E0 100%)';
                }
              }}
              onMouseOut={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #E2E8F0 0%, #F7FAFC 50%, #E2E8F0 100%)';
                }
              }}
              >
                {/* Indicador de progresso */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  background: 'linear-gradient(90deg, #1976D2 0%, #42A5F5 50%, #1976D2 100%)',
                  borderRadius: '4px',
                  width: `${(() => {
                    const daysInMonth = getDaysInMonth();
                    const maxScroll = Math.max(0, daysInMonth.length - 7);
                    return maxScroll > 0 ? `${(calendarScrollPosition / maxScroll) * 100}%` : '100%';
                  })()}`,
                  transition: isDragging ? 'none' : 'width 0.3s ease',
                  boxShadow: '0 2px 6px rgba(25, 118, 210, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}></div>
                
                {/* Handle arrastável */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: -4,
                  width: '16px',
                  height: '16px',
                  background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                  borderRadius: '50%',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  border: '2px solid white',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                  transform: `translateX(${(() => {
                    const daysInMonth = getDaysInMonth();
                    const maxScroll = Math.max(0, daysInMonth.length - 7);
                    const percentage = maxScroll > 0 ? (calendarScrollPosition / maxScroll) : 0;
                    return percentage * (300 - 16);
                  })()}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                  zIndex: 2
                }}></div>
              </div>
            </div>
            
          </div>
          
          {/* Lista de Partidas do Dia */}
          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            {getMatchesForDate(selectedDate).length > 0 ? (
              <>
                {(showAllGames ? getMatchesForDate(selectedDate) : getMatchesForDate(selectedDate).slice(0, 3)).map((match, index) => (
                <div 
                  key={match.id} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    padding: '1.5rem 2rem',
                    borderBottom: index < getMatchesForDate(selectedDate).length - 1 ? '1px solid #F7FAFC' : 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/matches/${match.id}`)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#F7FAFC';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{ 
                    minWidth: '100px', 
                    textAlign: 'center',
                    background: '#F7FAFC',
                    padding: '0.75rem',
                    borderRadius: '8px'
                  }}>
                    <span style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '700', 
                      color: '#1976D2'
                    }}>
                      {match.time}
                    </span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      fontWeight: '600',
                      color: '#2D3748',
                      fontSize: '1.1rem'
                    }}>
                      <span style={{ flex: 1, textAlign: 'right' }}>{match.homeTeam.name}</span>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.5rem',
                        minWidth: '80px',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: '#718096', fontWeight: '400' }}>x</span>
                        {match.score && (
                          <span style={{ 
                            color: '#1976D2',
                            fontWeight: '700',
                            fontSize: '1.1rem'
                          }}>
                            {match.score.home} - {match.score.away}
                          </span>
                        )}
                      </div>
                      <span style={{ flex: 1, textAlign: 'left' }}>{match.awayTeam.name}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: '#718096'
                    }}>
                      <span style={{ fontWeight: '600', color: '#1976D2' }}>
                        {match.championship}
                      </span>
                      {match.location && (
                        <span style={{ fontWeight: '500' }}>📍 {match.location}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ minWidth: '140px', textAlign: 'right' }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: match.status === 'upcoming' ? '#E3F2FD' : 
                                 match.status === 'live' ? '#FFEBEE' : '#F3E5F5',
                      color: match.status === 'upcoming' ? '#1976D2' : 
                             match.status === 'live' ? '#D32F2F' : '#7B1FA2'
                    }}>
                      {getGameStatusIcon(match.status)} {getGameStatusText(match.status)}
                    </span>
                  </div>
                </div>
                ))}
                
                {/* Botão para expandir/recolher */}
                {getMatchesForDate(selectedDate).length > 3 && (
                  <div style={{
                    padding: '1rem 2rem',
                    borderTop: '1px solid #F7FAFC',
                    textAlign: 'center',
                    background: '#F7FAFC'
                  }}>
                    <button
                      onClick={() => setShowAllGames(!showAllGames)}
                      style={{
                        background: 'transparent',
                        border: '2px solid #1976D2',
                        borderRadius: '8px',
                        padding: '0.75rem 1.5rem',
                        color: '#1976D2',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#1976D2';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#1976D2';
                      }}
                    >
                      {showAllGames ? 'Ver menos' : `Ver mais ${getMatchesForDate(selectedDate).length - 3} jogos`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                padding: '3rem 2rem', 
                textAlign: 'center',
                color: '#718096'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</div>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  color: '#4A5568',
                  marginBottom: '0.5rem'
                }}>
                  Nenhuma partida encontrada
                </h3>
                <p style={{ fontSize: '1rem' }}>
                  Não há jogos programados para esta data.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
