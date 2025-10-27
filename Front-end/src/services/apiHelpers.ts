/**
 * Small helpers used by services: track invalid endpoints, add cache-busting timestamp, etc.
 */
export const invalidEndpoints: Set<string> = new Set();

export const matchErrors: Record<number, { count: number; lastError: string; timestamp: number }> = {};

const INVALID_ENDPOINT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const markEndpointAsInvalid = (endpoint: string): void => {
  invalidEndpoints.add(endpoint);
  setTimeout(() => {
    invalidEndpoints.delete(endpoint);
  }, INVALID_ENDPOINT_TIMEOUT);
};

export const clearMatchErrors = (matchId: number): void => {
  if (matchErrors[matchId]) delete matchErrors[matchId];
};

export const addTimestamp = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
};

export default {
  invalidEndpoints,
  markEndpointAsInvalid,
  clearMatchErrors,
  addTimestamp
};
// apiHelpers.ts - Funções auxiliares para gerenciamento de API

// Registro de endpoints que retornaram 404 para evitar tentativas repetidas
export const invalidEndpoints: Set<string> = new Set();

// Registro de erros por partida para análise
export const matchErrors: Record<number, {count: number, lastError: string, timestamp: number}> = {};

// Tempo em milissegundos para manter um endpoint na lista de inválidos (30 minutos)
const INVALID_ENDPOINT_TIMEOUT = 30 * 60 * 1000;

/**
 * Marca um endpoint como inválido para evitar chamadas repetidas
 * @param endpoint URL do endpoint que retornou erro
 */
export const markEndpointAsInvalid = (endpoint: string): void => {
  console.warn(`Marcando endpoint como inválido: ${endpoint}`);
  invalidEndpoints.add(endpoint);
  
  // Limpar o registro após o timeout para caso o endpoint seja corrigido
  setTimeout(() => {
    if (invalidEndpoints.has(endpoint)) {
      console.log(`Removendo endpoint ${endpoint} da lista de inválidos após timeout`);
      invalidEndpoints.delete(endpoint);
    }
  }, INVALID_ENDPOINT_TIMEOUT);
};

/**
 * Verifica se um endpoint está na lista de inválidos
 * @param endpoint URL do endpoint a verificar
 * @returns true se o endpoint está na lista de inválidos
 */
export const isEndpointInvalid = (endpoint: string): boolean => {
  return invalidEndpoints.has(endpoint);
};

/**
 * Registra um erro associado a uma partida específica
 * @param matchId ID da partida 
 * @param errorMessage Mensagem de erro
 */
export const registerMatchError = (matchId: number, errorMessage: string): void => {
  if (!matchErrors[matchId]) {
    matchErrors[matchId] = {
      count: 0,
      lastError: '',
      timestamp: 0
    };
  }
  
  matchErrors[matchId].count++;
  matchErrors[matchId].lastError = errorMessage;
  matchErrors[matchId].timestamp = Date.now();
  
  // Log para diagnóstico
  if (matchErrors[matchId].count > 3) {
    console.warn(`Partida ${matchId} teve ${matchErrors[matchId].count} erros. Último erro: ${errorMessage}`);
  }
};

/**
 * Verifica o status dos erros de uma partida
 * @param matchId ID da partida
 * @returns Informações sobre os erros da partida
 */
export const getMatchErrorStatus = (matchId: number): {hasErrors: boolean, count: number, lastError: string, lastErrorTime: number} => {
  if (!matchErrors[matchId]) {
    return {
      hasErrors: false,
      count: 0,
      lastError: '',
      lastErrorTime: 0
    };
  }
  
  return {
    hasErrors: matchErrors[matchId].count > 0,
    count: matchErrors[matchId].count,
    lastError: matchErrors[matchId].lastError,
    lastErrorTime: matchErrors[matchId].timestamp
  };
};

/**
 * Limpa os erros associados a uma partida
 * @param matchId ID da partida
 */
export const clearMatchErrors = (matchId: number): void => {
  if (matchErrors[matchId]) {
    delete matchErrors[matchId];
  }
};

/**
 * Adiciona um timestamp à URL para evitar cache
 * @param url URL base
 * @returns URL com timestamp
 */
export const addTimestamp = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
}; 