import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import './MatchList.css';
import { getStatusLabel } from '../../utils/statusLabels';
import { canCreateMatch } from '../../utils/roleUtils';
import { useMatches } from '../../hooks/useMatches';
import { useFilters } from '../../hooks/useFilters';
import { MatchCard } from '../../components/features/matches/MatchList';
import { AdvancedFiltersModal } from '../../components/features/matches/MatchList';
import { SearchControls } from '../../components/features/matches/MatchList';

interface User {
  id: number;
  token: string;
  userTypeId: number;
}

const MatchList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const matchesPerPage = 8;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [currentUser] = useState<User>(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Erro ao parsear usuário do localStorage');
      }
    }

    // Se não encontrar user, mas encontrar token, cria um objeto básico
    if (storedToken) {
      return { id: 0, token: storedToken, userTypeId: 4 };
    }

    return { id: 0, token: '', userTypeId: 4 };
  });

  const { matches, loading, error } = useMatches(currentUser);

  const {
    searchQuery,
    statusFilter,
    priceFilter,
    dateFilter,
    tempStatusFilter,
    tempPriceFilter,
    tempDateFilter,
    setTempStatusFilter,
    setTempPriceFilter,
    setTempDateFilter,
    handleSearchChange,
    clearSearch,
    applyFilters,
    cancelFilters,
    clearTempFilters,
    openFiltersModal,
    getActiveFiltersCount,
    clearAllFilters
  } = useFilters();

  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      setFilteredMatches([]);
      return;
    }
    let filtered = [...matches];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(match =>
      match.title.toLowerCase().includes(query) ||
        match.location.toLowerCase().includes(query) ||
        match.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter.length > 0) {
      filtered = filtered.filter(match => statusFilter.includes(match.status));
    }

    if (priceFilter.length > 0) {
      if (priceFilter.includes('free')) {
        filtered = filtered.filter(match => !match.price || match.price === 0);
      } else if (priceFilter.includes('paid')) {
        filtered = filtered.filter(match => match.price && match.price > 0);
      }
    }

    if (dateFilter.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (dateFilter.includes('today')) {
          return matchDate.getTime() === today.getTime();
        } else if (dateFilter.includes('tomorrow')) {
          return matchDate.getTime() === tomorrow.getTime();
        } else if (dateFilter.includes('week')) {
          return matchDate >= today && matchDate < nextWeekStart;
        } else if (dateFilter.includes('weekend')) {
          return matchDate >= nextWeekStart && matchDate < nextWeekEnd;
        }

        return true;
      });
    }

    setFilteredMatches(filtered);
  }, [matches, searchQuery, statusFilter, priceFilter, dateFilter]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFiltersModal = () => {
    openFiltersModal();
    setShowAdvancedFilters(true);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setShowAdvancedFilters(false);
  };

  const handleCancelFilters = () => {
    cancelFilters();
    setShowAdvancedFilters(false);
  };

  const handleClearTempFilters = () => {
    clearTempFilters();
  };

  // Modificar a renderização da lista para usar paginação eficiente
  const renderMatchList = () => {
    if (loading && matches.length === 0) {
      // Mostrar skeleton loaders apenas no carregamento inicial
      return (
        <div className="match-list-grid">
          {Array.from({ length: matchesPerPage }).map((_, index) => (
            <div className="match-card skeleton" key={`skeleton-${index}`}>
              <div className="skeleton-title"></div>
              <div className="skeleton-info"></div>
              <div className="skeleton-info"></div>
              <div className="skeleton-info"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (filteredMatches.length === 0) {
      return (
        <div className="no-matches-message">
          <SportsSoccerIcon fontSize="large" />
          <h3>Nenhuma partida encontrada</h3>
          <p>Tente remover os filtros ou alterar sua busca.</p>
        </div>
      );
    }
    const indexOfLastMatch = page * matchesPerPage;
    const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
    const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);
    const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);
    return (
      <>
        <div className="matches-grid">
          {currentMatches.map((match) => (
            <MatchCard key={match.id} match={match} currentUserId={currentUser.id} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination-container">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="match-list-container">
      <div className="match-list-content">
        <div className="header-container">
          <h1>Gerenciar partidas criadas por você!</h1>

          <SearchControls
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            clearSearch={clearSearch}
            openFiltersModal={handleOpenFiltersModal}
            getActiveFiltersCount={getActiveFiltersCount}
          />

          {canCreateMatch(currentUser.userTypeId) && (
            <button
              className="create-match-button"
              onClick={() => navigate('/matches/create')}
            >
              <span className="btn-text">Criar Nova Partida</span>
            </button>
          )}

          {getActiveFiltersCount() > 0 && (
            <div className="active-filters-summary">
              <p>Filtros ativos:</p>
              <div className="active-filters-chips">
                    {statusFilter.length > 0 && (
                      <div className="filter-chip">
                        <span className="chip-label">Status:</span> {statusFilter.map(s => {
                          switch(s) {
                            case 'aberta': return 'Aberta';
                            case 'finalizada': return 'Finalizada';
                            case 'sem_vagas': return getStatusLabel('sem_vagas');
                            case 'confirmada': return 'Em andamento';
                            case 'cancelada': return 'Cancelada';
                            default: return s;
                          }
                        }).join(', ')}
                      </div>
                    )}

                {priceFilter.length > 0 && (
                  <div className="filter-chip">
                    <span className="chip-label">Valor da quadra:</span> {priceFilter.map(p => {
                      switch(p) {
                        case 'free': return 'Gratuito';
                        case 'paid': return 'Pago';
                        default: return p;
                      }
                    }).join(', ')}
                  </div>
                )}

                {dateFilter.length > 0 && (
                  <div className="filter-chip">
                    <span className="chip-label">Data:</span> {dateFilter.map(d => {
                      switch(d) {
                        case 'today': return 'Hoje';
                        case 'tomorrow': return 'Amanhã';
                        case 'week': return 'Esta semana';
                        case 'weekend': return 'Fim de semana';
                        default: return d;
                      }
                    }).join(', ')}
                  </div>
                )}

                <button className="clear-all-filters" onClick={clearAllFilters}>
                  Limpar todos
                </button>
              </div>
            </div>
          )}
        </div>

        {renderMatchList()}

        <AdvancedFiltersModal
          show={showAdvancedFilters}
          tempStatusFilter={tempStatusFilter}
          tempPriceFilter={tempPriceFilter}
          tempDateFilter={tempDateFilter}
          setTempStatusFilter={setTempStatusFilter}
          setTempPriceFilter={setTempPriceFilter}
          setTempDateFilter={setTempDateFilter}
          applyFilters={handleApplyFilters}
          cancelFilters={handleCancelFilters}
          clearTempFilters={handleClearTempFilters}
        />
      </div>
    </div>
  );
};

export default MatchList; 