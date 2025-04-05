import React, { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Interface de propriedades do mapa
interface MapProps {
  matchLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  userLocation?: {
    lat: number;
    lng: number;
  };
}

// Importamos os componentes do react-leaflet de forma dinâmica
const LeafletComponents = {
  MapContainer: null as any,
  TileLayer: null as any, 
  Marker: null as any,
  Popup: null as any,
  useMap: null as any
};

// Componente separado para o conteúdo interno do mapa
// Isso resolve o problema de Context.Consumer esperando uma única função filha
const MapContent = ({ 
  matchLocation, 
  userLocation, 
  icons
}: { 
  matchLocation: MapProps['matchLocation'], 
  userLocation?: MapProps['userLocation'],
  icons: { matchIcon: L.DivIcon, userIcon: L.DivIcon }
}) => {
  // Verificar se o userLocation tem coordenadas válidas
  const hasValidUserLocation = Boolean(
    userLocation && 
    typeof userLocation.lat === 'number' && 
    typeof userLocation.lng === 'number'
  );

  // Referência local para os componentes do Leaflet
  const { TileLayer, Marker, Popup } = LeafletComponents;

  return (
    <>
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker 
        position={[matchLocation.lat, matchLocation.lng]} 
        icon={icons.matchIcon}
      >
        <Popup>
          {matchLocation.address || 'Local da partida'}
        </Popup>
      </Marker>
      
      {hasValidUserLocation && userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={icons.userIcon}
        >
          <Popup>Sua localização</Popup>
        </Marker>
      )}
    </>
  );
};

// Componente Leaflet principal
export const LeafletMap: React.FC<MapProps> = ({ matchLocation, userLocation }) => {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useIframeBackup, setUseIframeBackup] = useState(false);

  // Memorizar os ícones para evitar recriações
  const icons = useMemo(() => {
    return {
      matchIcon: L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      }),
      userIcon: L.divIcon({
        className: 'custom-marker user-location',
        html: '<div class="marker-pin"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      })
    };
  }, []);

  // Carregar o react-leaflet de forma dinâmica apenas no cliente
  useEffect(() => {
    setIsClient(true);
    
    const loadLeaflet = async () => {
      try {
        const leaflet = await import('react-leaflet');
        
        // Atribuir os componentes importados
        LeafletComponents.MapContainer = leaflet.MapContainer;
        LeafletComponents.TileLayer = leaflet.TileLayer;
        LeafletComponents.Marker = leaflet.Marker;
        LeafletComponents.Popup = leaflet.Popup;
        LeafletComponents.useMap = leaflet.useMap;
        
        setLeafletLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar react-leaflet:', error);
        // Falhar silenciosamente para o iframe de backup
        setUseIframeBackup(true);
      }
    };
    
    loadLeaflet();
  }, []);

  // Verificar se temos coordenadas válidas
  if (!matchLocation || typeof matchLocation.lat !== 'number' || typeof matchLocation.lng !== 'number') {
    return (
      <div className="map-placeholder">
        <span>Localização não disponível</span>
      </div>
    );
  }

  // Verificar se estamos no cliente 
  if (!isClient) {
    return (
      <div className="map-loading">
        <span>Carregando mapa...</span>
      </div>
    );
  }

  // Se ocorreu um erro ou decidimos usar o iframe de backup
  if (error || useIframeBackup) {
    // Fallback para iframe quando o Leaflet falha
    const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${matchLocation.lng - 0.005},${matchLocation.lat - 0.005},${matchLocation.lng + 0.005},${matchLocation.lat + 0.005}&layer=mapnik&marker=${matchLocation.lat},${matchLocation.lng}`;
    
    return (
      <div className="iframe-map-container">
        <iframe 
          title="Mapa alternativo"
          width="100%" 
          height="300" 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          src={iframeSrc}
        />
        {error && (
          <div className="map-fallback-message">
            Usando mapa alternativo devido a um erro
          </div>
        )}
      </div>
    );
  }

  // Se o Leaflet ainda não foi carregado
  if (!leafletLoaded) {
    return (
      <div className="map-loading">
        <span>Preparando visualização do mapa...</span>
      </div>
    );
  }
  
  // Destructuring dos componentes do Leaflet
  const { MapContainer } = LeafletComponents;
  
  // Criar chave única para forçar recriação do mapa quando as props mudarem
  const mapKey = `leaflet-map-${matchLocation.lat.toFixed(6)}-${matchLocation.lng.toFixed(6)}-${userLocation ? 'user' : 'no-user'}-${Date.now()}`;

  // Tentativa de renderização do componente Leaflet
  try {
    return (
      <div className="leaflet-map-container">
        <MapContainer 
          key={mapKey}
          center={[matchLocation.lat, matchLocation.lng]} 
          zoom={14} 
          scrollWheelZoom={false}
          style={{ height: '300px', width: '100%' }}
        >
          <MapContent 
            matchLocation={matchLocation} 
            userLocation={userLocation}
            icons={icons}
          />
        </MapContainer>
      </div>
    );
  } catch (e) {
    console.error('Erro ao renderizar o mapa do Leaflet:', e);
    // Se ocorrer erro na renderização, mostramos o iframe como fallback
    setUseIframeBackup(true);
    return (
      <div className="map-error">
        <p>Erro ao carregar o mapa interativo. Tentando mapa alternativo...</p>
      </div>
    );
  }
}; 