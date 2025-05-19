import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, set } from 'date-fns';
import { ptBR, tr } from 'date-fns/locale';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import DirectionsIcon from '@mui/icons-material/Directions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Map, IframeMap } from '../../components/Map';
import { api } from '../../services/api';
import { geocodeAddress } from '../../services/geocodeService';
import './MatchDetail.css';
import toast from 'react-hot-toast';
import RegrasFormInfoModal from '../../components/Modals/Regras/RegrasFormInfoModal';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import ModalTeams from '../../components/Modals/Teams/modelTeams';
const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [useIframeMap, setUseIframeMap] = useState(false);
  const [timeCadastrados, setTimeCadastrados] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [modal, setModal] = useState(false);
 const [showModal, setShowModal] = useState(false);

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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []); // Add missing closing parenthesis for the first useEffect
  useEffect(() => {
    const fetchMatchDetailsInit = async () => {
      try {
        setLoading(true);
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
  
  const handleLeaveMatch = async (id:number,teamid:number) => {
    id= Number(id);
    const response=await axios.delete(`http://localhost:3001/api/matches/${id}/join-team/${teamid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.status === 200) {
      toast.success('Time removido da partida com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error('Erro ao sair da partida. Tente novamente.');
    }
  };
  const calculateDistance = (lat1: number | string, lon1: number | string, lat2: number | string, lon2: number | string): number | null => {
    // Converter explicitamente para números e validar
    const lat1Num = typeof lat1 === 'string' ? parseFloat(lat1) : Number(lat1);
    const lon1Num = typeof lon1 === 'string' ? parseFloat(lon1) : Number(lon1);
    const lat2Num = typeof lat2 === 'string' ? parseFloat(lat2) : Number(lat2);
    const lon2Num = typeof lon2 === 'string' ? parseFloat(lon2) : Number(lon2);

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
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
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
  const handleModalClose = () => {
    setModal(false);
  }
  const handleModalShow = () => {
    setModal(true);
  }  
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
    getUserLocation();
    (window as any).getUserLocation = getUserLocation;
  }, [match?.id]); // Dependência alterada para match.id para evitar loops infinitos
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
        setMatch((prev: any) => {
          if (!prev) return prev;
          const formattedAddress = coordinates.displayName || address;
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
            <SportsSoccerIcon /> Organizado por: {match.organizer.name || 'Desconhecido'}
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
        </div>
        {match.description && (
          <div className="match-description">
            <h3>Descrição</h3>
            <p>{match.description}</p>
          </div>
        )}
        <div className="match-description">
          <h3>Regras</h3>
          <Button 
            className="view-rules-btn" 
            variant="primary" 
            onClick={() => setShowRulesModal(true)}
          >
            <i className="fas fa-clipboard-list me-2"></i>
            Visualizar regras
          </Button>
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
        <div className="match-description">
          <h3 >Times Participantes</h3>
          {timeCadastrados.length > 0 ? (
            <div className="teams-list d-flex flex-wrap justify-content-center" key={id}>
              {timeCadastrados.map((team: any) => (
                <Card style={{ width: '18rem' }} key={team.id}> 
                  <Card.Body>
                    {team.banner &&
                      <Card.Img
                       src={`http://localhost:3001/uploads/teams/${team.banner}`} 
                       variant='top'
                      />
                    }
                    <div className='d-flex flex-column align-items-center text-center mt-3'>
                      <Card.Title className='container'>{team.name}</Card.Title>
                      <Button variant="primary" onClick={() => handleLeaveMatch(id,team.id)}>Sair Partida</Button>
                    </div>  
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              <p>Nenhum time inscrito ainda.</p>
            </div>
          )}
          <div className="d-flex justify-content-center w-100">
            <Button 
              variant="primary"
              className="mt-5"
              onClick={() =>handleModalShow()} // Exemplo: usar o primeiro time da lista
            >
              Cadastrar time
            </Button>
            {modal && (
              <ModalTeams 
                show={modal} 
                onHide={handleModalClose} 
                match={match.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;