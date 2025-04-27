import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import DirectionsIcon from '@mui/icons-material/Directions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Map, IframeMap } from '../../components/Map';
import { api } from '../../services/api';
import { geocodeAddress } from '../../services/geocodeService';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import RegrasFormInfoModal from '../../components/Modals/Athlete/RegrasFormInfoModal';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { get } from 'http';

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [useIframeMap, setUseIframeMap] = useState(false);
  const [showTeamOptions, setShowTeamOptions] = useState(false);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [simulationMode, setSimulationMode] = useState(false);
  const [userIsInMatch, setUserIsInMatch] = useState(false);
  const [selectedTeamForView, setSelectedTeamForView] = useState<any>(null);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [timeCadastrados, setTimeCadastrados] = useState<any>([]); 
  const fetchLocationByIP = async () => {
    toast.loading('Obtendo localização aproximada pelo seu IP...');
    try {
      const ipResponse = await fetch('https://geolocation-db.com/json/', {
        mode: 'cors'
      });
      const data = await ipResponse.json();
      
      if (data.latitude && data.longitude) {
        const userLoc = {
          lat: data.latitude,
          lng: data.longitude
        };
        setUserLocation(userLoc);
        toast.dismiss();
        toast.success('Localização aproximada obtida pelo seu IP');
        
        // Calcular distância se a partida tiver localização
        const locationData = getLocationData();
        if (locationData && locationData.lat && locationData.lng) {
          const dist = calculateDistance(
            userLoc.lat, 
            userLoc.lng, 
            locationData.lat, 
            locationData.lng
          );
          setDistance(dist);
        }
      } else {
        toast.dismiss();
        toast.error('Não foi possível determinar sua localização pelo IP');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao obter localização por IP');
    }
  };
  
  const getTimeInscrito = async (matchId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/matches/${matchId}/join-team`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTimeCadastrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar times cadastrados:', error);
    }
  };
  useEffect(() => {
    if (id) {
      getTimeInscrito(id);
    }
  }, [id]); 
  
  useEffect(() => {
    try {
      const joinedMatchesWithTeam = JSON.parse(localStorage.getItem('joinedMatchesWithTeam') || '{}');
      if (typeof joinedMatchesWithTeam !== 'object') {
        localStorage.setItem('joinedMatchesWithTeam', JSON.stringify({}));
      }
    } catch (e) {
      localStorage.setItem('joinedMatchesWithTeam', JSON.stringify({}));
    }
  
    const fetchRealTeams = async () => {
      try {
        localStorage.removeItem('userTeams');
        await api.teams.getUserTeams();
      } catch (e) {
        toast.error('Erro ao buscar times do usuário. Verifique sua conexão ou tente novamente mais tarde.');
      }
    };
    
    const userExists = localStorage.getItem('user');
    if (userExists && JSON.parse(userExists).id) {
      fetchRealTeams();
    }
  }, [currentUser?.id]); // Executar apenas uma vez no início
  
  // Garantir que currentUser tenha ao menos um objeto vazio
  useEffect(() => {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []); // Add missing closing parenthesis for the first useEffect
  useEffect(() => {
    const fetchMatchDetailsInit = async () => {
      try {
        setLoading(true);
        try {
          const storedTeams = localStorage.getItem('userTeams');
        } catch (e) {
          // Silenciar erro
        }
        
        const response = await api.matches.getById(Number(id));

        setMatch(response);
  
        if (response.location?.address && 
            (!response.location.latitude || !response.location.longitude)) {
          try {
            const coordinates = await geocodeAddress(response.location.address);
            if (coordinates) {
              setMatch((prev: any) => ({
                ...prev,
                location: {
                  ...prev.location,
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude
                }
              }));
            }
          } catch (error) {
            // Silenciar erro de geocodificação
          }
        }
       
        try {
          const matchId = id || '';
          const joinedMatchesWithTeam = JSON.parse(localStorage.getItem('joinedMatchesWithTeam') || '{}');
          const hasJoinedWithTeam = joinedMatchesWithTeam[matchId] && Array.isArray(joinedMatchesWithTeam[matchId]) && joinedMatchesWithTeam[matchId].length > 0;
          
          if (hasJoinedWithTeam && currentUser) {
            let updatedResponse = {...response};            
            const userTeamIds = joinedMatchesWithTeam[matchId] || [];
            try {
              // Buscar times diretamente da API
              let userTeams: any[] = [];
              
              try {
                // Tenta buscar da API específica
                userTeams = await api.teams.getUserTeams();
              } catch (e) {
                // Se falhar, tenta da lista geral
                try {
                  const allTeams = await api.teams.list();
                  if (Array.isArray(allTeams) && currentUser.id) {
                    userTeams = allTeams.filter(t => t.ownerId === currentUser.id);
                  }
                } catch (e2) {
                  // Silenciar erro
                }
              }
              if (userTeams.length === 0) {
                setError("Você não tem times cadastrados mas participou anteriormente com times. Por favor, crie seus times na página de Times.");
              }
              
              for (const teamId of userTeamIds) {
                // Procura o time com este ID na lista de times do usuário
                const team = userTeams.find((t: any) => t && t.id === teamId);
                
                if (team && !updatedResponse.players.some((p: any) => p?.isTeam && p.teamId === teamId)) {
                  if (!updatedResponse.teams.some((t: any) => t && t.id === teamId)) {
                    updatedResponse.teams.push(team);
                  }
                }
              }
              setMatch(updatedResponse);
              setSimulationMode(true); // Marca como simulação, já que os dados locais são usados
            } catch (e) {
              // Silenciar erro
            }
          }
        } catch (e) {
          // Silenciar erro
        }
        
        // Tentar obter a localização do usuário
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLoc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userLoc);
              toast.success('Sua localização foi obtida com sucesso!');
              
              // Calcular distância se a partida tiver localização
              const locationData = getLocationData();
              if (locationData && locationData.lat && locationData.lng) {
                const dist = calculateDistance(
                  userLoc.lat, 
                  userLoc.lng, 
                  locationData.lat, 
                  locationData.lng
                );
                setDistance(dist);
              } else if (locationData && locationData.address && !locationData.lat && !locationData.lng) {
                // Temos apenas o endereço, precisamos geocodificar
                geocodeAddressAndCalculateDistance(locationData.address, userLoc);
              }
            },
            (error) => {
              // Mensagens de erro específicas
              let errorMsg = 'Não foi possível obter sua localização.';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg = 'Permissão para obter localização foi negada. Por favor, habilite o acesso à localização no seu navegador.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg = 'Informações de localização não estão disponíveis no momento.';
                  break;
                case error.TIMEOUT:
                  errorMsg = 'Tempo esgotado ao tentar obter sua localização.';
                  break;
              }
              
              toast.error(errorMsg);
              fetchLocationByIP();
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        }
      } catch (err) {
        setError('Não foi possível carregar os detalhes da partida. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      fetchMatchDetailsInit();
    }
  }, [id]);
  
  // Efeito para verificar o status do usuário na partida após o carregamento
  useEffect(() => {
    if (match && !loading && !error) {
      // Verificar se o usuário atual está na partida
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        (match.teams && Array.isArray(match.teams) && match.teams.some((team: any) => 
          team && team.players && Array.isArray(team.players) && team.players.some((player: any) => player && player.id === currentUser.id)
        )) ||
        // Usuário é capitão de um time que está na partida
        (match.teams && Array.isArray(match.teams) && match.teams.some((team: any) => 
          team && team.captainId === currentUser.id
        )) ||
        // Time do usuário está registrado na lista de jogadores como entidade
        (match.players && Array.isArray(match.players) && match.players.some((player: any) => 
          player && player.isTeam && player.teamId && match.teams && 
          match.teams.some((team: any) => team && team.id === player.teamId && team.captainId === currentUser.id)
        ));
    }
  }, [match, loading, error]);
 
  const forceRefresh = () => {
    setRefreshCounter(prevCount => prevCount + 1);
  };

  const handleJoinWithTeam = async (teamId: number) => {
    console.log("Entrando na partida com time:", teamId);
    setJoining(true);
    setError(null);
    
    try {
      if (!match) {
        throw new Error('Detalhes da partida não estão disponíveis');
      }
      
      // Buscar o time selecionado
      const selectedTeam = userTeams.find(team => team.id === teamId);
      if (!selectedTeam) {
        setError('Time não encontrado. Por favor, tente novamente.');
        toast.error('Time não encontrado. Por favor, tente novamente.');
        setJoining(false);
        return;
      }
      
      // Verificar se o time já está na partida
      const teamAlreadyInMatch = match.players && Array.isArray(match.players) && match.players.some(
        (player: { isTeam: boolean; teamId: number }) => player.isTeam && player.teamId === teamId
      );
      
      if (teamAlreadyInMatch) {
        setError('Este time já está participando desta partida.');
        toast.error('Este time já está participando desta partida.');
        setJoining(false);
        return;
      }

      const teamSize = selectedTeam.players?.length + 1 || 1; // +1 para o capitão
      try {
        // Importante: usar joinWithTeam em vez de join
        await axios.post(`http://localhost:3001/api/matches/${id}/join-team`, {
          teamId: teamId,
          matchId: id,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setSimulationMode(false);
        toast.success(`Seu time ${selectedTeam.name} entrou na partida com sucesso!`);
      } catch (apiError) {
        console.error("Erro na API ao entrar com time:", apiError);
        toast.error(`Erro ao se comunicar com o servidor. Modo simulação ativado.`);
        setSimulationMode(true);
      }
      
      // Atualizamos o estado local apenas após tentar a API
      // Cria uma representação do time para a lista de jogadores
      const teamEntry = {
        id: `team-${teamId}`,
        name: `${selectedTeam.name} (Time)`,
        isTeam: true,
        playerCount: teamSize,
        teamId: teamId
      };

      // Guardando em variáveis locais para não depender do estado atual
      let updatedMatch = {...match};
      updatedMatch.players = updatedMatch.players ? [...updatedMatch.players] : [];
      updatedMatch.teams = updatedMatch.teams ? [...updatedMatch.teams] : [];

      // Verifica se o time já existe
      const teamExists = updatedMatch.players.some(
        (p: any) => p?.isTeam && p?.teamId === teamId
      );

      if (!teamExists) {
        // Adiciona o time à lista de jogadores
        updatedMatch.players.push(teamEntry);
        // Adiciona o time na lista de times
        updatedMatch.teams.push(selectedTeam);
      }

      setMatch(updatedMatch);

      try {
        const matchId = id || '';
        const joinedMatchesWithTeam = JSON.parse(localStorage.getItem('joinedMatchesWithTeam') || '{}');
        
        // Garantir que joinedMatchesWithTeam[matchId] seja um array
        if (!joinedMatchesWithTeam[matchId]) {
          joinedMatchesWithTeam[matchId] = [];
        } else if (!Array.isArray(joinedMatchesWithTeam[matchId])) {
          joinedMatchesWithTeam[matchId] = [];
        }
        
        if (!joinedMatchesWithTeam[matchId].includes(teamId)) {
          joinedMatchesWithTeam[matchId].push(teamId);
        }
        
        localStorage.setItem('joinedMatchesWithTeam', JSON.stringify(joinedMatchesWithTeam));
      } catch (err) {
        // Silenciar erro
      }

      // Fecha as opções de time
      setShowTeamOptions(false);
      setUserIsInMatch(true);

      // Tenta recarregar os detalhes após um intervalo
      setTimeout(async () => {
        try {
          const response = await api.matches.getById(Number(id));
          
          // Verifica se nosso time ainda está na resposta, caso contrário, mantém a versão local
          const teamInResponse = response.players && response.players.some(
            (p: any) => p?.isTeam && p?.teamId === teamId
          );
          
          if (teamInResponse) {
            setMatch(response);
          }
        } catch (apiError) {
          console.error("Erro ao recarregar detalhes da partida:", apiError);
        }
        forceRefresh();
      }, 800);
    } catch (error) {
      console.error("Erro geral ao entrar na partida:", error);
      setError('Erro ao entrar na partida com o time. Tente novamente.');
      toast.error('Erro ao entrar na partida com o time. Tente novamente.');
    } finally {
      setJoining(false);
    }
  };
