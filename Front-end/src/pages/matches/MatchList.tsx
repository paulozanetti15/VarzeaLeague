import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToggleButtonGroup, ToggleButton, Pagination } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { api } from '../../services/api';
import './MatchList.css';

interface Match {
  id: number;
  title: string;
  date: string;
  location: string;
  maxPlayers: number;
  description: string;
  price: number | null;
  status: string;
  organizerId: number;
  organizer: {
    id: number;
    name: string;
    email: string;
  };
  players: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface Location {
  latitude: number;
  longitude: number;
}

const MatchList: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'my' ou 'nearby'
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  // Estado de paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedMatches, setPaginatedMatches] = useState<Match[]>([]);
  const matchesPerPage = 6;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    if (filter === 'nearby' && !userLocation) {
      getUserLocation();
    } else {
      fetchMatches();
    }
  }, [filter, userLocation]);

  // Efeito para filtrar as partidas baseado na busca
  useEffect(() => {
    if (!matches.length) return;
    
    if (!searchQuery.trim()) {
      setFilteredMatches(matches);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = matches.filter(match => 
      match.title.toLowerCase().includes(query) ||
      match.location.toLowerCase().includes(query) ||
      match.description?.toLowerCase().includes(query) ||
      match.organizer?.name.toLowerCase().includes(query)
    );
    
    setFilteredMatches(filtered);
  }, [searchQuery, matches]);

  // Efeito para paginar as partidas filtradas
  useEffect(() => {
    if (!filteredMatches.length) {
      setPaginatedMatches([]);
      setTotalPages(1);
      return;
    }

    const total = Math.ceil(filteredMatches.length / matchesPerPage);
    setTotalPages(total);
    
    // Se a página atual for maior que o total, resetar para página 1
    if (page > total) {
      setPage(1);
    }
    
    const startIndex = (page - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    const slicedMatches = filteredMatches.slice(startIndex, endIndex);
    
    setPaginatedMatches(slicedMatches);
  }, [filteredMatches, page]);

  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador');
      setLocationLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        setLocationError('Não foi possível obter sua localização. Verifique se você permitiu o acesso à localização.');
        setLocationLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Função para calcular a distância entre dois pontos usando a fórmula de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Função para extrair coordenadas de um endereço
  const extractCoordinates = (location: string): {latitude: number, longitude: number} | null => {
    // Esta é uma implementação simplificada. 
    // No mundo real, você precisaria usar uma API de geocodificação.
    // Aqui estamos apenas verificando se o texto contém coordenadas no formato "lat,lng"
    
    // Regex para extrair coordenadas no formato "latitude,longitude" ou "(latitude, longitude)"
    const coordsRegex = /\(?(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)?/;
    const match = location.match(coordsRegex);
    
    if (match && match.length >= 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }
    
    return null;
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await api.matches.list();
      
      // Filtra e processa as partidas
      let processedMatches = data;
      
      // Adiciona coordenadas e calcula distâncias, se possível
      processedMatches = processedMatches.map((match: Match) => {
        const coords = extractCoordinates(match.location);
        if (coords) {
          match.latitude = coords.latitude;
          match.longitude = coords.longitude;
          
          if (userLocation && match.latitude && match.longitude) {
            match.distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              match.latitude, 
              match.longitude
            );
          }
        }
        return match;
      });
      
      // Filtrar por organizador
      if (filter === 'my') {
        processedMatches = processedMatches.filter((match: Match) => match.organizerId === currentUser.id);
      }
      
      // Filtrar por proximidade
      if (filter === 'nearby' && userLocation) {
        // Filtra apenas partidas que tenham distância calculada e estejam até 10km
        processedMatches = processedMatches.filter((match: Match) => match.distance !== undefined && match.distance <= 10);
        // Ordena por proximidade
        processedMatches.sort((a: Match, b: Match) => (a.distance || 999) - (b.distance || 999));
      } else {
        // Ordena por data (próximas partidas primeiro)
        processedMatches.sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      setMatches(processedMatches);
      setFilteredMatches(processedMatches);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar partidas');
      console.error('Erro ao buscar partidas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      // Reset search quando mudar o filtro
      setSearchQuery('');
      // Reset para a primeira página
      setPage(1);
    }
  };

  const handleJoinMatch = async (matchId: number) => {
    try {
      await api.matches.join(matchId);
      // Atualiza a lista após entrar na partida
      fetchMatches();
    } catch (err: any) {
      console.error('Erro ao entrar na partida:', err);
      setError(err.message || 'Não foi possível entrar na partida');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset para a primeira página quando buscar
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    // Reset para a primeira página quando limpar a busca
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

  const formatDistance = (distance?: number) => {
    if (distance === undefined) return 'Distância desconhecida';
    
    if (distance < 1) {
      // Se for menos de 1km, mostrar em metros
      return `${Math.round(distance * 1000)}m`;
    }
    
    return `${distance.toFixed(1)}km`;
  };

  const isUserInMatch = (match: Match) => {
    return match.players?.some(player => player.id === currentUser.id) || false;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'full':
        return 'Cheia';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Finalizada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  // Verifica se uma partida está no passado
  const isPastMatch = (dateString: string) => {
    const matchDate = new Date(dateString);
    const now = new Date();
    return matchDate < now;
  };

  // Função para lidar com a mudança de página
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Rolar para o topo da lista quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="match-list-container">
      <button 
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon />
      </button>

      <div className="content-container">
        <div className="header-container">
          <h1 className="page-title">
            <SportsSoccerIcon style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Partidas Disponíveis
          </h1>

          <div className="filter-section">
            <div className="search-container">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar partidas por título, local ou organizador..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="clear-search"
                  onClick={clearSearch}
                  aria-label="Limpar busca"
                >
                  <ClearIcon />
                </button>
              )}
            </div>

            <div className="filter-container">
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                aria-label="Filtro de partidas"
              >
                <ToggleButton value="all" aria-label="Todas as partidas">
                  Todas <FilterListIcon />
                </ToggleButton>
                <ToggleButton value="my" aria-label="Minhas partidas">
                  Minhas <PersonIcon />
                </ToggleButton>
                <ToggleButton value="nearby" aria-label="Partidas próximas">
                  Próximas <MyLocationIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>

        <button
          className="create-match-btn"
          onClick={() => navigate('/matches/create')}
        >
          Criar Nova Partida
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {locationError && (
          <div className="error-message">
            {locationError}
          </div>
        )}
        
        {(loading || locationLoading) ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>{locationLoading ? 'Obtendo sua localização...' : 'Carregando partidas...'}</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="no-matches">
            <h3>{
              searchQuery 
                ? 'Nenhuma partida encontrada para sua busca'
                : filter === 'my' 
                  ? 'Você ainda não criou nenhuma partida' 
                  : filter === 'nearby'
                    ? 'Nenhuma partida encontrada próxima à sua localização'
                    : 'Nenhuma partida disponível no momento'
            }</h3>
            <p>{
              searchQuery
                ? 'Tente usar termos diferentes ou remover alguns filtros'
                : filter === 'my' 
                  ? 'Clique no botão acima para criar sua primeira partida!' 
                  : filter === 'nearby'
                    ? 'Tente expandir a área de busca ou criar uma partida na sua região.'
                    : 'Volte mais tarde ou crie uma nova partida para seus amigos.'
            }</p>
          </div>
        ) : (
          <>
            <div className="matches-grid">
              {paginatedMatches.map((match) => (
                <div
                  key={match.id}
                  className={`match-card ${isPastMatch(match.date) ? 'past-match' : ''}`}
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  <div className="match-header">
                    <h2 className="match-title">{match.title}</h2>
                    <span className={`match-status status-${match.status}`}>
                      {getStatusLabel(match.status)}
                    </span>
                  </div>
                  
                  <div className="match-info">
                    <div className="info-row">
                      <EventIcon style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#1e3c72' }} />
                      <strong>Data:</strong> {formatDate(match.date)}
                    </div>
                    <div className="info-row">
                      <AccessTimeIcon style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#1e3c72' }} />
                      <strong>Hora:</strong> {formatTime(match.date)}
                    </div>
                    <div className="info-row">
                      <LocationOnIcon style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#1e3c72' }} />
                      <strong>Local:</strong> {match.location}
                    </div>
                    {filter === 'nearby' && match.distance !== undefined && (
                      <div className="info-row distance-row">
                        <MyLocationIcon style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#1e3c72' }} />
                        <strong>Distância:</strong> {formatDistance(match.distance)}
                      </div>
                    )}
                    <div className="info-row">
                      <PersonIcon style={{ fontSize: '1rem', marginRight: '0.5rem', color: '#1e3c72' }} />
                      <strong>Jogadores:</strong> {match.players?.length || 0} / {match.maxPlayers}
                    </div>
                  </div>
                  
                  {match.price && (
                    <div className="match-price">
                      R$ {(() => {
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
                  
                  {!isPastMatch(match.date) && match.status === 'open' && !isUserInMatch(match) && match.organizerId !== currentUser.id && (
                    <button
                      className="join-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinMatch(match.id);
                      }}
                    >
                      Entrar na Partida
                    </button>
                  )}
                  
                  {isUserInMatch(match) && match.organizerId !== currentUser.id && (
                    <div className="already-joined">
                      Você está participando desta partida
                    </div>
                  )}
                  
                  {match.organizerId === currentUser.id && (
                    <div className="organizer-badge">
                      Você é o organizador
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  variant="outlined" 
                  shape="rounded"
                  size="large"
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MatchList; 