import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

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

// Componente para centralizar o mapa nas coordenadas fornecidas
const CenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

// Função para criar um ícone de marcador personalizado
const createCustomIcon = (isUserLocation: boolean = false) => {
  return L.divIcon({
    className: `custom-marker ${isUserLocation ? 'user-location' : ''}`,
    html: `<div class="marker-pin"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const Map: React.FC<MapProps> = ({ matchLocation, userLocation }) => {
  // Verificar se temos coordenadas válidas
  if (!matchLocation || !matchLocation.lat || !matchLocation.lng) {
    return (
      <div className="map-placeholder">
        <span>Localização não disponível</span>
      </div>
    );
  }

  const matchIcon = createCustomIcon(false);
  const userIcon = createCustomIcon(true);
  
  return (
    <MapContainer
      center={[matchLocation.lat, matchLocation.lng]}
      zoom={14}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={[matchLocation.lat, matchLocation.lng]} icon={matchIcon}>
        <Popup>
          {matchLocation.address || 'Local da partida'}
        </Popup>
      </Marker>
      
      {userLocation && userLocation.lat && userLocation.lng && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Sua localização</Popup>
        </Marker>
      )}
      
      <CenterMap center={[matchLocation.lat, matchLocation.lng]} />
    </MapContainer>
  );
};

// Versão alternativa usando iframe
const IframeMap: React.FC<MapProps> = ({ matchLocation }) => {
  // Verificar se temos coordenadas válidas
  if (!matchLocation || !matchLocation.lat || !matchLocation.lng) {
    return (
      <div className="map-placeholder">
        <span>Localização não disponível</span>
      </div>
    );
  }
  
  const zoom = 14;
  const iframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${matchLocation.lng - 0.01}%2C${matchLocation.lat - 0.01}%2C${matchLocation.lng + 0.01}%2C${matchLocation.lat + 0.01}&amp;layer=mapnik&amp;marker=${matchLocation.lat}%2C${matchLocation.lng}`;
  
  return (
    <iframe 
      width="100%" 
      height="300" 
      frameBorder="0" 
      scrolling="no" 
      marginHeight={0} 
      marginWidth={0} 
      src={iframeUrl}
      style={{ borderRadius: '0.4rem', border: '2px solid #333' }}
      title="Mapa da localização"
    />
  );
};

export { Map, IframeMap }; 