// ...existing code...
  const handleLeaveMatch = async () => {
    setLeaving(true);
    setError(null);
    
    try {
      // Verificar se o usuário está na partida
      if (!userIsInMatch || !match) {
        setError('Você não está participando desta partida');
        toast.error('Você não está participando desta partida');
        setLeaving(false);
        return;
      }
      
      // Identificar os times do usuário na partida
      const userTeamsInMatch = match.teams?.filter((team: any) => 
        team && (team.captainId === currentUser.id || 
          (team.players && team.players.some((p: any) => p && p.id === currentUser.id))
        )
      ) || [];
      
      if (userTeamsInMatch.length === 0) {
        setError('Não foi possível identificar seu time nesta partida');
        toast.error('Não foi possível identificar seu time nesta partida');
        setLeaving(false);
        return;
      }
      try {
        const joinedMatchesWithTeam = JSON.parse(localStorage.getItem('joinedMatchesWithTeam') || '{}');
        
        if (joinedMatchesWithTeam[match.id]) {
          // Remover os times que estamos saindo
          const teamIds: number[] = userTeamsInMatch.map((team: { id: number }) => team.id);
          joinedMatchesWithTeam[match.id] = joinedMatchesWithTeam[match.id].filter(
            (id: number) => !teamIds.includes(id)
          );

          if (joinedMatchesWithTeam[match.id].length === 0) {
            delete joinedMatchesWithTeam[match.id];
          }
          
          localStorage.setItem('joinedMatchesWithTeam', JSON.stringify(joinedMatchesWithTeam));
        }
      } catch (e) {
        // Silenciar erro
      }
      
      // Tentar chamar a API para cada time
      for (const team of userTeamsInMatch) {
        try {
          if (match.id && team.id) {
            await api.matches.leave(match.id);
          }
        } catch (apiError) {
          // Silenciar erro
        }
      }

      // Recarregar detalhes da partida após um breve atraso
      setTimeout(() => {
        if (match && match.id) {
          fetchMatchDetails(match.id);
          setUserIsInMatch(false);
        }
      }, 500);
      
      toast.success('Seu time saiu da partida com sucesso');
    } catch (error) {
      setError('Erro ao sair da partida. Tente novamente.');
      toast.error('Erro ao sair da partida. Tente novamente.');
    } finally {
      setLeaving(false);
    }
  };
  
    // Função melhorada para calcular distância entre coordenadas
  const calculateDistance = (lat1: number | string, lon1: number | string, lat2: number | string, lon2: number | string): number | null => {
    // Converter explicitamente para números e validar
    const lat1Num = typeof lat1 === 'string' ? parseFloat(lat1) : Number(lat1);
    const lon1Num = typeof lon1 === 'string' ? parseFloat(lon1) : Number(lon1);
    const lat2Num = typeof lat2 === 'string' ? parseFloat(lat2) : Number(lat2);
    const lon2Num = typeof lon2 === 'string' ? parseFloat(lon2) : Number(lon2);
    
    // Verificar se todas as coordenadas são números válidos e estão dentro de intervalos permitidos
    if (isNaN(lat1Num) || isNaN(lon1Num) || isNaN(lat2Num) || isNaN(lon2Num) ||
        lat1Num < -90 || lat1Num > 90 || lat2Num < -90 || lat2Num > 90 || 
        lon1Num < -180 || lon1Num > 180 || lon2Num < -180 || lon2Num > 180) {
      console.log('Coordenadas inválidas ou fora de limites:', { lat1, lon1, lat2, lon2 });
      return null;
    }
    
    const R = 6371; // Raio da Terra em km
    const dLat = deg2rad(lat2Num - lat1Num);
    const dLon = deg2rad(lon2Num - lon1Num);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1Num)) * Math.cos(deg2rad(lat2Num)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distância em km
    
    // Arredondar para uma casa decimal e verificar validade
    return !isNaN(distance) && isFinite(distance) ? parseFloat(distance.toFixed(1)) : null;
  };
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) {
      // Se não tiver o campo time separado, mas tiver uma data completa no formato '2025-04-23 18:00:00'
      if (match?.date && match.date.includes(' ')) {
        const timePart = match.date.split(' ')[1];
        return timePart.slice(0, 5); // Retorna apenas HH:MM
      }
      return 'Horário não informado';
    }
    return timeString.slice(0, 5); // Extrai apenas hora e minuto (HH:MM) se existir
  };
  
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return 'Gratuito';
    
    // Se for uma string, tenta converter para número
    if (typeof price === 'string') {
      try {
        // Remove símbolos como R$ e substitui vírgula por ponto
        const cleanPrice = price.replace(/[R$\s]/g, '').replace(',', '.');
        const numericPrice = parseFloat(cleanPrice);
        
        if (!isNaN(numericPrice)) {
          return `R$ ${numericPrice.toFixed(2)}`;
        } else {
          return 'Gratuito'; // Se não conseguir converter, considera gratuito
        }
      } catch (e) {
        return 'Gratuito'; // Em caso de erro, considera gratuito
      }
    }
    
    // Verifica se é um número válido
    if (typeof price === 'number' && !isNaN(price)) {
      return `R$ ${price.toFixed(2)}`;
    }
    
    return 'Gratuito';
  };
  
  const getMapUrl = () => {
    const locationData = getLocationData();
    
    if (userLocation && locationData && typeof locationData.lat === 'number' && typeof locationData.lng === 'number') {
      // Use OpenStreetMap como padrão
      let baseUrl = `https://www.openstreetmap.org/directions?`;
      let params = new URLSearchParams();
      
      // Adicionar origem (localização do usuário)
      params.append('from', `${userLocation.lat},${userLocation.lng}`);
      
      // Adicionar destino (localização da partida)
      params.append('to', `${locationData.lat},${locationData.lng}`);
      
      // Adicionar o nome do local como comentário adicional na URL
      if (locationData.formattedAddress) {
        params.append('comment', locationData.formattedAddress);
      }
      
      return `${baseUrl}${params.toString()}`;
    }
    
    return '#';
  };
  
  const toggleMap = (): void => {
    setShowMap(!showMap);
  };
  
  const toggleMapType = (): void => {
    setUseIframeMap(!useIframeMap);
  };
  
  const fetchMatchDetails = async (matchId: number) => {
    try {
      setLoading(true);
      const matchData = await api.matches.getById(matchId);
      setMatch(matchData);
      
      // Verificar se o usuário atual está na partida, removendo verificação de jogador individual
      const userPresent = 
        // Usuário está como jogador em um time
        (matchData && matchData.teams && Array.isArray(matchData.teams) && 
          matchData.teams.some((team: any) => 
            team && team.players && Array.isArray(team.players) && 
            team.players.some((player: any) => player && player.id === currentUser?.id)
          )) ||
        // Usuário é capitão de um time que está na partida
        (matchData && matchData.teams && Array.isArray(matchData.teams) && 
          matchData.teams.some((team: any) => team && team.captainId === currentUser?.id)) ||
        // Time do usuário está registrado na lista de jogadores como entidade
        (matchData && matchData.players && Array.isArray(matchData.players) && 
          matchData.players.some((player: any) => 
            player && player.isTeam && player.teamId && matchData.teams && 
            matchData.teams.some((team: any) => team && team.id === player.teamId && team.captainId === currentUser?.id)
          ));
          
      setUserIsInMatch(userPresent);
    } catch (error) {
      setError('Erro ao carregar detalhes da partida');
    } finally {
      setLoading(false);
    }
  };
  
  // Adicionar função para abrir modal com detalhes do time
  const handleViewTeamDetails = (teamId: number) => {
    if (!match || !match.teams) return;
    
    const teamInfo = match.teams.find((t: any) => t && t.id === teamId);
    if (teamInfo) {
      setSelectedTeamForView(teamInfo);
      setShowTeamDetailsModal(true);
    }
  };
  
  // No início do componente, adicionar o useEffect para obter a localização do usuário
  useEffect(() => {
    // Função para obter a localização do usuário com alta precisão
    const getUserLocation = () => {
      if (navigator.geolocation) {
        toast.loading('Obtendo sua localização...');
        
        try {
          // Tentar obter localização com alta precisão
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLoc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              setUserLocation(userLoc);
              toast.dismiss();
              toast.success('Sua localização foi obtida com sucesso!');
              
              // Calcular distância se a partida tiver localização
              const locationData = getLocationData();
              if (locationData && locationData.lat && locationData.lng) {
                const dist = calculateDistance(
                  userLoc.lat, 
                  userLoc.lng, 
                  locationData.lat, 
                  locationData.lng
                );
                setDistance(dist);
                
                // Obter o endereço reverso do usuário para exibição
                try {
                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLoc.lat}&lon=${userLoc.lng}&zoom=18&addressdetails=1`)
                    .then(response => response.json())
                    .then(data => {
                      // Opcional: salvar o endereço do usuário em um estado
                      // setUserAddress(data.display_name);
                    })
                    .catch(err => {});
                } catch (e) {
                  // Erro silencioso
                }
              } else if (locationData && locationData.address && !locationData.lat && !locationData.lng) {
                // Temos apenas o endereço, precisamos geocodificar
                geocodeAddressAndCalculateDistance(locationData.address, userLoc);
              }
            },
            (error) => {
              toast.dismiss();
              
              // Mensagens de erro específicas
              let errorMsg = 'Não foi possível obter sua localização.';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMsg = 'Permissão para obter localização foi negada. Por favor, habilite o acesso à localização no seu navegador.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMsg = 'Informações de localização não estão disponíveis no momento.';
                  break;
                case error.TIMEOUT:
                  errorMsg = 'Tempo esgotado ao tentar obter sua localização.';
                  break;
              }
              
              toast.error(errorMsg);
              
              // Tentar usar uma API de geolocalização por IP como fallback
              fetchLocationByIP();
            },
            // Opções para a API de geolocalização
            {
              enableHighAccuracy: true, // Solicitar alta precisão
              timeout: 15000, // Aumentar o timeout para dar mais tempo
              maximumAge: 0 // Sempre obter a posição mais recente
            }
          );
        } catch (e) {
          toast.dismiss();
          toast.error('Erro ao acessar serviço de localização');
          fetchLocationByIP();
        }
      } else {
        toast.error('Seu navegador não suporta geolocalização');
        // Tentar usar uma API de geolocalização por IP como fallback
        fetchLocationByIP();
      }
    };
  
    // Chamar função para obter localização
    getUserLocation();
    
    // Adicionar getUserLocation ao escopo global para poder ser chamado pelo botão
    (window as any).getUserLocation = getUserLocation;
  }, [match?.id]); // Dependência alterada para match.id para evitar loops infinitos
  
  // Função para normalizar e obter os dados de localização, independente de como estão armazenados
   // Função melhorada para extrair dados de localização
  const getLocationData = () => {
    if (!match) return null;
    
    // Inicializar objeto de retorno com valores padrão
    const result: {
      lat: number | null;
      lng: number | null;
      address: string;
      formattedAddress: string;
    } = {
      lat: null,
      lng: null,
      address: '',
      formattedAddress: ''
    };

    try {
      // Caso 1: Dados completos no objeto location
      if (match.location && typeof match.location === 'object') {
        // Tentar obter latitude/longitude do objeto location
        if (match.location.latitude && match.location.longitude) {
          const lat = Number(match.location.latitude);
          const lng = Number(match.location.longitude);
          
          if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
            result.lat = lat;
            result.lng = lng;
          }
        }
        
        // Obter endereço do objeto location
        if (match.location.address) {
          result.address = match.location.address;
          result.formattedAddress = match.location.formattedAddress || match.location.address;
        }
      }
      
      // Caso 2: Latitude e longitude diretamente no objeto match
      if ((!result.lat || !result.lng) && match.latitude && match.longitude) {
        const lat = Number(match.latitude);
        const lng = Number(match.longitude);
        
        if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
          result.lat = lat;
          result.lng = lng;
        }
      }
      
      // Caso 3: Apenas endereço (string) no campo location
      if ((!result.address) && typeof match.location === 'string' && match.location.trim()) {
        result.address = match.location;
        result.formattedAddress = match.location;
      }
      
      // Verificar se temos alguma informação
      if (result.lat !== null || result.address) {
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter dados de localização:', error);
      return null;
    }
  };
  // Função melhorada para geocodificar endereço
  const geocodeAddressAndCalculateDistance = async (address: string, userLoc: {lat: number; lng: number}) => {
    if (!address || address.trim().length < 3) {
      toast.error('Endereço muito curto ou inválido');
      return;
    }
    
    try {
      toast.loading('Buscando coordenadas do local da partida...');
      
      const coordinates = await geocodeAddress(address);
      
      if (coordinates && 
          typeof coordinates.latitude === 'number' && 
          typeof coordinates.longitude === 'number' &&
          !isNaN(coordinates.latitude) && 
          !isNaN(coordinates.longitude)) {
        
        toast.dismiss();
        
        // Validar coordenadas obtidas
        if (coordinates.latitude < -90 || coordinates.latitude > 90 || 
            coordinates.longitude < -180 || coordinates.longitude > 180) {
          toast.error('Coordenadas obtidas são inválidas');
          return;
        }
        
        // Atualizar o match com as coordenadas obtidas
        setMatch((prev: any) => {
          if (!prev) return prev;
          
          const formattedAddress = coordinates.displayName || address;
          
          // Criar estrutura consistente independente do formato atual
          return {
            ...prev,
            location: {
              ...(typeof prev.location === 'object' ? prev.location : {}),
              address: typeof prev.location === 'string' ? prev.location : 
                    (prev.location?.address || address),
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              formattedAddress: formattedAddress
            },
            // Adicionar também no nível superior para compatibilidade
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          };
        });
        
        // Calcular distância com validação
        const dist = calculateDistance(
          userLoc.lat,
          userLoc.lng,
          coordinates.latitude,
          coordinates.longitude
        );
        
        if (dist !== null) {
          setDistance(dist);
          
          // Exibir mensagem de sucesso com nome formatado do local
          if (coordinates.displayName) {
            const formattedName = coordinates.displayName.split(',').slice(0, 2).join(', ');
            toast.success(`Local encontrado: ${formattedName}`);
          } else {
            toast.success('Local encontrado com sucesso!');
          }
        } else {
          toast.error('Não foi possível calcular a distância');
        }
      } else {
        toast.dismiss();
        toast.error('Não foi possível encontrar coordenadas para o endereço');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao buscar coordenadas do endereço');
      console.error('Erro na geocodificação:', error);
    }
  };
  

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .address-info {
        margin: 10px 0;
        padding: 8px 12px;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-size: 0.9em;
        line-height: 1.4;
        border-left: 3px solid #3f51b5;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Coloque essas variáveis após as verificações de carregamento e erro
  if (loading) {
    return <div className="match-detail-container loading">Carregando detalhes da partida...</div>;
  }
  
  if (error) {
    return <div className="match-detail-container error">{error}</div>;
  }
  
  if (!match) {
    return <div className="match-detail-container error">Partida não encontrada.</div>;
  }
  const userHasJoined = match && match.players && Array.isArray(match.players) && 
    match.players.some((player: any) => {
      if (!player) return false;
      
      // Removida verificação de jogador individual
      const isUserTeam = player && player.isTeam && match.teams && Array.isArray(match.teams) && 
        match.teams.some((t: any) => 
          t && t.id === player.teamId && t.ownerId === currentUser?.id
        );
      
      return isUserTeam;
    });
  
  const locationData = getLocationData();
  
  return (
    <div className="match-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowBackIcon />
      </button>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="dismiss-error" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="detail-content">
        <div className="match-header">
          <h1>{match.title}</h1>
          <div className="match-organizer">
            <SportsSoccerIcon /> Organizado por: {match.organizer?.name || 'Desconhecido'}
          </div>
        </div>
        
        <div className="match-info">
          <div className="info-row">
            <div className="info-label">Data:</div>
            <div className="info-value">{formatDate(match.date)}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Horário:</div>
            <div className="info-value">{formatTime(match.time)}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Local:</div>
            <div className="info-value">
              {match.location?.address || (typeof match.location === 'string' ? match.location : 'Endereço não informado')}
            </div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Distância:</div>
            <div className="info-value">
              {distance !== null ? (
                <>{distance} km de você</>
              ) : userLocation ? (
                <>Calculando distância...</>
              ) : (
                <>
                  Localização não disponível 
                  <button 
                    className="location-button" 
                    onClick={() => (window as any).getUserLocation()}
                  >
                    Obter minha localização
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Preço:</div>
            <div className="info-value">
              {formatPrice(match.price)}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Categoria:</div>
              <div className="info-value">
                {match.categories || 'Não informada'}
              </div>
            </div>
          </div>
        {match.description && (
          <div className="match-description">
            <h3>Descrição</h3>
            <p>{match.description}</p>
          </div>
        )}
        <div className="match-description">
          <h3>Regras</h3>
          <Button variant="info" onClick={() => setShowRulesModal(true)}>Visualizar regras</Button>
        </div>
        {match && (
          <RegrasFormInfoModal
            idpartida={match.id} 
            show={showRulesModal} 
            onHide={() => setShowRulesModal(false)}
          />
        )}
        <div className="map-section">
          <h3>Localização</h3>
          <button className="toggle-map-button" onClick={toggleMap}>
            {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
          </button>
          {showMap && (
            <div className="map-container">
              {(() => {
                const locationData = getLocationData();
                if (locationData && typeof locationData.lat === 'number' && typeof locationData.lng === 'number') {
                  // Temos coordenadas válidas, mostrar o mapa
                  return (
                    <>
                      {useIframeMap ? (
                        <IframeMap 
                          matchLocation={{
                            lat: locationData.lat,
                            lng: locationData.lng,
                            address: locationData.address
                          }}
                        />
                      ) : (
                        <Map 
                          matchLocation={{
                            lat: locationData.lat,
                            lng: locationData.lng,
                            address: locationData.address
                          }}
                          userLocation={userLocation ? {
                            lat: userLocation.lat,
                            lng: userLocation.lng
                          } : undefined}
                        />
                      )}
                      
                      <div className="map-controls">
                        <button 
                          className="map-toggle-button" 
                          onClick={toggleMapType}
                        >
                          {useIframeMap ? 'Usar mapa interativo' : 'Usar mapa simples'}
                        </button>
                        
                        {userLocation && (
                          <a 
                            href={getMapUrl()} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="directions-link"
                          >
                            <DirectionsIcon /> Como chegar
                          </a>
                        )}
                      </div>
                    </>
                  );
                } else if (locationData && locationData.address) {
                  // Temos apenas o endereço, mostrar opção para geocodificar
                  return (
                    <div className="loading-map">
                      <p>Carregando mapa para o endereço:</p>
                      <p><strong>{match.location?.formattedAddress || locationData.address}</strong></p>
                      <Button
                        className="geocode-address-btn"
                        onClick={() => userLocation && geocodeAddressAndCalculateDistance(locationData.address, userLocation)}
                      >
                        Localizar no mapa
                      </Button>
                    </div>
                  );
                } else {
                  // Nenhuma informação de localização disponível
                  return (
                    <div className="loading-map">
                      <p>Localização não fornecida pelo organizador</p>
                      <p><small>Envie um endereço manualmente para visualizar no mapa</small></p>
                      <div className="manual-location-form">
                        <input 
                          type="text" 
                          id="address-input" 
                          placeholder="Digite um endereço para a partida" 
                          className="address-input"
                        />
                        <button
                          className="geocode-address-btn"
                          onClick={async () => {
                            const addressInput = document.getElementById('address-input') as HTMLInputElement;
                            const address = addressInput?.value;
                            
                            if (address && address.trim().length > 5) {
                              if (userLocation) {
                                geocodeAddressAndCalculateDistance(address, userLocation);
                              } else {
                                toast.error('Obtenha sua localização primeiro para calcular a distância');
                              }
                            } else {
                              toast.error('Por favor, digite um endereço válido');
                            }
                          }}
                        >
                          Buscar no mapa
                        </button>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
      </div>
      {distance !== null && userLocation && (
        <div className="distance-info">
          <p><strong>Distância:</strong> {distance} km da sua localização</p>
          {locationData && locationData.formattedAddress && (
            <p className="address-info">
              <strong>Endereço completo:</strong> {locationData.formattedAddress}
            </p>
          )}
          <div className="route-options">
            <a 
              href={getMapUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="route-button osm"
            >
              <DirectionsIcon /> Ver rota no OpenStreetMap
            </a>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${getLocationData()?.lat},${getLocationData()?.lng}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="route-button gmaps"
            >
              <DirectionsIcon /> Ver rota no Google Maps
            </a>
          </div>
        </div>
      )}
      <div className="players-section">
      <div className="players-section">
  <h3>Times {match.currentTeams || 0}/{match.maxTeams || 0}</h3>
  
  {/* Seção de times cadastrados */}
  {timeCadastrados  && timeCadastrados.length > 0 ? (
    <div className="registered-teams">
      <div className="teams-grid">
        {timeCadastrados.map((team: any) => (
          <div key={team.id} className="registered-team-card">
            {team.banner && (
              <img 
                src={`http://localhost:3001${team.banner}`} 
                className="team-card-logo" 
                alt={team.name} 
              />
            )}
            <div className="registered-team-info">
              <h5>{team.name}</h5>
            </div>  
              
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="no-teams">
      <p>Nenhum time cadastrado para esta partida.</p>
      {!userHasJoined && (
        <button 
          className="join-match-btn"
          onClick={() => setShowTeamOptions(true)}
        >
          Entrar com um Time
        </button>
      )}
    </div>
  )}

  {/* Modal de opções de time */}
  {showTeamOptions && (
    <div className="team-options">
      <h4>Selecione um time para entrar na partida:</h4>
      {loadingTeams ? (
        <div className="loading-teams">
          <div className="loading-spinner"></div>
          <p>Carregando seus times...</p>
        </div>
      ) : (
        <>
          {userTeams && userTeams.length > 0 ? (
            <ul className="teams-list">
              {userTeams.map(team => (
                <li 
                  key={team.id} 
                  className={`team-item ${team.isCurrentUserCaptain ? 'captain-team' : ''}`}
                  onClick={() => handleJoinWithTeam(team.id)}
                >
                  {team.banner && (
                    <img 
                      src={`http://localhost:3001${team.banner}`} 
                      className="team-logo" 
                      alt={team.name} 
                    />
                  )}
                  <div className="team-details">
                    <span className="team-name">{team.name}</span>
                    <div className="team-info">
                      <span className="player-count">
                        {team.players?.length || 0} jogadores
                      </span>
                      {team.isCurrentUserCaptain && (
                        <span className="captain-badge">Capitão</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-teams">
              <p>Você não tem times para participar desta partida.</p>
              <button 
                className="create-team-btn"
                onClick={() => navigate('/teams/create')}
              >
                Criar um Time
              </button>
            </div>
          )}
          <button 
            className="cancel-button"
            onClick={() => setShowTeamOptions(false)}
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  )}
</div>
            
    {showTeamDetailsModal && selectedTeamForView && (
      <div className="modal-overlay" onClick={() => setShowTeamDetailsModal(false)}>
        <div className="team-details-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal" onClick={() => setShowTeamDetailsModal(false)}>×</button>
          
          <div className="team-details-header">
            {selectedTeamForView.banner && (
              <img 
                src={`http://localhost:3001${selectedTeamForView.banner}`} 
                alt="Banner do time"
                className="team-banner"
              />
            )}
            <h2>{selectedTeamForView.name || 'Time sem nome'}</h2>
            {selectedTeamForView.description && (
              <p className="team-description">{selectedTeamForView.description}</p>
            )}
          </div>
          
          <div className="team-members-section">
            <h3>Jogadores do Time</h3>
            
            {/* Exibir o capitão primeiro */}
            {selectedTeamForView.captain ? (
              <div className="team-captain-row">
                <h4>Capitão</h4>
                <div className="player-card captain">
                  <div className="player-info">
                    <div className="player-name">{selectedTeamForView.captain.name}</div>
                    {selectedTeamForView.captain.email && (
                      <div className="player-email">{selectedTeamForView.captain.email}</div>
                    )}
                  </div>
                  {currentUser?.id && selectedTeamForView.captain.id === currentUser.id && (
                    <span className="you-badge">Você</span>
                  )}
                </div>
              </div>
            ) : (
              <p>Informações do capitão não disponíveis</p>
            )}
            
            {/* Exibir os jogadores */}
            {selectedTeamForView.players && Array.isArray(selectedTeamForView.players) && selectedTeamForView.players.length > 0 ? (
              <>
                <h4>Jogadores</h4>
                <div className="team-players-list">
                  {selectedTeamForView.players
                    .filter((p: any) => p && p.id && (!selectedTeamForView.captainId || p.id !== selectedTeamForView.captainId))
                    .map((player: any) => (
                      <div key={player.id} className="player-card">
                        <div className="player-info">
                          <div className="player-name">{player.name || 'Jogador sem nome'}</div>
                          {player.email && (
                            <div className="player-email">{player.email}</div>
                          )}
                        </div>
                        {currentUser?.id && player.id === currentUser.id && (
                          <span className="you-badge">Você</span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </>
            ) : (
              <p className="no-players-message">
                {selectedTeamForView.captain ? 
                  'Este time não tem jogadores adicionais além do capitão.' : 
                  'Nenhum jogador encontrado neste time.'}
              </p>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
    </div> 
  );
}; 


export default MatchDetail;



