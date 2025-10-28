
import { useState } from 'react';
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
  const [showAllGames, setShowAllGames] = useState(false);
  const navigate = useNavigate();

  const getMatchesForDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return matches.filter(match => {
      if (!match.date) return false;
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() === normalizedDate.getTime();
    });
  };

  // Retorna os jogos do dia para o carrossel de destaque
  const getTodayMatches = () => {
    const today = getToday();
    const todayMatches = getMatchesForDate(today);
    if (todayMatches.length === 0) {
      return matches.filter((match: any) => {
        const matchDate = new Date(match.date);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() === today.getTime() || matchDate.getTime() === tomorrow.getTime();
      }).slice(0, 4);
    }
    return todayMatches.slice(0, 4);
  };

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
                {getTodayMatches().map((match: any) => (
                  <div
                    key={match.id}
                    className="match-card match-card-globo highlight-card match-card-large"
                    onClick={() => navigate(`/matches/${match.id}`)}
                  >
                    <div className="highlight-title-row">
                      <span className="highlight-title">{match.title || match.championship}</span>
                    </div>
                    <div className="highlight-date-row">
                      <span className="highlight-date">Hoje • {match.time}</span>
                    </div>
                    <div className="highlight-vs-row align-vs-horizontal">
                      <span className="highlight-team">{match.homeTeam?.name || '---'}</span>
                      <span className="highlight-vs-text">VS</span>
                      <span className="highlight-team">{match.awayTeam?.name || '---'}</span>
                    </div>
                    <div className="highlight-status-row">
                      <span className="highlight-matchname">{match.title || match.championship}</span>
                      <span className="highlight-status-pill status-pill"
                        style={{ marginLeft: 'auto' }}
                        role="status"
                        aria-label={`status ${match.status}`}
                      >
                        {match.status === 'live' ? 'AO VIVO' :
                          match.status === 'finished' ? 'ENCERRADO' :
                          match.status === 'sem_vagas' ? 'SEM VAGAS' :
                          match.status === 'aberta' ? 'ABERTO' :
                          match.status === 'cancelada' ? 'CANCELADA' :
                          'ABERTO'}
                      </span>
                    </div>
                    <div className="highlight-footer footer-bottom-bar">
                      <span className="footer-type">Amistoso</span>
                      <span className="footer-location footer-location-bottom">
                        <i className="fas fa-map-marker-alt"></i>
                        {match.location}
                      </span>
                      <span className={`status-pill ${match.status}`}
                        style={{ background: match.status === 'cancelada' ? '#fee2e2' : match.status === 'finished' ? '#dcfce7' : '#e0f2fe', color: match.status === 'cancelada' ? '#dc2626' : match.status === 'finished' ? '#16a34a' : '#2563eb' }}>
                        {match.status === 'cancelada' ? 'CANCELADA' : match.status === 'finished' ? 'ENCERRADO' : 'ABERTO'}
                      </span>
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
                {(showAllGames ? getMatchesForDate(selectedDate) : getMatchesForDate(selectedDate).slice(0, 3)).map((match: any) => (
                  <div
                    key={match.id}
                    className="agenda-match-item"
                    onClick={() => navigate(`/matches/${match.id}`)}
                  >
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
                          <span className="location-agenda">
                            <i className="fas fa-map-marker-alt"></i>
                            {match.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="match-status-agenda">
                      <span className={`status-agenda ${match.status}`}>
                        {match.status === 'live' ? 'AO VIVO' :
                         match.status === 'finished' ? 'ENCERRADO' :
                         match.status === 'sem_vagas' ? 'SEM VAGAS' :
                         match.status === 'aberta' ? 'ABERTA' :
                         match.status === 'cancelada' ? 'CANCELADA' :
                         'PRÓXIMA'}
                      </span>
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