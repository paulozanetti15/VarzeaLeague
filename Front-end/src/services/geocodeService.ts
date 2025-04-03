/**
 * Serviço de geocodificação para converter endereços em coordenadas
 * Usando a API Nominatim do OpenStreetMap (gratuita e sem necessidade de chave)
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Busca coordenadas GPS baseadas no endereço fornecido
 * @param address Endereço completo para geocodificar
 * @returns Promise com os dados de localização (latitude, longitude, displayName)
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    // Limitar requisições para não sobrecarregar o serviço
    // Nominatim tem limites rígidos de uso
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VarzeaLeague/1.0' // User-Agent é obrigatório para Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

/**
 * Busca o endereço baseado nas coordenadas (geocodificação reversa)
 * @param latitude Latitude do ponto
 * @param longitude Longitude do ponto
 * @returns Promise com o endereço formatado
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VarzeaLeague/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao realizar geocodificação reversa:', error);
    return null;
  }
}; 