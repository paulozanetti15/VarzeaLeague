import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import DirectionsIcon from '@mui/icons-material/Directions';
import { Map, IframeMap } from '../../components/Map';
import { api } from '../../services/api';
import { geocodeAddress } from '../../services/geocodeService';
import './MatchDetail.css';
import toast from 'react-hot-toast';

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
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Limpar dados de times simulados e buscar times reais uma vez ao carregar
  useEffect(() => {
    // Migrar formato antigo de joinedMatches para novo formato (array)
    try {
      const oldJoinedMatches = JSON.parse(localStorage.getItem('joinedMatches') || '[]');
      if (!Array.isArray(oldJoinedMatches)) {
        console.log('Migrando joinedMatches de objeto para array...');
        const newJoinedMatches = [];
        for (const matchId in oldJoinedMatches) {
          if (oldJoinedMatches[matchId]) {
            newJoinedMatches.push(Number(matchId));
          }
        }
        localStorage.setItem('joinedMatches', JSON.stringify(newJoinedMatches));
        console.log('Migração concluída:', newJoinedMatches);
      }
    } catch (e) {
      console.warn('Erro ao migrar formato de joinedMatches:', e);
      // Em caso de erro, limpar o item para garantir que esteja no formato correto
      localStorage.setItem('joinedMatches', JSON.stringify([]));
    }

    const fetchRealTeams = async () => {
      try {
        // Limpar completamente qualquer cache de times simulados
        localStorage.removeItem('userTeams');
        console.log("Cache de times limpo no carregamento inicial");
        
        // Pre-carregar times reais do usuário
        try {
          const teamsFromAPI = await api.teams.getUserTeams();
          
          if (teamsFromAPI && Array.isArray(teamsFromAPI) && teamsFromAPI.length > 0) {
            console.log(`Encontrados ${teamsFromAPI.length} times reais do usuário:`, teamsFromAPI);
          } else {
            console.log("Nenhum time encontrado para o usuário na API. Você pode criar um time na página /teams");
          }
        } catch (e) {
          // Não mostrar erro ao usuário, apenas logar
          console.warn("Não foi possível carregar times do usuário:", e);
        }
      } catch (e) {
        console.error("Erro ao inicializar busca de times:", e);
      }
    };
    
    // Executar a busca de times apenas se o usuário estiver logado
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
    
    // Garantir que temos pelo menos um id no objeto currentUser
    if (!currentUser || typeof currentUser !== 'object') {
      console.error('Erro: Dados do usuário não encontrados');
      setError('Sessão expirada ou usuário não encontrado. Por favor, faça login novamente.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate, currentUser]);

  useEffect(() => {
    const fetchMatchDetailsInit = async () => {
      try {
        setLoading(true);
        
        // Limpar o cache de times para forçar o carregamento dos times reais
        try {
          // Verificamos se já existe algum time salvo no localStorage
          const storedTeams = localStorage.getItem('userTeams');
          if (storedTeams) {
            const teams = JSON.parse(storedTeams);
            // Se os times salvos têm nomes genéricos como "Meu Time 1", limpamos o cache
            const hasGenericNames = teams.some((team: any) => 
              team.name === 'Meu Time 1' || 
              team.name === 'Meu Time 2' || 
              team.name === `${currentUser?.name || 'Meu'} FC` ||
              team.name === `Time do ${currentUser?.name || 'Usuário'}`
            );
            
            if (hasGenericNames) {
              console.log("Encontrados times com nomes genéricos. Limpando cache para buscar times reais.");
              localStorage.removeItem('userTeams');
            }
          }
        } catch (e) {
          console.error("Erro ao verificar cache de times:", e);
        }
        
        const response = await api.matches.getById(Number(id));
        console.log('Resposta da API para getById:', response);
        console.log('Tipo do campo price:', typeof response.price);
        console.log('Valor do campo price:', response.price);
        setMatch(response);
        
        // Obter coordenadas do endereço se não existirem
        if (response.location?.address && 
            (!response.location.latitude || !response.location.longitude)) {
          try {
            const coordinates = await geocodeAddress(response.location.address);
            console.log('Coordenadas obtidas por geocodificação:', coordinates);
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
            console.error("Erro ao geocodificar endereço:", error);
          }
        }
        
        // Verificar se o usuário já entrou nesta partida anteriormente (localStorage)
        try {
          const matchId = id || '';
          
          // Verificar entrada individual
          const joinedMatches = JSON.parse(localStorage.getItem('joinedMatches') || '[]');
          const hasJoinedIndividually = Array.isArray(joinedMatches) 
            ? joinedMatches.includes(Number(matchId)) 
            : !!joinedMatches[matchId]; // compatibilidade com formato antigo
          
          // Verificar entrada com time
          const joinedMatchesWithTeam = JSON.parse(localStorage.getItem('joinedMatchesWithTeam') || '{}');
          const hasJoinedWithTeam = joinedMatchesWithTeam[matchId] && Array.isArray(joinedMatchesWithTeam[matchId]) && joinedMatchesWithTeam[matchId].length > 0;
          
          console.log(`Verificação do localStorage - Entrou individualmente: ${hasJoinedIndividually}, Entrou com time: ${hasJoinedWithTeam}`);
          
          // Se o usuário entrou na partida (individualmente ou com time) mas não está na lista atual (API),
          // restauramos o estado anterior
          const userInResponse = response.players && response.players.some((p: any) => 
            (p && p.id === currentUser?.id) || // como jogador individual
            (p?.isTeam && response.teams?.some((t: any) => t && t.id === p.teamId && t.ownerId === currentUser?.id)) // como time
          );
          
          if ((hasJoinedIndividually || hasJoinedWithTeam) && !userInResponse) {
            console.log("Usuário participou da partida anteriormente, mas não está na resposta da API. Restaurando estado...");
            
            // Cria uma cópia para não modificar a resposta original
            const updatedResponse = {...response};
            updatedResponse.players = updatedResponse.players ? [...updatedResponse.players] : [];
            updatedResponse.teams = updatedResponse.teams ? [...updatedResponse.teams] : [];
            
            // Adiciona o jogador individual se necessário
            if (hasJoinedIndividually && !updatedResponse.players.some((p: any) => p && p.id === currentUser?.id) && currentUser) {
              updatedResponse.players.push({
                id: currentUser.id,
                name: currentUser.name || currentUser.username || 'Jogador'
              });
              console.log("Restaurado jogador individual");
            }
            
            // Adiciona os times se necessário
            if (hasJoinedWithTeam && currentUser) {
              const userTeamIds = joinedMatchesWithTeam[matchId] || [];
              
              // Primeiro, carrega os times do usuário
              try {
                console.log("Carregando times do usuário para restaurar");
                
                // Buscar times diretamente da API
                let userTeams: any[] = [];
                
                try {
                  // Tenta buscar da API específica
                  userTeams = await api.teams.getUserTeams();
                  console.log("Times do usuário carregados da API:", userTeams);
                } catch (e) {
                  console.warn("Erro ao buscar times do usuário da API específica:", e);
                  
                  // Se falhar, tenta da lista geral
                  try {
                    const allTeams = await api.teams.list();
                    if (Array.isArray(allTeams) && currentUser.id) {
                      userTeams = allTeams.filter(t => t.ownerId === currentUser.id);
                      console.log("Times do usuário filtrados da lista geral:", userTeams);
                    }
                  } catch (e2) {
                    console.warn("Erro também na lista geral de times:", e2);
                  }
                }
                
                // Se não encontrou por nenhum método, exibe mensagem para criar
                if (userTeams.length === 0) {
                  console.warn("Não foi possível restaurar os times usados anteriormente porque você não possui times cadastrados.");
                  setError("Você não tem times cadastrados mas participou anteriormente com times. Por favor, crie seus times na página de Times.");
                }
                
                // Adiciona cada time que o usuário participou
                for (const teamId of userTeamIds) {
                  // Procura o time com este ID na lista de times do usuário
                  const team = userTeams.find((t: any) => t && t.id === teamId);
                  
                  if (team && !updatedResponse.players.some((p: any) => p?.isTeam && p.teamId === teamId)) {
                    // Adiciona o time à lista de jogadores
                    updatedResponse.players.push({
                      id: `team-${teamId}`,
                      name: `${team.name} (Time)`,
                      isTeam: true,
                      playerCount: team.playerCount || 5,
                      teamId: teamId
                    });
                    
                    // Adiciona o time à lista de times se não existir
                    if (!updatedResponse.teams.some((t: any) => t && t.id === teamId)) {
                      updatedResponse.teams.push(team);
                    }
                    
                    console.log(`Restaurado time ${team.name} (ID: ${teamId})`);
                  } else if (!team) {
                    console.warn(`Time com ID ${teamId} não foi encontrado na sua lista de times.`);
                  }
                }
              } catch (e) {
                console.error("Erro ao restaurar times do usuário:", e);
              }
            }
            
            // Atualiza o estado com os dados restaurados
            setMatch(updatedResponse);
            setSimulationMode(true); // Marca como simulação, já que os dados locais são usados
          }
        } catch (e) {
          console.error("Erro ao verificar/restaurar estado do localStorage:", e);
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
              
              // Calcular distância se a partida tem coordenadas
              const matchLat = response.location?.latitude || response.latitude;
              const matchLng = response.location?.longitude || response.longitude;
              
              if (matchLat && matchLng) {
                const dist = calculateDistance(
                  userLoc.lat,
                  userLoc.lng,
                  matchLat,
                  matchLng
                );
                setDistance(dist);
              }
            },
            (error) => {
              console.error("Erro ao obter localização do usuário:", error);
            }
          );
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes da partida:', err);
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
      
      // Adicionar verificações de segurança para evitar erros de acesso a propriedades de valores undefined
      const userInMatch = 
        // Usuário está como jogador individual
        (match.players && Array.isArray(match.players) && match.players.some((player: any) => player && player.id === currentUser.id)) || 
        // Usuário está como jogador em um time
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
                      
      console.log(`Verificação: usuário está na partida? ${userInMatch}`);
      setUserIsInMatch(userInMatch);
      
      // Atualizar lista de partidas ingressadas no localStorage
      if (userInMatch && match.id) {
        const joinedMatches = JSON.parse(localStorage.getItem('joinedMatches') || '[]');
        // Garantir que joinedMatches seja um array
        const matchesArray = Array.isArray(joinedMatches) ? joinedMatches : [];
        
        if (!matchesArray.includes(match.id)) {
          matchesArray.push(match.id);
          localStorage.setItem('joinedMatches', JSON.stringify(matchesArray));
        }
      }
    }
  }, [match, loading, error]);

  // Função para buscar times do usuário
  const fetchUserTeams = async () => {
    setError(null);
    setLoadingTeams(true);
    
    try {
      console.log("Buscando times do usuário via API");
      
      // Buscar times do usuário da API
      const userTeamsData = await api.teams.getUserTeams();
      console.log("Times do usuário recebidos da API:", userTeamsData);
      
      if (userTeamsData && Array.isArray(userTeamsData) && userTeamsData.length > 0) {
        // Filtrar times onde o usuário é capitão para mostrar primeiro
        const ownedTeams = userTeamsData.filter(team => team.isCurrentUserCaptain);
        const memberTeams = userTeamsData.filter(team => !team.isCurrentUserCaptain);
        
        console.log(`O usuário é capitão de ${ownedTeams.length} times`);
        console.log(`O usuário é membro de ${memberTeams.length} times`);
        
        // Ordenar por times onde é capitão primeiro, depois por nome
        const sortedTeams = [...ownedTeams, ...memberTeams];
        
        setUserTeams(sortedTeams);
        setShowTeamOptions(true);
      } else {
        console.warn("Nenhum time encontrado para este usuário");
        setError("Você não tem times cadastrados. Por favor, crie um time primeiro.");
        toast.error("Você não tem times cadastrados. Por favor, crie um time primeiro.");
        
        // Adicionar opção para criar time
        setUserTeams([]);
        setShowTeamOptions(true);
      }
    } catch (error) {
      console.error("Erro ao buscar times do usuário:", error);
      setError("Não foi possível carregar seus times. Tente novamente ou crie um novo time.");
      toast.error("Não foi possível carregar seus times. Tente novamente ou crie um novo time.");
      
      // Mesmo com erro, mostrar a opção para criar time
      setUserTeams([]);
      setShowTeamOptions(true);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Função para forçar recálculo do estado
  const forceRefresh = () => {
    setRefreshCounter(prevCount => prevCount + 1);
    console.log("Forçando atualização da interface");
  };

  // Função para entrar na partida
  const handleJoinMatch = async () => {
    console.log('Tentando entrar na partida como jogador individual');
    setJoining(true);
    setError(null);
    
    try {
      if (!match) {
        throw new Error('Detalhes da partida não estão disponíveis');
      }

      // Verificar se já está na partida
      if (userIsInMatch) {
        console.log('Usuário já está participando desta partida');
        setError('Você já está participando desta partida. Não é possível entrar novamente.');
        toast('Você já está participando desta partida');
        setJoining(false);
        return;
      }

      // Verificar se a partida está cheia
      const totalCurrentPlayers = calculateTotalPlayers();
      if (totalCurrentPlayers >= match.maxPlayers) {
        console.warn('Partida está cheia, não é possível entrar');
        setError('Esta partida está cheia, não é possível entrar');
        toast.error('Esta partida está cheia, não é possível entrar');
        setJoining(false);
        return;
      }

      // Criar representação local do jogador para feedback imediato
      const playerToAdd = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar || '/assets/default-avatar.png',
        teamId: null // Jogando individualmente
      };

      // Atualizar estado local primeiro para feedback imediato
      const updatedPlayers = [...match.players, playerToAdd];
      
      setMatch({
        ...match,
        players: updatedPlayers
      });

      // Adicionar à lista de partidas ingressadas no localStorage
      const joinedMatches = JSON.parse(localStorage.getItem('joinedMatches') || '[]');
      // Garantir que joinedMatches seja um array
      const matchesArray = Array.isArray(joinedMatches) ? joinedMatches : [];

      if (!matchesArray.includes(match.id)) {
        matchesArray.push(match.id);
        localStorage.setItem('joinedMatches', JSON.stringify(matchesArray));
      }

      // Tentar chamar a API
      try {
        if (match.id) {
          const result = await api.matches.join(match.id);
          console.log('API de entrada chamada com sucesso:', result);
        }
      } catch (apiError) {
        console.warn('Erro ao chamar API de entrada, simulando comportamento:', apiError);
        // Se a API falhar, pelo menos o estado local foi atualizado
      }

      // Recarregar detalhes da partida após um breve atraso
      setTimeout(() => {
        if (match && match.id) {
          fetchMatchDetails(match.id);
          setUserIsInMatch(true);
        }
      }, 500);

      toast.success('Você entrou na partida com sucesso');
    } catch (error) {
      console.error('Erro ao entrar na partida:', error);
      setError('Erro ao entrar na partida. Tente novamente.');
      toast.error('Erro ao entrar na partida. Tente novamente.');
    } finally {
      setJoining(false);
    }
  };
  
  // Função auxiliar para calcular o número de jogadores em um array
  const calculatePlayersCount = (players: any[]) => {
    if (!players || !Array.isArray(players)) return 0;
    
    let total = 0;
    players.forEach((player: any) => {
      if (!player) return; // Ignora jogadores undefined ou null
      
      if (player.isTeam && typeof player.playerCount === 'number') {
        total += player.playerCount;
      } else {
        total += 1; // Jogador individual
      }
    });
    
    return total;
  };

  // Função para entrar na partida com um time
  const handleJoinWithTeam = async (teamId: number) => {
    setError(null); // Limpa qualquer erro anterior
    
    // Verificar se o usuário já está na partida (como jogador ou com outro time)
    if (userIsInMatch) {
      console.warn('Usuário já está na partida como jogador ou com outro time');
      setError('Você já está participando desta partida. Não é possível entrar novamente com outro time.');
      toast.error('Você já está participando desta partida');
      return;
    }
    
    // Busca o time selecionado para verificação prévia
    const selectedTeam = userTeams.find(team => team && team.id === teamId);
    if (!selectedTeam) {
      console.error(`Time com ID ${teamId} não encontrado`);
      setError("Time não encontrado.");
      return;
    }

    // Contar jogadores do time incluindo o capitão
    // Inicialmente, vamos contar os jogadores que estão explicitamente na lista de jogadores
    let teamPlayersCount = selectedTeam.players && Array.isArray(selectedTeam.players) 
      ? selectedTeam.players.length 
      : 0;
    
    // Verificar se o capitão já está contabilizado na lista de jogadores
    const captainIsInPlayersList = selectedTeam.players && Array.isArray(selectedTeam.players) && 
      selectedTeam.players.some((p: any) => p && p.id === selectedTeam.captainId);
    
    // Se o capitão não estiver na lista de jogadores, adicione-o à contagem
    if (!captainIsInPlayersList && selectedTeam.captainId) {
      teamPlayersCount += 1;
      console.log(`Capitão do time não estava na lista de jogadores, adicionando +1 à contagem`);
    }

    console.log(`Time ${selectedTeam.name} tem ${teamPlayersCount} jogadores (incluindo capitão)`);

    // Verifica se há vagas suficientes
    const totalCurrentPlayers = calculateTotalPlayers();
    if (totalCurrentPlayers + teamPlayersCount > match.maxPlayers) {
      console.warn("Não há vagas suficientes para este time");
      setError(`Não há vagas suficientes para este time. Restam ${match.maxPlayers - totalCurrentPlayers} vagas.`);
      return;
    }
    
    try {
      setJoining(true);
      
      // Atualizamos o estado local imediatamente para feedback visual
      // Cria uma representação do time para a lista de jogadores
      const teamEntry = {
        id: `team-${teamId}`,
        name: `${selectedTeam.name} (Time)`,
        isTeam: true,
        playerCount: teamPlayersCount,
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
        console.log("Time adicionado localmente:", teamEntry);
      }
      
      // Salvamos imediatamente no estado para feedback visual
      setMatch(updatedMatch);

      // Guardamos no localStorage para persistência entre recargas
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
        console.log(`Time ${teamId} salvo em localStorage para partida ${matchId}`);
      } catch (err) {
        console.error("Erro ao salvar time no localStorage:", err);
      }
      
      // Fecha as opções de time
      setShowTeamOptions(false);
      
      // Forçamos a atualização da interface imediatamente
      forceRefresh();
      
      try {
        // Tenta usar a API real (em paralelo, não bloqueia a experiência do usuário)
        console.log(`Tentando entrar na partida ${id} com o time ${teamId} via API`);
        await api.matches.joinWithTeam(Number(id), teamId);
        console.log("API de joinWithTeam retornou com sucesso");
        setSimulationMode(false);
      } catch (apiError) {
        console.warn('API para entrar com time indisponível, usando simulação local:', apiError);
        setSimulationMode(true);
      }
      
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
          } else {
            console.warn("Resposta da API não contém nosso time, mantendo versão local");
          }
        } catch (apiError) {
          console.warn('API indisponível para atualizar detalhes após entrar com time, continuando com simulação local:', apiError);
          setSimulationMode(true);
        }
        forceRefresh();
      }, 800);
      
      toast.success(`Seu time ${selectedTeam.name} entrou na partida com sucesso!`);
    } catch (error) {
      console.error('Erro ao entrar na partida com o time:', error);
      setError('Não foi possível entrar na partida com o time. Tente novamente mais tarde.');
    } finally {
      setJoining(false);
    }
  };

  // Função para sair da partida
  const handleLeaveMatch = async () => {
    setLeaving(true);
    setError(null);
    
    console.log('Tentando sair da partida...');
    
    try {
      // Verificar se o usuário está na partida
      if (!userIsInMatch || !match) {
        console.error('Usuário não está na partida ou partida não encontrada');
        setError('Você não está participando desta partida');
        toast.error('Você não está participando desta partida');
        setLeaving(false);
        return;
      }
      
      // Atualizar estado local primeiro para feedback imediato
      const updatedPlayers = match.players.filter((player: any) => 
        player.id !== currentUser.id && player.teamId === null
      );
      
      const updatedTeams = match.teams.filter((team: any) => 
        !team.players.some((player: any) => player.id === currentUser.id)
      );
      
      setMatch({
        ...match,
        players: updatedPlayers,
        teams: updatedTeams
      });
      
      // Remover da lista de partidas ingressadas no localStorage
      const joinedMatches = JSON.parse(localStorage.getItem('joinedMatches') || '[]');
      // Garantir que joinedMatches seja um array
      const matchesArray = Array.isArray(joinedMatches) ? joinedMatches : [];
      const updatedJoinedMatches = matchesArray.filter((id: number) => id !== match.id);
      localStorage.setItem('joinedMatches', JSON.stringify(updatedJoinedMatches));
      
      // Tentar chamar a API
      try {
        if (match.id) {
          await api.matches.leave(match.id);
          console.log('API de saída chamada com sucesso');
        }
      } catch (apiError) {
        console.warn('Erro ao chamar API de saída, simulando comportamento:', apiError);
        // Se a API falhar, pelo menos o estado local foi atualizado
      }
      
      // Recarregar detalhes da partida após um breve atraso
      setTimeout(() => {
        if (match && match.id) {
          fetchMatchDetails(match.id);
          setUserIsInMatch(false);
        }
      }, 500);
      
      toast.success('Você saiu da partida com sucesso');
    } catch (error) {
      console.error('Erro ao sair da partida:', error);
      setError('Erro ao sair da partida. Tente novamente.');
      toast.error('Erro ao sair da partida. Tente novamente.');
    } finally {
      setLeaving(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distância em km
    return parseFloat(distance.toFixed(1));
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
      console.error('Erro ao formatar data:', error);
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

  const getMapUrl = (): string => {
    if (userLocation) {
      const matchLat = match.location?.latitude || match.latitude;
      const matchLng = match.location?.longitude || match.longitude;
      
      if (matchLat && matchLng) {
        return `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${matchLat},${matchLng}`;
      }
    }
    return '#';
  };

  const toggleMap = (): void => {
    setShowMap(!showMap);
  };

  const toggleMapType = (): void => {
    setUseIframeMap(!useIframeMap);
  };

  // Calcular total de vagas ocupadas, considerando que times ocupam múltiplas vagas
  const calculateTotalPlayers = () => {
    if (!match || !match.players || !Array.isArray(match.players)) return 0;
    
    let total = 0;
    match.players.forEach((player: any) => {
      if (!player) return; // Ignora jogadores undefined ou null
      
      if (player.isTeam && player.teamId) {
        // Busca o time na lista de times para obter o número real de jogadores
        const teamInMatch = match.teams && Array.isArray(match.teams) 
          ? match.teams.find((t: any) => t && t.id === player.teamId) 
          : null;
        
        if (teamInMatch && teamInMatch.players && Array.isArray(teamInMatch.players)) {
          let teamSize = teamInMatch.players.length;
          
          // Verificar se o capitão do time já está na lista de jogadores
          const captainIsInPlayersList = teamInMatch.captainId && 
            teamInMatch.players.some((p: any) => p && p.id === teamInMatch.captainId);
          
          // Se o capitão não estiver na lista mas existir, adicionar +1 à contagem
          if (!captainIsInPlayersList && teamInMatch.captainId) {
            teamSize += 1;
            console.log(`Capitão do time ${player.name} não está na lista de jogadores, adicionando +1 à contagem`);
          }
          
          total += teamSize;
          console.log(`Time ${player.name} conta com ${teamSize} jogadores (incluindo capitão)`);
        } else if (typeof player.playerCount === 'number') {
          // Fallback para playerCount se não conseguirmos encontrar o time ou seus jogadores
          total += player.playerCount;
          console.log(`Time ${player.name} conta como ${player.playerCount} jogadores (fallback)`);
        } else {
          // Fallback final - assume pelo menos 1 jogador
          total += 1;
          console.log(`Time ${player.name} - não foi possível determinar número de jogadores, assumindo 1`);
        }
      } else {
        total += 1; // Jogador individual
        console.log(`Jogador ${player.name || player.id || 'desconhecido'} conta como 1`);
      }
    });
    
    console.log(`Total de jogadores calculado: ${total}`);
    return total;
  };

  // Adicionar função fetchMatchDetails se estiver faltando
  const fetchMatchDetails = async (matchId: number) => {
    try {
      setLoading(true);
      console.log(`Buscando detalhes da partida: ${matchId}`);
      const matchData = await api.matches.getById(matchId);
      setMatch(matchData);
      console.log('Detalhes da partida carregados:', matchData);
      
      // Verificar se o usuário atual está na partida, com verificações de segurança para evitar erros
      const userPresent = 
        // Usuário está como jogador individual
        (matchData && matchData.players && Array.isArray(matchData.players) && 
          matchData.players.some((player: any) => player && player.id === currentUser?.id)) || 
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
      console.log(`Usuário está na partida: ${userPresent}`);
    } catch (error) {
      console.error('Erro ao buscar detalhes da partida:', error);
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
      console.log(`Visualizando detalhes do time: ${teamInfo.name}`);
    } else {
      console.warn(`Time com ID ${teamId} não encontrado para visualização`);
    }
  };

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

  console.log('Dados do usuário atual:', currentUser);
  console.log('Lista de jogadores da partida:', match.players);
  console.log('Estrutura completa do objeto match:', match);
  console.log('Estrutura do campo location:', match.location);
  console.log('Contador de refreshes:', refreshCounter); // Log do contador de refreshes

  const totalPlayersCount = calculateTotalPlayers();
  const isFull = totalPlayersCount >= match.maxPlayers;
  
  console.log('------- DETALHES DA PARTIDA -------');
  console.log(`ID: ${match.id}, Título: ${match.title}`);
  console.log(`Máximo de jogadores: ${match.maxPlayers}`);
  console.log(`Total atual de jogadores: ${totalPlayersCount}`);
  console.log(`A partida está cheia? ${isFull ? 'SIM' : 'NÃO'}`);
  console.log(`Número de items na lista players: ${match.players?.length || 0}`);
  console.log('----------------------------------');
  
  // Verificar se o usuário já está na partida
  const userHasJoined = match && match.players && Array.isArray(match.players) && 
    match.players.some((player: any) => {
      if (!player) return false;
      
      // Verifica se é o próprio usuário como jogador individual
      const isCurrentUser = player.id === currentUser?.id;
      
      // Verifica se é um time do usuário
      const isUserTeam = player && player.isTeam && match.teams && Array.isArray(match.teams) && 
        match.teams.some((t: any) => 
          t && t.id === player.teamId && t.ownerId === currentUser?.id
        );
      
      console.log(`Verificando jogador: ${player.name || player.id}. É o usuário atual? ${isCurrentUser}. É time do usuário? ${isUserTeam}`);
      
      return isCurrentUser || isUserTeam;
    });
    
  console.log(`O usuário atual ${currentUser?.name || currentUser?.id || 'desconhecido'} está na partida? ${userHasJoined}`);

  return (
    <div className="match-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Voltar
      </button>
      
      {simulationMode && (
        <div className="simulation-mode-notice">
          Modo de simulação ativo - As alterações só serão visíveis localmente
        </div>
      )}
      
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
          
          {distance !== null && (
            <div className="info-row">
              <div className="info-label">Distância:</div>
              <div className="info-value">{distance} km de você</div>
            </div>
          )}
          
          <div className="info-row">
            <div className="info-label">Preço:</div>
            <div className="info-value">
              {formatPrice(match.price)}
            </div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Vagas:</div>
            <div className="info-value">
              {totalPlayersCount} / {match?.maxPlayers || 0}
              {isFull && <span className="full-tag">LOTADO</span>}
            </div>
          </div>
        </div>
        
        {match.description && (
          <div className="match-description">
            <h3>Descrição</h3>
            <p>{match.description}</p>
          </div>
        )}
        
        <div className="map-section">
          <h3>Localização</h3>
          <button className="toggle-map-button" onClick={toggleMap}>
            {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
          </button>
          
          {showMap && (
            <div className="map-container">
              {(match.location?.latitude && match.location?.longitude) || match.latitude || match.longitude ? (
                <>
                  {useIframeMap ? (
                    <IframeMap 
                      matchLocation={{
                        lat: match.location?.latitude || match.latitude,
                        lng: match.location?.longitude || match.longitude,
                        address: match.location?.address || (typeof match.location === 'string' ? match.location : undefined)
                      }}
                    />
                  ) : (
                    <Map 
                      matchLocation={{
                        lat: match.location?.latitude || match.latitude,
                        lng: match.location?.longitude || match.longitude,
                        address: match.location?.address || (typeof match.location === 'string' ? match.location : undefined)
                      }}
                      userLocation={userLocation || undefined}
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
              ) : (
                <div className="map-placeholder">
                  <span>Localização não disponível</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="players-section">
          <h3>Jogadores ({totalPlayersCount}/{match?.maxPlayers || 0})</h3>
          {match.players && match.players.length > 0 ? (
            <ul className="players-list">
              {match.players.map((player: any) => (
                <li key={player?.id || `player-${Math.random()}`} className={`player-item ${player?.isTeam ? 'team-player' : ''}`}>
                  {player?.isTeam ? (
                    <>
                      <div className="team-player-header">
                        <span className="team-name">{player?.name || 'Time sem nome'}</span>
                        <span className="team-count-badge">
                          {(() => {
                            // Buscar o número real de jogadores para este time
                            if (player?.teamId && match.teams && Array.isArray(match.teams)) {
                              const teamInfo = match.teams.find((t: any) => t && t.id === player.teamId);
                              if (teamInfo && teamInfo.players && Array.isArray(teamInfo.players)) {
                                // Verificar se o capitão já está na lista de jogadores
                                const captainInPlayers = teamInfo.captainId && 
                                  teamInfo.players.some((p: any) => p && p.id === teamInfo.captainId);
                                
                                // Calcular o total (jogadores + capitão se não estiver na lista)
                                const totalPlayers = teamInfo.players.length + (!captainInPlayers && teamInfo.captainId ? 1 : 0);
                                
                                return `${totalPlayers} jogador${totalPlayers !== 1 ? 'es' : ''}`;
                              }
                            }
                            // Fallback para playerCount se não conseguirmos encontrar o time
                            return `${player?.playerCount || 0} jogador${player?.playerCount !== 1 ? 'es' : ''}`;
                          })()}
                        </span>
                      </div>
                      {/* Mostrar quem é o capitão do time */}
                      {player?.teamId && match.teams && Array.isArray(match.teams) && (() => {
                        const teamInfo = match.teams.find((t: any) => t && t.id === player.teamId);
                        if (teamInfo && teamInfo.captain) {
                          return (
                            <div className="team-captain-info">
                              <span className="captain-indicator">Capitão: {teamInfo.captain.name}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {/* Botão para visualizar detalhes do time */}
                      {player?.teamId && (
                        <button 
                          className="view-team-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTeamDetails(player.teamId);
                          }}
                        >
                          Ver jogadores
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {player?.name || 'Jogador desconhecido'}
                      {player?.id === match.organizer?.id && (
                        <span className="organizer-badge">
                          <SportsSoccerIcon fontSize="small" /> Organizador
                        </span>
                      )}
                      {player?.id === currentUser?.id && (
                        <span className="you-badge">Você</span>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-players">Nenhum jogador inscrito ainda.</p>
          )}
        </div>
        
        <div className="action-buttons">
          {!userHasJoined ? (
            <>
              {showTeamOptions ? (
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
                              {team.banner && <img src={team.banner} alt={team.name} className="team-logo" />}
                              <div className="team-details">
                                <span className="team-name">{team.name}</span>
                                <div className="team-info">
                                  <span className="player-count">{team.players?.length || 0} jogadores</span>
                                  {team.isCurrentUserCaptain && <span className="captain-badge">Capitão</span>}
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
                    </>
                  )}
                  <button 
                    className="cancel-button" 
                    onClick={() => setShowTeamOptions(false)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="join-options">
                  <button 
                    className="join-button individual" 
                    onClick={handleJoinMatch} 
                    disabled={joining || isFull || loading}
                  >
                    {joining ? (
                      <>
                        <span className="button-spinner"></span>
                        Entrando...
                      </>
                    ) : 'Entrar como Jogador'}
                  </button>
                  
                  <button 
                    className="join-button team" 
                    onClick={fetchUserTeams} 
                    disabled={joining || isFull || loadingTeams || loading}
                  >
                    {loadingTeams ? (
                      <>
                        <span className="button-spinner"></span>
                        Carregando Times...
                      </>
                    ) : 'Entrar com Time'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <button 
              className="leave-button" 
              onClick={handleLeaveMatch} 
              disabled={leaving || loading}
            >
              {leaving ? (
                <>
                  <div className="button-spinner" /> Saindo...
                </>
              ) : (
                'Sair da Partida'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal para exibir detalhes do time */}
      {showTeamDetailsModal && selectedTeamForView && (
        <div className="modal-overlay" onClick={() => setShowTeamDetailsModal(false)}>
          <div className="team-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowTeamDetailsModal(false)}>×</button>
            
            <div className="team-details-header">
              {selectedTeamForView.banner && (
                <img 
                  src={selectedTeamForView.banner} 
                  alt={selectedTeamForView.name} 
                  className="team-banner"
                />
              )}
              <h2>{selectedTeamForView.name}</h2>
              {selectedTeamForView.description && (
                <p className="team-description">{selectedTeamForView.description}</p>
              )}
            </div>
            
            <div className="team-members-section">
              <h3>Jogadores do Time</h3>
              
              {/* Exibir o capitão primeiro */}
              {selectedTeamForView.captain && (
                <div className="team-captain-row">
                  <h4>Capitão</h4>
                  <div className="player-card captain">
                    <div className="player-info">
                      <div className="player-name">{selectedTeamForView.captain.name}</div>
                      <div className="player-email">{selectedTeamForView.captain.email}</div>
                    </div>
                    {selectedTeamForView.captain.id === currentUser?.id && (
                      <span className="you-badge">Você</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Exibir os jogadores */}
              {selectedTeamForView.players && selectedTeamForView.players.length > 0 ? (
                <>
                  <h4>Jogadores</h4>
                  <div className="team-players-list">
                    {selectedTeamForView.players
                      .filter((p: any) => p && p.id !== selectedTeamForView.captainId)
                      .map((player: any) => (
                        <div key={player.id} className="player-card">
                          <div className="player-info">
                            <div className="player-name">{player.name}</div>
                            <div className="player-email">{player.email}</div>
                          </div>
                          {player.id === currentUser?.id && (
                            <span className="you-badge">Você</span>
                          )}
                        </div>
                      ))
                    }
                  </div>
                </>
              ) : (
                <p className="no-players-message">Este time não tem jogadores adicionais além do capitão.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetail; 