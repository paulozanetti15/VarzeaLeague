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
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DirectionsIcon from '@mui/icons-material/Directions';
import { api } from '../../services/api';
import './MatchList.css';
import { toast } from 'react-hot-toast';

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
    teamId?: number;
    isTeam?: boolean;
    playerCount?: number;
  }>;
  latitude?: number;
  longitude?: number;
  distance?: number;
  _hasPlayerLoadError?: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface RegionInfo {
  baseLat: number;
  baseLng: number;
  radius: number;
}

const regions: Record<string, RegionInfo> = {
  'rondonópolis': {baseLat: -16.47, baseLng: -54.63, radius: 0.05},
  'rondonopolis': {baseLat: -16.47, baseLng: -54.63, radius: 0.05},
  'cuiabá': {baseLat: -15.60, baseLng: -56.09, radius: 0.05},
  'cuiaba': {baseLat: -15.60, baseLng: -56.09, radius: 0.05},
  'são paulo': {baseLat: -23.55, baseLng: -46.63, radius: 0.1}, 
  'sao paulo': {baseLat: -23.55, baseLng: -46.63, radius: 0.1},
  'rio de janeiro': {baseLat: -22.90, baseLng: -43.20, radius: 0.1},
  'brasília': {baseLat: -15.78, baseLng: -47.92, radius: 0.05},
  'brasilia': {baseLat: -15.78, baseLng: -47.92, radius: 0.05},
  'campo grande': {baseLat: -20.44, baseLng: -54.65, radius: 0.05},
  'goiânia': {baseLat: -16.68, baseLng: -49.25, radius: 0.05},
  'goiania': {baseLat: -16.68, baseLng: -49.25, radius: 0.05},
  'belo horizonte': {baseLat: -19.91, baseLng: -43.93, radius: 0.05},
  'curitiba': {baseLat: -25.42, baseLng: -49.27, radius: 0.05},
  'porto alegre': {baseLat: -30.03, baseLng: -51.23, radius: 0.05},
  'recife': {baseLat: -8.05, baseLng: -34.88, radius: 0.05},
  'salvador': {baseLat: -12.97, baseLng: -38.50, radius: 0.05},
  'fortaleza': {baseLat: -3.73, baseLng: -38.52, radius: 0.05},
  'manaus': {baseLat: -3.12, baseLng: -60.02, radius: 0.05},
  'vitória': {baseLat: -20.32, baseLng: -40.34, radius: 0.05},
  'vitoria': {baseLat: -20.32, baseLng: -40.34, radius: 0.05},
  'florianópolis': {baseLat: -27.60, baseLng: -48.55, radius: 0.05},
  'florianopolis': {baseLat: -27.60, baseLng: -48.55, radius: 0.05},
  'natal': {baseLat: -5.79, baseLng: -35.21, radius: 0.05},
  'joão pessoa': {baseLat: -7.12, baseLng: -34.88, radius: 0.05},
  'joao pessoa': {baseLat: -7.12, baseLng: -34.88, radius: 0.05},
  'maceió': {baseLat: -9.65, baseLng: -35.73, radius: 0.05},
  'maceio': {baseLat: -9.65, baseLng: -35.73, radius: 0.05},
  'teresina': {baseLat: -5.09, baseLng: -42.80, radius: 0.05},
  'macapá': {baseLat: 0.03, baseLng: -51.07, radius: 0.05},
  'macapa': {baseLat: 0.03, baseLng: -51.07, radius: 0.05},
  'palmas': {baseLat: -10.24, baseLng: -48.35, radius: 0.05},
  'boavista': {baseLat: 2.82, baseLng: -60.67, radius: 0.05},
  'porto velho': {baseLat: -8.76, baseLng: -63.90, radius: 0.05},
  'rio branco': {baseLat: -9.97, baseLng: -67.81, radius: 0.05},
};

const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

