import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToggleButtonGroup, ToggleButton, Pagination } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import RefreshIcon from '@mui/icons-material/Refresh';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import axios from 'axios';
import './MatchList.css';
import { toast } from 'react-hot-toast';
import { FaFilter, FaCalendarAlt, FaMoneyBillWave, FaTags } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { fi } from 'date-fns/locale';
import { set } from 'date-fns';
import { m } from 'framer-motion';
interface Match {
  id: number;
  title: string;
  date: string;
  location: string;
  maxPlayers: number;
  description: string;
  price: number | null;
  status: string;
  _hasPlayerLoadError?: boolean;
  organizerId: number;
  organizer?: {
    id: number;
    name: string;
  };

}


const MatchList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<String>((location.state as { filter?: string })?.filter || 'all'); // 'all', 'my' ou 'nearby'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const matchesPerPage = 8;
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string[]>([]);
  const [tempStatusFilter, setTempStatusFilter] = useState<string[]>([]);
  const [tempPriceFilter, setTempPriceFilter] = useState<string[]>([]);
  const [tempDateFilter, setTempDateFilter] = useState<string[]>([]);
  
  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/matches/', {
        headers: { 'Authorization': `Bearer ${currentUser.token}` } });
      setMatches(response.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar partidas');
    } finally {
      setLoading(false);

    }
  };

  useEffect(() => {
    if (!matches || !Array.isArray(matches) || matches.length === 0) return;
    let filtered = [...matches];
    if (filter === 'my') {
      filtered = filtered.filter(match => match.organizerId === currentUser.id);
    }
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
  }, [matches, filter, searchQuery, currentUser.id, statusFilter, priceFilter, dateFilter]);
  
  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchMatches();
      setLastUpdate(Date.now());
    } catch (error) {
      toast.error('Erro ao atualizar a lista de partidas');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setSearchQuery('');
      setPage(1);
    }
  };

 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastMatch = (matchDate: string) => {
    const date = new Date(matchDate);
    return date < new Date();
  };
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll para o topo da página quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const openFiltersModal = () => {
    // Inicializar os filtros temporários com os valores atuais
    setTempStatusFilter([...statusFilter]);
    setTempPriceFilter([...priceFilter]);
    setTempDateFilter([...dateFilter]);
    setShowAdvancedFilters(true);
  };
  
  // Função para aplicar os filtros temporários
  const applyFilters = () => {
    setStatusFilter([...tempStatusFilter]);
    setPriceFilter([...tempPriceFilter]);
    setDateFilter([...tempDateFilter]);
    setShowAdvancedFilters(false);
  };
  
  // Função para cancelar e fechar o modal
  const cancelFilters = () => {
    setShowAdvancedFilters(false);
  };
  
  // Função para limpar todos os filtros temporários
  const clearTempFilters = () => {
    setTempStatusFilter([]);
    setTempPriceFilter([]);
    setTempDateFilter([]);
  };

  // Função para calcular o número de filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter.length > 0) count++;
    if (priceFilter.length > 0) count++;
    if (dateFilter.length > 0) count++;
    return count;
  };

  const AdvancedFiltersModal = () => {
    if (!showAdvancedFilters) return null;
  
    return (
      <div className="filters-modal-overlay">
        <div className="filters-modal-content">
          <div className="filters-modal-header">
            <h3><FaFilter /> Filtros Avançados</h3>
            <button className="close-modal" onClick={cancelFilters}>
              <IoMdClose />
            </button>
          </div>
          
          <div className="filters-modal-body">
            {/* Filtro de Status */}
            <div className="filter-group">
              <h4><FaTags /> Status da Partida</h4>
              <div className="status-filter-options">
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="status-open" 
                    checked={tempStatusFilter.includes('open')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempStatusFilter([...tempStatusFilter, 'open']);
                      } else {
                        setTempStatusFilter(tempStatusFilter.filter(s => s !== 'open'));
                      }
                    }}
                  />
                  <label htmlFor="status-open">
                    <span className="status-indicator open"></span>
                    Abertas
                  </label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="status-full" 
                    checked={tempStatusFilter.includes('full')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempStatusFilter([...tempStatusFilter, 'full']);
                      } else {
                        setTempStatusFilter(tempStatusFilter.filter(s => s !== 'full'));
                      }
                    }}
                  />
                  <label htmlFor="status-full">
                    <span className="status-indicator full"></span>
                    Completas
                  </label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="status-waiting" 
                    checked={tempStatusFilter.includes('waiting')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempStatusFilter([...tempStatusFilter, 'waiting']);
                      } else {
                        setTempStatusFilter(tempStatusFilter.filter(s => s !== 'waiting'));
                      }
                    }}
                  />
                  <label htmlFor="status-waiting">
                    <span className="status-indicator waiting"></span>
                    Aguardando
                  </label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="status-confirmed" 
                    checked={tempStatusFilter.includes('confirmed')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempStatusFilter([...tempStatusFilter, 'confirmed']);
                      } else {
                        setTempStatusFilter(tempStatusFilter.filter(s => s !== 'confirmed'));
                      }
                    }}
                  />
                  <label htmlFor="status-confirmed">
                    <span className="status-indicator confirmed"></span>
                    Confirmadas
                  </label>
                </div>
              </div>
            </div>
            
            {/* Filtro de Preço */}
            <div className="filter-group">
              <h4><FaMoneyBillWave /> Preço</h4>
              <div className="price-filter-options">
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="price-free" 
                    checked={tempPriceFilter.includes('free')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempPriceFilter([...tempPriceFilter, 'free']);
                      } else {
                        setTempPriceFilter(tempPriceFilter.filter(p => p !== 'free'));
                      }
                    }}
                  />
                  <label htmlFor="price-free">
                    <span className="price-indicator free">R$0</span>
                    Gratuito
                  </label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="price-paid" 
                    checked={tempPriceFilter.includes('paid')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempPriceFilter([...tempPriceFilter, 'paid']);
                      } else {
                        setTempPriceFilter(tempPriceFilter.filter(p => p !== 'paid'));
                      }
                    }}
                  />
                  <label htmlFor="price-paid">
                    <span className="price-indicator paid">R$</span>
                    Pago
                  </label>
                </div>
              </div>
            </div>
            
            {/* Filtro de Data */}
            <div className="filter-group">
              <h4><FaCalendarAlt /> Data</h4>
              <div className="date-filter-options">
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="date-today" 
                    checked={tempDateFilter.includes('today')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempDateFilter([...tempDateFilter, 'today']);
                      } else {
                        setTempDateFilter(tempDateFilter.filter(d => d !== 'today'));
                      }
                    }}
                  />
                  <label htmlFor="date-today">
                    Hoje
                  </label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="date-tomorrow" 
                    checked={tempDateFilter.includes('tomorrow')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempDateFilter([...tempDateFilter, 'tomorrow']);
                      } else {
                        setTempDateFilter(tempDateFilter.filter(d => d !== 'tomorrow'));
                      }
                    }}
                  />
                  <label htmlFor="date-tomorrow">
                    Amanhã
                  </label>
                </div>
                
                <div className="filter-option">
                  <input 
                    type="checkbox" 
                    id="date-week" 
                    checked={tempDateFilter.includes('week')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempDateFilter([...tempDateFilter, 'week']);
                      } else {
                        setTempDateFilter(tempDateFilter.filter(d => d !== 'week'));
                      }
                    }}
                  />
                  <label htmlFor="date-week">
                    Esta semana
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="filters-modal-footer">
            <button className="clear-filters-btn" onClick={clearTempFilters}>
              <ClearIcon fontSize="small" />
              Limpar filtros
            </button>
            <div className="action-buttons">
              <button className="cancel-button" onClick={cancelFilters}>
                Cancelar
              </button>
              <button className="apply-button" onClick={applyFilters}>
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            <div
              key={match.id}
              onClick={() => navigate(`/matches/${match.id}`)}
              data-match-id={match.id}
            >
              <div className="match-card-corner"></div>
              <div className="match-card-inner">
                <div className="match-card-gradient"></div>
                <div className="match-header">
                  <h2 className="match-title">{match.title}</h2>
                </div>
                
                <div className="match-info">
                  <div className="info-row" style={{color: '#ffffff'}}>
                    <EventIcon fontSize="small" />
                    <strong>Data:</strong> {formatDate(match.date)}
                  </div>
                  <div className="info-row" style={{color: '#ffffff'}}>
                    <AccessTimeIcon fontSize="small" />
                    <strong>Hora:</strong> {formatTime(match.date)}
                  </div>
                  <div className="info-row" style={{color: '#ffffff'}}>
                    <LocationOnIcon fontSize="small" />
                    <strong>Local:</strong> {match.location}
                  </div>
                </div>            
                {match.price && (
                  <div className="match-price">
                    <span>💰</span> R$ {(() => {
                      try {
                        return typeof match.price === 'number' 
                          ? match.price.toFixed(2) 
                          : parseFloat(String(match.price)).toFixed(2);
                      } catch (e) {
                        return '0.00';
                      }
                    })()
                    } por jogador
                  </div>
                )}
                
                <div className="match-action-container">
                  
                  {!isPastMatch(match.date) && (match.status === 'open' || match.status === 'full')  && match.organizerId !== currentUser.id && (
                    <div className="match-full-message">
                      Partida cheia
                    </div>
                  )}
                  {match.organizerId === currentUser.id && (
                    <div className="organizer-badge" style={{color: '#00ff00'}}>
                      Você é o organizador
                    </div>
                  )}
                </div>
              </div>
            </div>
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
      <div className="top-navigation">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowBackIcon /> Voltar
        </button>
      </div>
      <div className="match-list-content">
        <div className="header-container">
          <h1>Partidas Disponíveis</h1>
          
          <div className="search-controls">
            <div className="search-and-filter">
              <div className="search-container">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar partidas..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="clear-search" onClick={clearSearch}>
                    <ClearIcon />
                  </button>
                )}
              </div>
              
              <button 
                className="advanced-filters-toggle"
                onClick={openFiltersModal}
              >
                <FaFilter /> Filtros
                {getActiveFiltersCount() > 0 && (
                  <span className="filter-count-badge">{getActiveFiltersCount()}</span>
                )}
              </button>
            </div>
            <div className="filter-container">
              <div className="filter-group-wrapper">
                <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={handleFilterChange}
                  aria-label="filtro de partidas"
                  size="small"
                >
                  <ToggleButton value="all" aria-label="todas as partidas">
                    <AllInclusiveIcon fontSize="small" />
                    <span className="toggle-text">Todas</span>
                  </ToggleButton>
                  <ToggleButton value="my" aria-label="minhas partidas">
                    <PersonIcon fontSize="small" />
                    <span className="toggle-text">Minhas</span>
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <div className="update-info">
                  <button 
                    className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`} 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="Atualizar lista de partidas"
                  >
                    <RefreshIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            className="create-match-btn"
            onClick={() => navigate('/matches/create')}
          >
            <span className="btn-text">Criar Nova Partida</span>
          </button>
          
          {getActiveFiltersCount() > 0 && (
            <div className="active-filters-summary">
              <p>Filtros ativos:</p>
              <div className="active-filters-chips">
                {statusFilter.length > 0 && (
                  <div className="filter-chip">
                    <span className="chip-label">Status:</span> {statusFilter.map(s => {
                      switch(s) {
                        case 'open': return 'Aberta';
                        case 'full': return 'Cheia';
                        case 'in_progress': return 'Em andamento';
                        case 'completed': return 'Finalizada';
                        case 'cancelled': return 'Cancelada';
                        default: return s;
                      }
                    }).join(', ')}
                    <button 
                      className="clear-filter"
                      onClick={() => setStatusFilter([])}
                      title="Limpar filtro de status"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {priceFilter.length > 0 && (
                  <div className="filter-chip">
                    <span className="chip-label">Preço:</span> {priceFilter.map(p => {
                      switch(p) {
                        case 'free': return 'Gratuito';
                        case 'paid': return 'Pago';
                        default: return p;
                      }
                    }).join(', ')}
                    <button 
                      className="clear-filter"
                      onClick={() => setPriceFilter([])}
                      title="Limpar filtro de preço"
                    >
                      ×
                    </button>
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
                    <button 
                      className="clear-filter"
                      onClick={() => setDateFilter([])}
                      title="Limpar filtro de data"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <button className="clear-all-filters" onClick={() => {
                  setStatusFilter([]);
                  setPriceFilter([]);
                  setDateFilter([]);
                }}>
                  Limpar todos
                </button>
              </div>
            </div>
          )}
        </div>

        {renderMatchList()}
        
        <AdvancedFiltersModal />
      </div>
    </div>
  );
};

export default MatchList; 