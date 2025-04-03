// matchService.ts - Funções específicas para carregamento de jogadores em partidas

import { markEndpointAsInvalid, isEndpointInvalid, registerMatchError, addTimestamp } from './apiHelpers';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Busca jogadores para uma partida utilizando diferentes estratégias
 * @param matchId ID da partida
 * @param token Token de autorização
 * @returns Array de jogadores ou null se não conseguir carregar
 */
export const loadPlayersForMatch = async (matchId: number, token: string): Promise<any[] | null> => {
  // Estratégia 1: Buscar pelo endpoint específico de jogadores
  const playersEndpoint = `${API_BASE_URL}/matches/${matchId}/players`;
  
  if (!isEndpointInvalid(playersEndpoint)) {
    try {
      console.log(`Tentando carregar jogadores de ${matchId} pelo endpoint específico...`);
      const response = await fetch(addTimestamp(playersEndpoint), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Verificar se o objeto tem a propriedade 'players' como array
        if (data && data.players && Array.isArray(data.players)) {
          console.log(`Endpoint específico retornou ${data.players.length} jogadores para partida ${matchId}`);
          
          // Adicionar metadados ao log se disponíveis
          if (data.meta) {
            console.log(`Metadados da partida ${matchId}:`, {
              totalIndividualPlayers: data.meta.totalIndividualPlayers,
              totalTeams: data.meta.totalTeams,
              totalPlayers: data.meta.totalPlayers,
              isEmpty: data.meta.isEmpty,
              hasPlayersInDB: data.meta.hasPlayersInDB
            });
            
            // Registrar erro se indicado na resposta
            if (data.meta.error) {
              registerMatchError(matchId, `API reportou erro: ${data.meta.errorMessage || data.meta.errorType || 'Desconhecido'}`);
            }
          }
          
          return data.players;
        }
        
        console.warn(`Endpoint específico não retornou objeto válido com players para partida ${matchId}`, data);
        registerMatchError(matchId, 'Resposta da API não contém array de jogadores válido');
      } else if (response.status === 404) {
        console.warn(`Endpoint específico de jogadores não disponível (404) para partida ${matchId}`);
        markEndpointAsInvalid(playersEndpoint);
        registerMatchError(matchId, 'API /players não disponível (404)');
      } else {
        console.warn(`Falha ao carregar jogadores específicos: ${response.status} ${response.statusText}`);
        registerMatchError(matchId, `Falha na API: ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Erro ao buscar jogadores específicos para partida ${matchId}:`, error);
      registerMatchError(matchId, `Erro na requisição: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  } else {
    console.log(`Pulando endpoint específico já conhecido como inválido: ${playersEndpoint}`);
  }
  
  // Estratégia 2: Buscar com flag forceIncludePlayersOnly
  const alternativeEndpoint = `${API_BASE_URL}/matches/${matchId}?forceIncludePlayersOnly=true`;
  
  if (!isEndpointInvalid(alternativeEndpoint)) {
    try {
      console.log(`Tentando carregar jogadores de ${matchId} pelo método alternativo...`);
      const response = await fetch(addTimestamp(alternativeEndpoint), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const matchData = await response.json();
        if (matchData && matchData.players && Array.isArray(matchData.players)) {
          console.log(`Método alternativo retornou ${matchData.players.length} jogadores para partida ${matchId}`);
          return matchData.players;
        }
        
        console.warn(`Método alternativo não retornou array válido para partida ${matchId}`);
      } else if (response.status === 404) {
        console.warn(`Endpoint alternativo não disponível (404) para partida ${matchId}`);
        markEndpointAsInvalid(alternativeEndpoint);
        registerMatchError(matchId, 'API alternativa não disponível (404)');
      } else {
        console.warn(`Falha ao carregar pelo método alternativo: ${response.status} ${response.statusText}`);
        registerMatchError(matchId, `Falha na API alternativa: ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Erro ao buscar pelo método alternativo para partida ${matchId}:`, error);
      registerMatchError(matchId, `Erro no método alternativo: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  } else {
    console.log(`Pulando método alternativo já conhecido como inválido: ${alternativeEndpoint}`);
  }
  
  // Estratégia 3: Último recurso - tentar o endpoint básico da partida
  const basicEndpoint = `${API_BASE_URL}/matches/${matchId}`;
  
  if (!isEndpointInvalid(basicEndpoint)) {
    try {
      console.log(`Tentando carregar jogadores de ${matchId} pelo endpoint básico...`);
      const response = await fetch(addTimestamp(basicEndpoint), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const matchData = await response.json();
        if (matchData && matchData.players && Array.isArray(matchData.players)) {
          console.log(`Endpoint básico retornou ${matchData.players.length} jogadores para partida ${matchId}`);
          return matchData.players;
        }
        
        console.warn(`Endpoint básico não retornou array válido para partida ${matchId}`);
      } else {
        console.warn(`Falha ao carregar pelo endpoint básico: ${response.status} ${response.statusText}`);
        registerMatchError(matchId, `Falha no endpoint básico: ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Erro ao buscar pelo endpoint básico para partida ${matchId}:`, error);
      registerMatchError(matchId, `Erro no endpoint básico: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  } else {
    console.log(`Pulando endpoint básico já conhecido como inválido: ${basicEndpoint}`);
  }
  
  // Se chegamos aqui, todas as estratégias falharam
  console.error(`Todas as estratégias falharam para carregar jogadores da partida ${matchId}`);
  return null;
}; 