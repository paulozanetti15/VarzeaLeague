import React, { useEffect, useState } from 'react';
import './Map.css';

// Interface para as propriedades do mapa
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

// Componente principal do mapa (agora apenas um wrapper para o IframeMap)
export const Map: React.FC<MapProps> = (props) => {
  // Simplesmente usamos o IframeMap para todos os casos
  return <IframeMap matchLocation={props.matchLocation} />;
};

// Componente de mapa alternativo usando iframe
export const IframeMap: React.FC<{
  matchLocation: { lat: number; lng: number; address?: string; formattedAddress?: string };
}> = ({ matchLocation }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Esconder a mensagem informativa após 5 segundos
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 5000);
    
    return () => {
      setIsMounted(false);
      clearTimeout(timer);
    };
  }, []);

  // Exibir mensagem enquanto o componente não está montado
  if (!isMounted) {
    return <div className="map-loading"><span>Carregando mapa...</span></div>;
  }

  // Verificar se temos coordenadas válidas
  if (!matchLocation || typeof matchLocation.lat !== 'number' || typeof matchLocation.lng !== 'number') {
    return (
      <div className="map-placeholder">
        <span>Localização não disponível</span>
      </div>
    );
  }

  // Gerar uma chave única baseada nas coordenadas para forçar a recriação quando a localização mudar
  const mapKey = `iframe-${matchLocation.lat.toFixed(6)}-${matchLocation.lng.toFixed(6)}-${Date.now()}`;

  // Construir URL do OpenStreetMap para exibir o local da partida
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${matchLocation.lng - 0.01},${matchLocation.lat - 0.01},${matchLocation.lng + 0.01},${matchLocation.lat + 0.01}&layer=mapnik&marker=${matchLocation.lat},${matchLocation.lng}`;

  // Obter nome do local para exibição
  const locationName = matchLocation.formattedAddress 
    ? matchLocation.formattedAddress.split(',')[0] 
    : (matchLocation.address || 'Local da partida');

  return (
    <div className="iframe-map-container">
      <iframe
        key={mapKey}
        title="Mapa do local"
        width="100%"
        height="300"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
      ></iframe>
      
      {showInfo && (
        <div className="map-info-message">
          Usando mapa simplificado para melhor compatibilidade
        </div>
      )}
      
      {(matchLocation.formattedAddress || matchLocation.address) && (
        <div className="map-location-name">
          {locationName}
        </div>
      )}
    </div>
  );
}; 