import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchesWidget } from '../../hooks/useMatchesWidget';
import { getToday, isToday, formatMatchDate } from '../../utils/matchesUtils';
import './MatchesWidgetFixed.css';

export function MatchesWidgetFixed() {
  const { matches, loading } = useMatchesWidget();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = getToday();
    return today;
  });
  const [cardScrollPosition, setCardScrollPosition] = useState(0);
  const [calendarScrollPosition, setCalendarScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, position: 0 });
  const [showAllGames, setShowAllGames] = useState(false);
  const navigate = useNavigate();

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

  const getTodayMatches = () => {
    const todayMatches = getMatchesForDate(getToday());

    if (todayMatches.length === 0) {
      return matches.filter(match => {
        const matchDate = new Date(match.date);
        const today = getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() === today.getTime() || matchDate.getTime() === tomorrow.getTime();
      }).slice(0, 4);
    }

    return todayMatches.slice(0, 4);
  };

  useEffect(() => {
    const today = getToday();
    setSelectedDate(today);

    const todayDay = today.getDate();
    const initialPosition = Math.max(0, todayDay - 4);
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

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const sel = new Date(selectedDate);
    sel.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const isSel = date.getTime() === sel.getTime();
      days.push({
        day,
        date,
        isToday: isToday(date),
        isSelected: isSel,
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()
      });
    }

    return days;
  };

  // Funções para rolagem dos cards
  const scrollCardsLeft = () => {
    setCardScrollPosition(prev => Math.max(0, prev - 1));
  };

  const scrollCardsRight = () => {
    const todayMatches = getTodayMatches();
    const maxScroll = Math.max(0, todayMatches.length - 3);
    setCardScrollPosition(prev => Math.min(maxScroll, prev + 1));
  };

  // Funções para arrastar a barra de rolagem
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, position: calendarScrollPosition });
    e.preventDefault();
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
            {/* Botão de navegação esquerdo */}
            <button className="navigation-button left" onClick={scrollCardsLeft}>
              <i className="fas fa-arrow-left"></i>
            </button>

            {/* Área dos cards */}
            <div className="cards-area">
              <div
                className="cards-wrapper"
                style={{
                  '--card-transform': `-${cardScrollPosition * (380 + 24)}px`
                } as React.CSSProperties}
              >
                {getTodayMatches().map((match) => (
                  <div
                    key={match.id}
                    className="match-card"
                    onClick={() => navigate(`/matches/${match.id}`)}
                  >
                    {/* Header Compacto */}
                    <div className="card-header-compact">
                      <div className="championship-badge">{match.championship}</div>
                    </div>

                    {/* Informação de Data e Hora */}
                    <div className="match-datetime">
                      <span>{formatMatchDate(match.date)} • {match.time}</span>
                    </div>

                    {/* Times Confronto */}
                    <div className="teams-confrontation">
                      {/* Time Casa */}
                      <div className="team-info">
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
                        <span className="team-name-compact">{match.awayTeam.name}</span>
                      </div>
                    </div>

                    {/* Footer com Informações */}
                    <div className="card-footer-compact">
                      <span className="round-label">{match.round} • {match.category}</span>
                      {match.location && (
                        <span className="location-label">
                          <i className="fas fa-map-marker-alt"></i>
                          <span className="location-text">{match.location}</span>
                        </span>
                      )}
                      <div className={`status-pill ${match.status}`} role="status" aria-label={`status ${match.status}`}>
                        {match.status === 'live' && <span className="live-dot"></span>}
                        {match.status === 'live' ? 'AO VIVO' :
                         match.status === 'finished' ? 'ENCERRADO' : 'PRÓXIMO'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de navegação direito */}
            <button className="navigation-button right" onClick={scrollCardsRight}>
              <i className="fas fa-arrow-right"></i>
            </button>
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

          {/* Controles de Data */}
          <div className="date-controls">
            <div className="date-controls-header">
              {/* Seletor de Mês */}
              <div className="month-year-selectors">
                <select
                  className="month-selector"
                  value={selectedDate.getMonth()}
                  onChange={(e) => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(parseInt(e.target.value));
                    setSelectedDate(newDate);
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
                  className="year-selector"
                  value={selectedDate.getFullYear()}
                  onChange={(e) => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(parseInt(e.target.value));
                    setSelectedDate(newDate);
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

              <div className="calendar-area">
                <div
                  className="calendar-wrapper"
                  style={{
                    '--calendar-transform': `-${calendarScrollPosition * (60 + 8)}px`
                  } as React.CSSProperties}
                >
                  {getDaysInMonth().map((dayInfo) => (
                    <button
                      key={dayInfo.day}
                      className={`day-button ${dayInfo.isSelected || dayInfo.isToday ? 'selected' : ''} ${dayInfo.isToday ? 'today' : ''}`}
                      onClick={() => {
                        setSelectedDate(dayInfo.date);
                        setShowAllGames(false);
                        setCardScrollPosition(0);
                        const initialPos = Math.max(0, dayInfo.day - 4);
                        setCalendarScrollPosition(initialPos);
                      }}
                    >
                      <span className="day-number">{dayInfo.day}</span>
                      <span className="day-name">{dayInfo.dayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra de rolagem */}
            <div className="scrollbar-container">
              <div
                className="scrollbar-track"
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
              >
                <div
                  className="scrollbar-progress"
                  style={{
                    '--scrollbar-width': (() => {
                      const daysInMonth = getDaysInMonth();
                      const maxScroll = Math.max(0, daysInMonth.length - 7);
                      return maxScroll > 0 ? `${(calendarScrollPosition / maxScroll) * 100}%` : '100%';
                    })()
                  } as React.CSSProperties}
                ></div>

                <div
                  className="scrollbar-handle"
                  style={{
                    '--handle-position': (() => {
                      const daysInMonth = getDaysInMonth();
                      const maxScroll = Math.max(0, daysInMonth.length - 7);
                      const percentage = maxScroll > 0 ? (calendarScrollPosition / maxScroll) : 0;
                      const trackWidth = 600; // max-width do scrollbar-track
                      return `${percentage * (trackWidth - 16)}px`;
                    })()
                  } as React.CSSProperties}
                ></div>
              </div>
            </div>
          </div>

          {/* Lista de Partidas */}
          <div className="matches-list">
            {getMatchesForDate(selectedDate).length > 0 ? (
              <>
                {(showAllGames ? getMatchesForDate(selectedDate) : getMatchesForDate(selectedDate).slice(0, 3)).map((match) => (
                  <div
                    key={match.id}
                    className="match-list-item"
                    onClick={() => navigate(`/matches/${match.id}`)}
                  >
                    <div className="match-details">
                      <div className="match-teams">
                        <span className="team-home">{match.homeTeam.name}</span>
                        <span className="vs-indicator">x</span>
                        <span className="team-away">{match.awayTeam.name}</span>
                      </div>
                      <div className="match-meta">
                        <span className="championship-label">{match.championship}</span>
                        {match.location && (
                          <span className="location-label">{match.location}</span>
                        )}
                      </div>
                    </div>

                    <div className="match-time-info">
                      <div className="match-time">
                        <span>{match.time}</span>
                      </div>
                      <div className="match-status-display">
                        <span className={`status-indicator ${match.status}`}>
                          {match.status === 'live' ? 'AO VIVO' :
                           match.status === 'finished' ? 'ENCERRADO' : 'PRÓXIMO'}
                           
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botão para expandir/recolher */}
                {getMatchesForDate(selectedDate).length > 3 && (
                  <div className="expand-button">
                    <button onClick={() => setShowAllGames(!showAllGames)}>
                      {showAllGames ? 'Ver menos' : `Ver mais ${getMatchesForDate(selectedDate).length - 3} jogos`}
                    </button>
                  </div>
                )}
              </>
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