// Adicionar novo componente para exibir banner de erro de conexão
const NetworkErrorBanner = ({ 
  onRetry, 
  isRetrying 
}: { 
  onRetry: () => void, 
  isRetrying: boolean 
}) => {
  return (
    <div className="network-error-banner">
      <div className="error-icon">
        <ErrorOutlineIcon />
      </div>
      <div className="error-message">
        Não foi possível estabelecer conexão com o servidor. Verifique sua conexão de internet.
      </div>
      <button 
        className="retry-button" 
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? 'Tentando...' : 'Tentar novamente'}
        <RefreshIcon fontSize="small" />
      </button>
    </div>
  );
};

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
  
  // Estado simplificado de paginação
  const [page, setPage] = useState(1);
  const matchesPerPage = 6;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Adicione um novo estado para controlar a atualização
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Adicione um estado para rastrear as contagens anteriores de jogadores
  const [previousPlayerCounts, setPreviousPlayerCounts] = useState<Record<number, number>>({});

  // Adicionar estado para controlar recarregamento manual
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Adicionar estado para rastrear partidas com erro
  const [matchesWithError, setMatchesWithError] = useState<number[]>([]);

  // Adicionar estado para rastrear tentativas de carregamento por partida
  const [retryAttempts, setRetryAttempts] = useState<Record<number, number>>({});

  // Adicionando estado para rastrear problemas de rede
  const [networkError, setNetworkError] = useState(false);
  const [lastNetworkCheck, setLastNetworkCheck] = useState(Date.now());

  // Adicione estado para controlar a tentativa de reconexão
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);

  // Adicionar tipo de ordenação por vagas restantes
  type SortOption = 'date' | 'proximity' | 'spots';
  const [sortBy, setSortBy] = useState<SortOption>('spots');

  useEffect(() => {
    // Tentar obter a localização do usuário ao carregar a página
    if (!userLocation && !locationError) {
      getUserLocation();
    }
  }, []);

  // Salvar localização no localStorage quando for obtida
  useEffect(() => {
    if (userLocation) {
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    }
  }, [userLocation]);

  useEffect(() => {
    if (filter === 'nearby' && !userLocation) {
      getUserLocation();
    } else {
      fetchMatches();
    }
  }, [filter, userLocation, lastUpdate]);

  // Efeito para filtrar as partidas baseado na busca
  useEffect(() => {
    // Verificação de segurança para evitar o erro "Cannot read properties of undefined (reading 'length')"
    if (!matches || !Array.isArray(matches) || matches.length === 0) return;
    
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

  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador');
      setLocationLoading(false);
      return;
    }
    
    console.log('Solicitando permissão de localização ao navegador...');
    
    // Usar o método getCurrentPosition da API Geolocation
    navigator.geolocation.getCurrentPosition(
      // Callback de sucesso
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log(`Localização obtida com sucesso: ${lat}, ${lng}`);
        
        setUserLocation({
          latitude: lat,
          longitude: lng
        });
        setLocationLoading(false);
        
        // Salvar localização no localStorage para uso futuro
        localStorage.setItem('userLocation', JSON.stringify({
          latitude: lat,
          longitude: lng
        }));
        
        // Notificar o usuário que a localização foi obtida com sucesso
        toast.success('Localização obtida com sucesso! Calculando distâncias...', {
          position: "top-right",
          duration: 3000
        });
        
        // Agora que temos a localização, recalcular as distâncias para todas as partidas
        if (matches.length > 0) {
          calculateDistanceForAllMatches(matches, { latitude: lat, longitude: lng });
        } else {
          // Se ainda não temos partidas, vamos buscar
          fetchMatches();
        }
      },
      // Callback de erro
      (error) => {
        console.error('Erro ao obter localização:', error);
        let errorMsg = 'Não foi possível obter sua localização. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Permissão de localização negada. Por favor, permita o acesso à localização no seu navegador e recarregue a página.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Informação de localização indisponível.';
            break;
          case error.TIMEOUT:
            errorMsg += 'O tempo para obter sua localização expirou.';
            break;
          default:
            errorMsg += 'Verifique se você permitiu o acesso à localização.';
        }
        
        setLocationError(errorMsg);
        setLocationLoading(false);
      },
      // Opções
      { 
        enableHighAccuracy: true,  // Alta precisão para melhor resultado
        timeout: 15000,            // 15 segundos de timeout
        maximumAge: 0              // Não aceitar dados em cache
      }
    );
  };

  // Adicionar função para calcular distâncias para todas as partidas com base na localização do usuário
  const calculateDistanceForAllMatches = (matchesList: Match[], location: Location) => {
    // Verificar se matchesList é válido antes de acessar sua propriedade length
    if (!matchesList || !Array.isArray(matchesList) || matchesList.length === 0) {
      console.log('Lista de partidas vazia ou inválida, não é possível calcular distâncias');
      return matchesList || [];
    }
    
    console.log(`Calculando distâncias para ${matchesList.length} partidas com base na localização do usuário: ${location.latitude}, ${location.longitude}`);
    
    const updatedMatches = matchesList.map(match => {
      const matchCopy = { ...match };
      
      // Extrair coordenadas do local da partida se ainda não existirem
      if ((!matchCopy.latitude || !matchCopy.longitude) && matchCopy.location) {
        // Extrair a cidade da localização de forma segura
        let city = undefined;
        if (matchCopy.location && typeof matchCopy.location === 'string') {
          const parts = matchCopy.location.split(', ');
          city = parts.length > 0 ? parts[0] : undefined;
        }
        
        const coords = extractCoordinates(matchCopy.location, city);
        if (coords) {
          matchCopy.latitude = coords.latitude;
          matchCopy.longitude = coords.longitude;
          console.log(`[COORD] Partida ${matchCopy.id}: "${matchCopy.location}" → (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`);
        } else {
          console.log(`[COORD] Partida ${matchCopy.id}: Não foi possível extrair coordenadas de "${matchCopy.location}"`);
        }
      }
      
      // Calcular distância se tivermos coordenadas válidas para a partida
      if (matchCopy.latitude && matchCopy.longitude) {
        try {
          matchCopy.distance = calculateDistance(
            location.latitude,
            location.longitude,
            matchCopy.latitude,
            matchCopy.longitude
          );
          console.log(`[DIST] Partida ${matchCopy.id}: Distância calculada: ${matchCopy.distance.toFixed(2)}km`);
        } catch (e) {
          console.error(`[ERRO] Falha ao calcular distância para partida ${matchCopy.id}:`, e);
          matchCopy.distance = undefined;
        }
      }
      
      return matchCopy;
    });
    
    // Atualizar o estado com as novas partidas que têm distâncias calculadas
    setMatches(updatedMatches);
    
    // Log de resumo
    const withDistance = updatedMatches.filter(m => m.distance !== undefined).length;
    console.log(`Distâncias calculadas: ${withDistance}/${matchesList.length} partidas (${((withDistance/matchesList.length)*100).toFixed(1)}%)`);
    
    // Notificar o usuário sobre as partidas com distância calculada
    if (withDistance > 0) {
      toast.success(`Calculada a distância para ${withDistance} partidas`, {
        position: "top-right",
        duration: 2000
      });
    } else if (matchesList.length > 0) {
      toast.error('Não foi possível calcular distâncias para as partidas', {
        position: "top-right",
        duration: 3000
      });
    }
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

  // Modificar a função extractCoordinates para usar a cidade fornecida
  const extractCoordinates = (location: string, city?: string): {latitude: number, longitude: number} | null => {
    if (!location) return null;
    
    console.log(`[EXTRACT] Iniciando extração de coordenadas para: "${location}" em "${city || 'cidade não especificada'}"`);
    
    // Primeira tentativa: procurar coordenadas explícitas no texto
    try {
      // Regex mais abrangente para capturar diferentes formatos de coordenadas
      const patterns = [
        /\(?(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)?/,                  // Formato básico: 12.345, -67.890
        /\(?(-?\d+\.?\d*)[,;]\s*(-?\d+\.?\d*)\)?/,               // Com separador vírgula ou ponto e vírgula
        /latitude\s*[=:]\s*(-?\d+\.?\d*).*longitude\s*[=:]\s*(-?\d+\.?\d*)/i, // Formato com rótulos
        /lat\s*[=:]\s*(-?\d+\.?\d*).*lng\s*[=:]\s*(-?\d+\.?\d*)/i,            // Formato abreviado
        /\(?\s*(-?\d+\.?\d*)\s*°\s*[NS]?\s*,\s*(-?\d+\.?\d*)\s*°\s*[EW]?\s*\)?/, // Formato com símbolos de grau
      ];
      
      const locationLower = location.toLowerCase();
      
      for (const regex of patterns) {
        const match = locationLower.match(regex);
        if (match && match.length >= 3) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          
          if (!isNaN(lat) && !isNaN(lng) && 
              lat >= -90 && lat <= 90 && // Latitude válida
              lng >= -180 && lng <= 180) { // Longitude válida
            console.log(`[EXTRACT] Coordenadas extraídas diretamente: ${lat}, ${lng}`);
            return { latitude: lat, longitude: lng };
          }
        }
      }
      
      // Segunda tentativa: tentar extrair como coordenadas invertidas
      for (const regex of patterns) {
        const match = locationLower.match(regex);
        if (match && match.length >= 3) {
          const lng = parseFloat(match[1]);
          const lat = parseFloat(match[2]);
          
          if (!isNaN(lat) && !isNaN(lng) && 
              lat >= -90 && lat <= 90 && // Latitude válida
              lng >= -180 && lng <= 180) { // Longitude válida
            console.log(`[EXTRACT] Coordenadas extraídas com inversão: ${lat}, ${lng}`);
            return { latitude: lat, longitude: lng };
          }
        }
      }
      
      // Terceira tentativa: usar a cidade fornecida para determinar a região
      if (city) {
        const cityLower = city.toLowerCase().trim();
        console.log(`[EXTRACT] Tentando encontrar coordenadas para a cidade: "${cityLower}"`);
        
        // Procurar a cidade no mapeamento
        for (const [keyword, regionInfo] of Object.entries(regions)) {
          if (cityLower.includes(keyword)) {
            console.log(`[EXTRACT] Cidade encontrada no mapeamento: "${keyword}"`);
            
            // Gerar hash único para o endereço completo
            const hash = stringToHash(location);
            
            // Usar o hash para criar deslocamentos determinísticos mas únicos dentro da região
            const latOffset = ((hash % 1000) / 1000) * regionInfo.radius * 2 - regionInfo.radius;
            const lngOffset = (((hash >> 10) % 1000) / 1000) * regionInfo.radius * 2 - regionInfo.radius;
            
            const coords = {
              latitude: regionInfo.baseLat + latOffset,
              longitude: regionInfo.baseLng + lngOffset
            };
            
            console.log(`[EXTRACT] Coordenadas geradas para "${location}" em ${city}: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
            return coords;
          }
        }
      }
      
      // Se chegou aqui, não encontrou a cidade no mapeamento
      console.log(`[EXTRACT] Cidade "${city}" não encontrada no mapeamento, usando coordenadas padrão do Brasil`);
      
      // Usar coordenadas do centro do Brasil como fallback
      const defaultRegion = {baseLat: -15.0, baseLng: -55.0, radius: 0.5};
      const hash = stringToHash(location);
      const latOffset = ((hash % 1000) / 1000) * defaultRegion.radius * 2 - defaultRegion.radius;
      const lngOffset = (((hash >> 10) % 1000) / 1000) * defaultRegion.radius * 2 - defaultRegion.radius;
      
      const coords = {
        latitude: defaultRegion.baseLat + latOffset,
        longitude: defaultRegion.baseLng + lngOffset
      };
      
      console.log(`[EXTRACT] Coordenadas geradas com fallback: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
      return coords;
      
    } catch (error) {
      console.error(`[EXTRACT] Erro ao processar coordenadas de "${location}":`, error);
      return null;
    }
  };

  const fetchMatches = async () => {
    if (networkError) {
      const isConnected = await checkServerConnection();
      if (!isConnected) return;
    }
    
    setLoading(true);
    try {
      const data = await api.matches.list();
      
      if (networkError) {
        setNetworkError(false);
      }
      
      let processedMatches = data;
      
      // Verificar partidas sem jogadores
      const missingPlayersMatches = processedMatches.filter((match: Match) => 
        !match.players || 
        !Array.isArray(match.players) || 
        match.players.length === 0 ||
        match._hasPlayerLoadError === true
      );
      
      if (missingPlayersMatches.length > 0) {
        // Buscar detalhes de cada partida sem jogadores
        for (const match of missingPlayersMatches) {
          try {
            const detailedMatch = await api.matches.getById(match.id);
            
            // Atualizar a partida na lista com os novos dados
            const index = processedMatches.findIndex((m: Match) => m.id === match.id);
            if (index !== -1) {
              processedMatches[index] = {
                ...processedMatches[index],
                players: detailedMatch.players || [],
                _hasPlayerLoadError: detailedMatch._hasPlayerLoadError || false
              };
              
              if (detailedMatch._hasPlayerLoadError) {
                setMatchesWithError(prev => 
                  prev.includes(match.id) ? prev : [...prev, match.id]
                );
              }
            }
          } catch (error) {
            setMatchesWithError(prev => 
              prev.includes(match.id) ? prev : [...prev, match.id]
            );
          }
        }
      }
      
      // Após buscar as partidas e resolver os jogadores perdidos, calcular distâncias se tivermos localização
      if (userLocation && processedMatches && Array.isArray(processedMatches)) {
        // Usar a função centralizada para calcular distâncias
        processedMatches = calculateDistanceForAllMatches(processedMatches, userLocation);
      }
      
      // Aplicar filtros
      if (filter === 'my') {
        processedMatches = processedMatches.filter((match: Match) => match.organizerId === currentUser.id);
      }
      
      // Mostrar logs para verificar distâncias
      console.log(`Total de partidas: ${processedMatches.length}`);
      console.log(`Partidas com coordenadas válidas: ${processedMatches.filter((m: Match) => m.latitude && m.longitude).length}`);
      console.log(`Partidas com distância calculada: ${processedMatches.filter((m: Match) => m.distance !== undefined).length}`);
      
      setMatches(processedMatches);
      
      // Não setamos filteredMatches aqui para evitar duplicação e loops
      // Isso será feito pelo useEffect de filtragem
    } catch (err: any) {
      await checkServerConnection();
      
      if (networkError) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
      } else {
        setError(err.message || 'Erro ao carregar partidas');
      }
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
    if (networkError) {
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
        return;
      }
    }
    
    try {
      await api.matches.join(matchId);
      
      // Buscar detalhes atualizados da partida específica
      const updatedMatch = await api.matches.getById(matchId);
      
      if (networkError) {
        setNetworkError(false);
      }
      
      // Atualizar a partida no estado local
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.id === matchId) {
            return {
              ...match,
              players: updatedMatch.players || match.players
            };
          }
          return match;
        });
      });
      
      // Forçar recarga da lista após um pequeno atraso
      setTimeout(() => setLastUpdate(Date.now()), 500);
    } catch (err: any) {
      await checkServerConnection();
      
      if (networkError) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
      } else {
        setError(err.message || 'Não foi possível entrar na partida');
      }
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
    if (distance === undefined) return 'N/A';
    
    if (distance < 1) {
      // Se for menos de 1km, mostrar em metros
      return `${Math.round(distance * 1000)}m`;
    }
    
    // Sempre usar uma casa decimal para manter o tamanho consistente
    return `${distance.toFixed(1)}km`;
  };

  const isUserInMatch = (match: Match) => {
    return match.players?.some(player => player.id === currentUser.id) || false;
  };

  const getStatusLabel = (match: Match) => {
    // Calcular se a partida está cheia baseado no número real de jogadores
    const totalPlayers = calculateTotalPlayers(match);
    const isFull = totalPlayers >= match.maxPlayers;
    
    // Se a partida está cheia mas o status ainda é 'open', mostrar como 'full'
    if (isFull && match.status === 'open') {
      return 'Cheia';
    }
    
    // Caso contrário, usar o status normal
    switch (match.status) {
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
        return match.status;
    }
  };

  // Corrigir a função isPastMatch para garantir que seja aplicada à data da partida
  const isPastMatch = (matchDate: string) => {
    const date = new Date(matchDate);
    return date < new Date();
  };

  // Adicionar função de mudança de página
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll para o topo da página quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adicione um useEffect para forçar a atualização contínua da interface
  useEffect(() => {
    // Função para atualizar a lista de partidas
    const updateMatches = () => {
      console.log('Atualizando lista de partidas...');
      fetchMatches();
    };
    
    // Atualizar imediatamente ao montar o componente
    updateMatches();
    
    // Configurar atualização a cada 15 segundos
    const interval = setInterval(updateMatches, 15000);
    
    // Limpar o intervalo quando desmontar o componente
    return () => clearInterval(interval);
  }, []); // Este efeito deve rodar apenas uma vez ao montar o componente

  // Adicione um efeito para atualizar as contagens anteriores quando as partidas mudarem
  useEffect(() => {
    if (matches.length > 0) {
      console.log('Verificando mudanças na contagem de jogadores...');
      
      // Para cada partida, verificar se a contagem mudou
      matches.forEach(match => {
        const currentCount = calculateTotalPlayers(match);
        const previousCount = previousPlayerCounts[match.id] || 0;
        
        if (previousCount !== 0 && previousCount !== currentCount) {
          console.log(`[PARTIDA ${match.id}] Contagem mudou: ${previousCount} -> ${currentCount}`);
          
          // Aplicar animação com pequeno atraso para garantir que o DOM foi atualizado
          setTimeout(() => {
            const playerCountElement = document.querySelector(`[data-match-id="${match.id}"] .player-count`);
            if (playerCountElement) {
              playerCountElement.classList.add('player-count-changed');
              setTimeout(() => {
                playerCountElement.classList.remove('player-count-changed');
              }, 800); // Duração da animação
            }
          }, 100);
        }
      });
      
      // Atualizar o estado com as contagens atuais para comparação futura
      const newCounts: Record<number, number> = {};
      matches.forEach(match => {
        newCounts[match.id] = calculateTotalPlayers(match);
      });
      setPreviousPlayerCounts(newCounts);
    }
  }, [matches]);

  // Função aprimorada para calcular o total de jogadores com debug detalhado
  const calculateTotalPlayers = (match: Match) => {
    if (!match) {
      return 0;
    }

    if (match._hasPlayerLoadError) {
      if (!matchesWithError.includes(match.id)) {
        setMatchesWithError(prev => [...prev, match.id]);
      }
      return 0;
    }

    if (!match.players || !Array.isArray(match.players)) {
      if (!matchesWithError.includes(match.id)) {
        setMatchesWithError(prev => [...prev, match.id]);
      }
      return 0;
    }

    try {
      const validPlayers = match.players.filter(player => player && typeof player === 'object');
      
      // Contar jogadores regulares
      const regularPlayers = validPlayers.filter(player => !player.isTeam);
      const regularCount = regularPlayers.length;
      
      // Contar times e seus jogadores
      const teamPlayers = validPlayers.filter(player => player.isTeam === true);
      let teamPlayersCount = 0;
      
      teamPlayers.forEach(team => {
        teamPlayersCount += (team.playerCount && typeof team.playerCount === 'number' && team.playerCount > 0) 
          ? team.playerCount 
          : 1;
      });
      
      const totalPlayers = regularCount + teamPlayersCount;
      
      // Remover do estado de erros
      if (matchesWithError.includes(match.id)) {
        setMatchesWithError(prev => prev.filter(id => id !== match.id));
      }
      
      return totalPlayers;
    } catch (error) {
      if (!matchesWithError.includes(match.id)) {
        setMatchesWithError(prev => [...prev, match.id]);
      }
      return 0;
    }
  };

  // Função para verificar se a partida está cheia
  const isMatchFull = (match: Match) => {
    const totalPlayers = calculateTotalPlayers(match);
    return totalPlayers >= match.maxPlayers;
  };

  // Função para determinar o status visual da capacidade de jogadores
  const getPlayerCapacityStatus = (match: Match) => {
    const totalPlayers = calculateTotalPlayers(match);
    const maxPlayers = match.maxPlayers;
    const percentage = (totalPlayers / maxPlayers) * 100;
    
    if (percentage >= 100) {
      return {
        icon: <WarningIcon fontSize="small" style={{ color: '#ed6c02', marginLeft: '8px' }} />,
        text: 'Partida Cheia',
        class: 'capacity-full'
      };
    } else if (percentage >= 75) {
      return {
        icon: <WarningIcon fontSize="small" style={{ color: '#fb8c00', marginLeft: '8px' }} />,
        text: 'Quase Cheia',
        class: 'capacity-high'
      };
    } else if (percentage >= 50) {
      return {
        icon: <GroupIcon fontSize="small" style={{ color: '#2e7d32', marginLeft: '8px' }} />,
        text: 'Preenchida pela Metade',
        class: 'capacity-medium'
      };
    } else {
      return {
        icon: <CheckCircleIcon fontSize="small" style={{ color: '#2e7d32', marginLeft: '8px' }} />,
        text: 'Muitas Vagas',
        class: 'capacity-low'
      };
    }
  };

  // Adicione uma função para atualizar a lista de partidas periodicamente
  useEffect(() => {
    // Atualizar a cada 30 segundos para verificar mudanças no número de jogadores
    const interval = setInterval(() => {
      if (!loading) {
        console.log('Atualizando lista de partidas automaticamente...');
        setLastUpdate(Date.now());
      }
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [loading]);

  // Adicione uma função para formatar o tempo de última atualização
  const formatLastUpdate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) {
      return 'agora mesmo';
    } else if (diff < 60000) {
      const seconds = Math.floor(diff / 1000);
      return `há ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`;
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    const date = new Date(timestamp);
    return `às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Simplificar a função para verificar a conexão com o servidor
  const checkServerConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // URL base da API
      const baseUrl = 'http://localhost:3001/api';
      
      const response = await fetch(`${baseUrl}/health?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setNetworkError(false);
        setLastNetworkCheck(Date.now());
        return true;
      }
      
      throw new Error('Servidor não respondeu com status OK');
    } catch (error) {
      setNetworkError(true);
      setLastNetworkCheck(Date.now());
      return false;
    }
  };

  // Verificar a conexão periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      checkServerConnection();
    }, 20000); // Verifica a cada 20 segundos
    
    // Verificar na primeira renderização
    checkServerConnection();
    
    return () => clearInterval(interval);
  }, []);

  // Modificar a lógica de apresentação de erros
  const renderErrorIndicator = () => {
    const errorCount = matchesWithError.length;
    
    if (errorCount === 0) return null;
    
    return (
      <span 
        className="error-indicator" 
        onClick={() => handleManualRefresh()}
        title="Clique para tentar recuperar todas as partidas com erro"
      >
        <ErrorOutlineIcon fontSize="small" style={{ fontSize: '1rem', marginRight: '4px' }} />
        {errorCount} {errorCount === 1 ? 'partida' : 'partidas'} com erro
        {networkError && (
          <span className="network-error-badge">
            Problemas de conexão
          </span>
        )}
      </span>
    );
  };

  // Simplificar a função para recarregar manualmente
  const handleManualRefresh = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (networkError) {
      const isConnected = await checkServerConnection();
      if (!isConnected) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
        return;
      }
    }

    setIsRefreshing(true);
    try {
      await fetchMatches();
      setError('');
    } catch (error) {
      await checkServerConnection();
      
      if (networkError) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
      }
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
  };

  // Adicionar função para limpar um erro específico após tentativa bem-sucedida
  const clearMatchError = (matchId: number) => {
    setMatchesWithError(prev => prev.filter(id => id !== matchId));
  };

  // Simplificar a função para recarregar uma partida específica
  const retryLoadMatchPlayers = async (matchId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      if (networkError) {
        const isConnected = await checkServerConnection();
        if (!isConnected) return;
      }
      
      setRetryAttempts(prev => ({
        ...prev,
        [matchId]: (prev[matchId] || 0) + 1
      }));
      
      const card = document.querySelector(`[data-match-id="${matchId}"]`);
      if (card) {
        card.classList.add('match-card-loading');
      }
      
      const updatedMatch = await api.matches.getById(matchId);
      
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.id === matchId) {
            if (updatedMatch.players && 
                Array.isArray(updatedMatch.players) && 
                !updatedMatch._hasPlayerLoadError) {
              clearMatchError(matchId);
            }
            
            return {
              ...match,
              players: updatedMatch.players || match.players,
              _hasPlayerLoadError: updatedMatch._hasPlayerLoadError
            };
          }
          return match;
        });
      });
      
    } catch (error) {
      await checkServerConnection();
    } finally {
      setTimeout(() => {
        const card = document.querySelector(`[data-match-id="${matchId}"]`);
        if (card) {
          card.classList.remove('match-card-loading');
        }
      }, 500);
    }
  };

  // Função para tentar reconectar com o servidor
  const handleRetryConnection = async () => {
    setIsRetryingConnection(true);
    try {
      console.log('Tentando reconectar com o servidor...');
      const isConnected = await checkServerConnection();
      
      if (isConnected) {
        console.log('Reconexão bem-sucedida, recarregando dados...');
        fetchMatches();
      } else {
        console.log('Falha na tentativa de reconexão');
      }
    } catch (error) {
      console.error('Erro ao tentar reconectar:', error);
    } finally {
      setIsRetryingConnection(false);
    }
  };

  // Função para calcular os spots restantes entre maxPlayers e players.length
  const calculateRemainingSpots = (match: Match) => {
    const totalPlayers = match.players ? match.players.reduce((total, player) => {
      return total + (player.isTeam && player.playerCount ? player.playerCount : 1);
    }, 0) : 0;
    
    return match.maxPlayers - totalPlayers;
  };

  // Função para determinar a classe de disponibilidade com base nos spots restantes
  const getAvailabilityClass = (match: Match) => {
    const remainingSpots = calculateRemainingSpots(match);
    
    if (remainingSpots <= 0) return 'no-availability';
    if (remainingSpots <= 2) return 'low-availability';
    if (remainingSpots <= 4) return 'medium-availability';
    return 'high-availability';
  };

  // Calcular os matches atuais para a página atual
  const indexOfLastMatch = page * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);

  // Componente para exibir a contagem de jogadores e vagas restantes
  const PlayerCountDisplay = ({ match }: { match: Match }) => {
    const remainingSpots = calculateRemainingSpots(match);
    const availabilityClass = getAvailabilityClass(match);
    
    const totalPlayers = match.players ? match.players.reduce((total, player) => {
      return total + (player.isTeam && player.playerCount ? player.playerCount : 1);
    }, 0) : 0;

    return (
      <div className="player-count">
        <div className="player-count-header">
          <GroupIcon fontSize="small" />
          <span>Jogadores</span>
        </div>
        <div className="player-count-value">
          <div className="player-count-badge">
            {totalPlayers}
          </div>
          <div className="player-count-separator">/</div>
          <div className="max-players-badge">
            {match.maxPlayers}
          </div>
        </div>
        <div className={`remaining-spots ${availabilityClass}`}>
          {remainingSpots > 0 ? (
            <div className="spots-available">
              <PersonAddIcon fontSize="small" />
              {remainingSpots === 1 ? (
                <span>Última vaga!</span>
              ) : (
                <span>{remainingSpots} vagas restantes</span>
              )}
            </div>
          ) : (
            <div className="no-spots-left">
              Partida completa
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modificar o useEffect de ordenação para evitar loops
  useEffect(() => {
    // Verificação de segurança para evitar o erro "Cannot read properties of undefined (reading 'length')"
    if (!matches || !Array.isArray(matches) || matches.length === 0) return;
    
    let sorted = [...matches];
    
    // Aplicando filtro
    if (filter === 'my') {
      sorted = sorted.filter((match) => match.organizerId === currentUser.id);
    }
    
    // Caso alguma partida tenha perdido a propriedade de distância, recalcular
    if (userLocation) {
      // Verificar se alguma partida perdeu sua distância
      for (const match of sorted) {
        if (match.latitude && match.longitude && match.distance === undefined) {
          try {
            match.distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              match.latitude,
              match.longitude
            );
          } catch (e) {
            // Silenciosamente ignorar erros
          }
        }
      }
    }
    
    // Aplicando ordenação
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'proximity' && userLocation) {
      sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (sortBy === 'spots') {
      sorted.sort((a, b) => {
        const spotsA = calculateRemainingSpots(a);
        const spotsB = calculateRemainingSpots(b);
        
        // Priorizar partidas com vagas disponíveis
        if (spotsA === 0 && spotsB > 0) return 1;
        if (spotsA > 0 && spotsB === 0) return -1;
        
        // Entre partidas com vagas, mostrar as com menos vagas primeiro
        if (spotsA > 0 && spotsB > 0) return spotsA - spotsB;
        
        // Entre partidas sem vagas, ordenar por data
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }
    
    setFilteredMatches(sorted);
    setPage(1); // Reset para a primeira página quando os filtros mudam
  }, [matches, filter, userLocation, sortBy, currentUser.id]);

  return (
    <div className="match-list-container">
      <button 
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon />
      </button>

      <div className="content-container">
        {/* Exibir banner de erro de conexão quando necessário */}
        {networkError && (
          <NetworkErrorBanner 
            onRetry={handleRetryConnection} 
            isRetrying={isRetryingConnection} 
          />
        )}
        
        {/* Título centralizado */}
        <h1 className="matches-title">Partidas Disponíveis</h1>
        
        <div className="header-container">
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

            <div className="last-update-indicator">
              Atualizado {formatLastUpdate(lastUpdate)}
              <button 
                className={`refresh-button ${isRefreshing ? 'refreshing' : ''} ${networkError ? 'network-error' : ''}`}
                onClick={(e) => handleManualRefresh(e)}
                disabled={isRefreshing || loading}
                title={networkError ? "Problemas de conexão detectados" : "Atualizar agora"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </button>
              {renderErrorIndicator()}
            </div>

            <div className="filter-container">
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(e, newFilter) => {
                  if (newFilter !== null) {
                    setFilter(newFilter);
                  }
                }}
                aria-label="filtro de partidas"
              >
                <ToggleButton value="all" aria-label="todas as partidas">
                  <AllInclusiveIcon style={{ fontSize: '0.9rem' }} />
                  Todas
                </ToggleButton>
                <ToggleButton value="my" aria-label="minhas partidas">
                  <PersonIcon style={{ fontSize: '0.9rem' }} />
                  Minhas
                </ToggleButton>
                <ToggleButton value="nearby" aria-label="partidas próximas" disabled={!userLocation}>
                  <LocationOnIcon style={{ fontSize: '0.9rem' }} />
                  {locationLoading ? 'Obtendo localização...' : 'Por proximidade'}
                  {filter === 'nearby' && !locationLoading && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      marginLeft: '4px', 
                      background: 'rgba(33, 150, 243, 0.2)', 
                      padding: '2px 6px', 
                      borderRadius: '10px' 
                    }}>
                      todas
                    </span>
                  )}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
            
            <div className="sort-container">
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(e, newSort) => {
                  if (newSort !== null) {
                    setSortBy(newSort);
                  }
                }}
                aria-label="ordenação de partidas"
                size="small"
              >
                <ToggleButton value="date" aria-label="ordenar por data">
                  <EventIcon style={{ fontSize: '0.9rem' }} />
                  Data
                </ToggleButton>
                <ToggleButton value="spots" aria-label="ordenar por vagas restantes">
                  <PersonAddIcon style={{ fontSize: '0.9rem' }} />
                  Vagas
                </ToggleButton>
                <ToggleButton value="proximity" aria-label="ordenar por proximidade" disabled={!userLocation}>
                  <LocationOnIcon style={{ fontSize: '0.9rem' }} />
                  Distância
                  {sortBy === 'proximity' && !locationLoading && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      marginLeft: '4px', 
                      background: 'rgba(255, 152, 0, 0.2)', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      color: '#F57C00' 
                    }}>
                      {filteredMatches.length > 0 ? `${Math.min(...filteredMatches.map(m => m.distance || 999)).toFixed(1)}km` : ''}
                    </span>
                  )}
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

        {(loading || locationLoading) ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>{locationLoading ? 'Obtendo sua localização...' : 'Carregando partidas...'}</p>
          </div>
        ) : filter === 'nearby' && !userLocation ? (
          <div className="no-matches">
            <h3>Localização necessária</h3>
            <p>Precisamos da sua localização para mostrar partidas próximas.</p>
            <button 
              onClick={getUserLocation}
              className="create-match-btn"
              style={{ maxWidth: '300px', marginTop: '20px' }}
            >
              Permitir acesso à localização
            </button>
            {locationError && (
              <div className="error-message" style={{ marginTop: '15px', color: 'var(--error-color)' }}>
                {locationError}
              </div>
            )}
          </div>
        ) : filter === 'nearby' && !locationError && filteredMatches.length === 0 ? (
          <div className="no-matches">
            <h3>Nenhuma partida encontrada</h3>
            <p>Não encontramos nenhuma partida com coordenadas válidas para calcular a distância.</p>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Sua localização atual:</p>
              <p>{userLocation?.latitude.toFixed(6)}, {userLocation?.longitude.toFixed(6)}</p>
              <button 
                onClick={() => navigate('/matches/create')}
                className="create-match-btn"
                style={{ maxWidth: '300px', marginTop: '20px' }}
              >
                Criar uma partida na sua região
              </button>
            </div>
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
            {filter === 'nearby' && (
              <div className="proximity-info" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '10px 15px',
                borderRadius: 'var(--border-radius)',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MyLocationIcon style={{ color: 'var(--primary-color)' }} />
                <span>
                  Mostrando todas as partidas ordenadas por distância
                  {userLocation && (
                    <>
                     {' '}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        (sua localização: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
                      </span>
                    </>
                  )}
                </span>
              </div>
            )}
            <div className="matches-grid">
              {loading ? (
                // Placeholders de carregamento - Sempre 6
                Array.from({ length: matchesPerPage }).map((_, index) => (
                  <div key={`loading-${index}`} className="match-card match-card-loading">
                    <div className="match-card-inner">
                      <div className="loading-placeholder title"></div>
                      <div className="loading-placeholder date"></div>
                      <div className="loading-placeholder location"></div>
                      <div className="loading-placeholder players"></div>
                      <div className="loading-placeholder join"></div>
                    </div>
                  </div>
                ))
              ) : currentMatches.length > 0 ? (
                currentMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`match-card ${
                      isUserInMatch(match) ? "user-in-match" : ""
                    } ${
                      isPastMatch(match.date) ? "past-match" : ""
                    } ${
                      matchesWithError.includes(match.id) ? "player-count-has-error" : ""
                    }`}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    data-match-id={match.id}
                  >
                    <div className="match-card-corner"></div>
                    <div className="match-card-inner">
                      <div className="match-card-gradient"></div>
                      <div className="match-header">
                        <h2 className="match-title">{match.title}</h2>
                        <span className={`match-status status-${isMatchFull(match) && match.status === 'open' ? 'full' : match.status}`}>
                          {getStatusLabel(match)}
                        </span>
                      </div>
                      
                      <div className="match-info">
                        <div className="info-row">
                          <EventIcon fontSize="small" />
                          <strong>Data:</strong> {formatDate(match.date)}
                        </div>
                        <div className="info-row">
                          <AccessTimeIcon fontSize="small" />
                          <strong>Hora:</strong> {formatTime(match.date)}
                        </div>
                        <div className="info-row">
                          <LocationOnIcon fontSize="small" />
                          <strong>Local:</strong> {match.location}
                        </div>
                        {match.distance !== undefined ? (
                          <div className="info-row distance-row">
                            <DirectionsIcon fontSize="small" />
                            <span className={`distance-badge ${
                              match.distance <= 2 
                                ? 'distance-close' 
                                : match.distance <= 5 
                                  ? 'distance-medium' 
                                  : match.distance <= 10 
                                    ? 'distance-far' 
                                    : 'distance-very-far'
                            }`}>
                              {formatDistance(match.distance)}
                            </span>
                            <span className="distance-text">de distância</span>
                          </div>
                        ) : userLocation && match.location ? (
                          // Se temos localização do usuário mas não calculamos distância,
                          // tentar calcular na hora como fallback
                          (() => {
                            // Tentar extrair coordenadas e calcular distância no momento da renderização
                            const coords = extractCoordinates(match.location, match.location.split(', ')[0]);
                            if (coords && userLocation) {
                              try {
                                const distance = calculateDistance(
                                  userLocation.latitude,
                                  userLocation.longitude,
                                  coords.latitude,
                                  coords.longitude
                                );
                                match.distance = distance; // Salvar para futuras renderizações
                                return (
                                  <div className="info-row distance-row">
                                    <DirectionsIcon fontSize="small" />
                                    <span className={`distance-badge distance-calculated-onthefly`}>
                                      {formatDistance(distance)}
                                    </span>
                                    <span className="distance-text">de distância</span>
                                  </div>
                                );
                              } catch (e) {
                                console.error(`Erro ao calcular distância para partida ${match.id} durante renderização:`, e);
                              }
                            }
                            return null;
                          })()
                        ) : null}
                      </div>
                      
                      <PlayerCountDisplay match={match} />
                      
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
                        {!isPastMatch(match.date) && match.status === 'open' && !isUserInMatch(match) && match.organizerId !== currentUser.id && !isMatchFull(match) && (
                          <button
                            className="join-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinMatch(match.id);
                            }}
                          >
                            Entrar nesta partida
                          </button>
                        )}
                        
                        {!isPastMatch(match.date) && (match.status === 'open' || match.status === 'full') && !isUserInMatch(match) && match.organizerId !== currentUser.id && isMatchFull(match) && (
                          <div className="match-full-message">
                            Partida cheia
                          </div>
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
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-matches">
                  <h3>Nenhuma partida encontrada</h3>
                  <p>Tente ajustar os filtros ou criar uma nova partida.</p>
                </div>
              )}
            </div>

            {filteredMatches.length > matchesPerPage && (
              <div className="pagination-container">
                <Pagination 
                  count={Math.ceil(filteredMatches.length / matchesPerPage)} 
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