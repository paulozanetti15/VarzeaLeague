import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  adicionarSumulaPartidasAmistosas,
  buscarSumulaPartidaAmistosa,
  atualizarSumulaPartidaAmistosa,
  deletarSumulaPartidaAmistosa
} from '../controllers/TeamHistoryController';
import {
  addGoal,
  addCard,
  listEvents,
  deleteGoalEvent,
  deleteCardEvent,
  clearGoals,
  clearCards
} from '../controllers/FriendlyMatchesEventsController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Súmulas - Partidas Amistosas
 *   description: Gerenciamento completo de súmulas/relatórios de partidas amistosas incluindo eventos (gols e cartões)
 */

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}:
 *   get:
 *     summary: Buscar súmula de partida amistosa
 *     description: Retorna os dados completos da súmula incluindo placar, times, observações e jogador destaque (MVP)
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 1
 *     responses:
 *       200:
 *         description: Súmula encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 match_id:
 *                   type: integer
 *                   example: 1
 *                 team_home:
 *                   type: integer
 *                   example: 1
 *                 team_away:
 *                   type: integer
 *                   example: 2
 *                 teamHome_score:
 *                   type: integer
 *                   example: 3
 *                 teamAway_score:
 *                   type: integer
 *                   example: 2
 *                 is_penalty:
 *                   type: boolean
 *                   example: false
 *                 created_by:
 *                   type: integer
 *                   example: 1
 *                 teamHome:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                       example: Time dos Campeões
 *                 teamAway:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                       example: Estrelas FC
 *             examples:
 *               sumulaCompleta:
 *                 summary: Súmula com todos os dados
 *                 value:
 *                   id: 1
 *                   match_id: 1
 *                   team_home: 1
 *                   team_away: 2
 *                   teamHome_score: 3
 *                   teamAway_score: 2
 *                   is_penalty: false
 *                   created_by: 1
 *                   teamHome:
 *                     id: 1
 *                     name: Time dos Campeões
 *                   teamAway:
 *                     id: 2
 *                     name: Estrelas FC
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 summary: Token não fornecido
 *                 value:
 *                   message: Token não fornecido ou inválido
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value:
 *                   message: Token expirado. Faça login novamente
 *       404:
 *         description: Súmula não encontrada para a partida especificada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Súmula não encontrada para esta partida
 *       500:
 *         description: Erro interno do servidor ao buscar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroServidor:
 *                 summary: Erro interno genérico
 *                 value:
 *                   message: Erro ao buscar súmula da partida
 *               erroBancoDados:
 *                 summary: Erro de conexão com banco
 *                 value:
 *                   message: Erro de conexão com o banco de dados
 */
router.get('/:matchId', authenticateToken, buscarSumulaPartidaAmistosa);

/**
 * @swagger
 * /api/friendly-match-reports:
 *   post:
 *     summary: Criar nova súmula para partida amistosa
 *     description: Cria registro de súmula com placar. Aceita campos com dual naming (teamHome_score OU team_home_score, padrão 0). Valida unicidade (já existe súmula), partida existe. Atualiza status da partida para 'finalizada'. Não valida permissões específicas além de autenticação.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - match_id
 *               - team_home
 *               - team_away
 *             properties:
 *               match_id:
 *                 type: integer
 *                 description: ID da partida amistosa
 *                 example: 1
 *               team_home:
 *                 type: integer
 *                 description: ID do time mandante
 *                 example: 1
 *               team_away:
 *                 type: integer
 *                 description: ID do time visitante
 *                 example: 2
 *               teamHome_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Gols do time mandante (aceita teamHome_score OU team_home_score, padrão 0)
 *                 example: 3
 *               team_home_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Alternativa snake_case para teamHome_score
 *                 example: 3
 *               teamAway_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Gols do time visitante (aceita teamAway_score OU team_away_score, padrão 0)
 *                 example: 2
 *               team_away_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Alternativa snake_case para teamAway_score
 *                 example: 2
 *           examples:
 *             sumulaBasica:
 *               summary: Súmula apenas com placar (camelCase)
 *               value:
 *                 match_id: 1
 *                 team_home: 1
 *                 team_away: 2
 *                 teamHome_score: 3
 *                 teamAway_score: 2
 *             sumulaSnakeCase:
 *               summary: Súmula com snake_case (também aceito)
 *               value:
 *                 match_id: 1
 *                 team_home: 1
 *                 team_away: 2
 *                 team_home_score: 4
 *                 team_away_score: 1
 *     responses:
 *       201:
 *         description: Súmula criada com sucesso e partida atualizada para status 'finalizada'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Súmula adicionada com sucesso
 *       400:
 *         description: Dados inválidos - match_id é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: ID da partida é obrigatório
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       409:
 *         description: Conflito - Súmula já existe para esta partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Já existe uma súmula para esta partida
 *       500:
 *         description: Erro interno ao criar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao adicionar súmula
 */
router.post('/', authenticateToken, adicionarSumulaPartidasAmistosas);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}:
 *   put:
 *     summary: Atualizar súmula de partida amistosa
 *     description: |
 *       Atualiza os dados da súmula (placar e times).
 *       
 *       **IMPORTANTE - Aceita campos em camelCase OU snake_case:**
 *       - teamHome_score OU team_home_score (padrão 0)
 *       - teamAway_score OU team_away_score (padrão 0)
 *       
 *       **Efeito colateral:** DELETA todos os gols (FriendlyMatchGoal) e cartões (FriendlyMatchCard) 
 *       associados à partida antes de atualizar a súmula.
 *       
 *       **Sem verificação de permissão** - Apenas autenticação (userId) é necessária.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_home:
 *                 type: integer
 *                 description: ID do time mandante
 *                 example: 1
 *               team_away:
 *                 type: integer
 *                 description: ID do time visitante
 *                 example: 2
 *               team_home_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Gols marcados pelo time mandante (ou teamHome_score). Padrão 0
 *                 example: 4
 *               team_away_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Gols marcados pelo time visitante (ou teamAway_score). Padrão 0
 *                 example: 2
 *           examples:
 *             atualizarCamelCase:
 *               summary: Atualizar com camelCase
 *               value:
 *                 team_home: 1
 *                 team_away: 2
 *                 teamHome_score: 5
 *                 teamAway_score: 3
 *             atualizarSnakeCase:
 *               summary: Atualizar com snake_case
 *               value:
 *                 team_home: 1
 *                 team_away: 2
 *                 team_home_score: 4
 *                 team_away_score: 2
 *     responses:
 *       200:
 *         description: Súmula atualizada com sucesso. Todos os gols e cartões foram deletados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Súmula atualizada com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Súmula não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Súmula não encontrada
 *       500:
 *         description: Erro interno ao atualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar súmula
 */
router.put('/:matchId', authenticateToken, atualizarSumulaPartidaAmistosa);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}:
 *   delete:
 *     summary: Deletar súmula de partida amistosa
 *     description: |
 *       Remove completamente a súmula e todos os eventos associados (gols e cartões).
 *       
 *       **Efeito colateral:** Reverte o status da partida de 'finalizada' para 'confirmada'.
 *       
 *       **Sem verificação de permissão** - Apenas autenticação (userId) é necessária.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 1
 *     responses:
 *       200:
 *         description: Súmula deletada com sucesso e partida retornou para status confirmada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Súmula deletada com sucesso e partida retornou para status confirmada
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Súmula não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Súmula não encontrada
 *       500:
 *         description: Erro interno ao deletar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar súmula
 */
router.delete('/:matchId', authenticateToken, deletarSumulaPartidaAmistosa);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events:
 *   get:
 *     summary: Listar todos os eventos da partida
 *     description: Retorna lista completa de gols e cartões registrados na partida
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de eventos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       match_id:
 *                         type: integer
 *                       player_id:
 *                         type: integer
 *                       minute:
 *                         type: integer
 *                       player:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nome:
 *                             type: string
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       match_id:
 *                         type: integer
 *                       player_id:
 *                         type: integer
 *                       card_type:
 *                         type: string
 *                         enum: [yellow, red]
 *                       minute:
 *                         type: integer
 *                       player:
 *                         type: object
 *             example:
 *               goals:
 *                 - id: 1
 *                   match_id: 1
 *                   player_id: 5
 *                   minute: 23
 *                   player:
 *                     id: 5
 *                     nome: Carlos Alberto
 *                 - id: 2
 *                   match_id: 1
 *                   player_id: 8
 *                   minute: 45
 *                   player:
 *                     id: 8
 *                     nome: João Pedro
 *               cards:
 *                 - id: 1
 *                   match_id: 1
 *                   player_id: 3
 *                   card_type: yellow
 *                   minute: 30
 *                   player:
 *                     id: 3
 *                     nome: Rafael Silva
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       500:
 *         description: Erro ao listar eventos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar eventos da partida
 */
router.get('/:matchId/events', authenticateToken, listEvents);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events/goals:
 *   post:
 *     summary: Adicionar gol à partida
 *     description: |
 *       Registra um novo gol marcado durante a partida.
 *       
 *       **Identificação do autor:** Aceita playerId OU userId OU email (TODOS opcionais, mas recomendado fornecer ao menos um).
 *       
 *       **Validação de duplicatas:** Verifica se já existe gol com mesmo player_id/user_id no mesmo minuto (409).
 *       
 *       **Sem verificação de permissão** - Apenas autenticação (userId) é necessária.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: integer
 *                 description: ID do jogador que marcou (opcional)
 *                 example: 5
 *               userId:
 *                 type: integer
 *                 description: ID do usuário que marcou (opcional)
 *                 example: 10
 *               email:
 *                 type: string
 *                 description: Email do usuário (opcional)
 *                 example: jogador@email.com
 *               minute:
 *                 type: integer
 *                 minimum: 0
 *                 description: Minuto em que o gol foi marcado (opcional)
 *                 example: 23
 *           examples:
 *             golPorJogador:
 *               summary: Gol vinculado a jogador cadastrado
 *               value:
 *                 playerId: 5
 *                 minute: 23
 *             golPorUsuario:
 *               summary: Gol vinculado a usuário
 *               value:
 *                 userId: 10
 *                 minute: 45
 *             golPorEmail:
 *               summary: Gol identificado por email
 *               value:
 *                 email: carlos@email.com
 *                 minute: 67
 *     responses:
 *       201:
 *         description: Gol registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 match_id:
 *                   type: integer
 *                 player_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 minute:
 *                   type: integer
 *             example:
 *               id: 1
 *               match_id: 1
 *               player_id: 5
 *               minute: 23
 *       400:
 *         description: Dados inválidos - matchId obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: ID da partida é obrigatório
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida não encontrada
 *               jogadorNaoEncontrado:
 *                 value:
 *                   message: Jogador não encontrado
 *               usuarioNaoEncontrado:
 *                 value:
 *                   message: Usuário não encontrado
 *       409:
 *         description: Conflito - Gol duplicado (mesmo jogador/usuário no mesmo minuto)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Já existe um gol registrado para este jogador neste minuto
 *       500:
 *         description: Erro ao registrar gol
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao registrar gol
 */
router.post('/:matchId/events/goals', authenticateToken, addGoal);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events/goals/{goalId}:
 *   delete:
 *     summary: Remover gol específico
 *     description: |
 *       Remove um gol registrado na partida.
 *       
 *       **Verificação de permissão:** Apenas o organizador da partida (match.organizerId === userId) 
 *       OU usuários admin (userTypeId === 1) podem deletar gols.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do gol a ser removido
 *         example: 5
 *     responses:
 *       200:
 *         description: Gol removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Gol removido com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - Apenas organizador ou admin podem remover gols
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para remover eventos desta partida
 *       404:
 *         description: Gol ou partida não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida não encontrada
 *               golNaoEncontrado:
 *                 value:
 *                   message: Gol não encontrado
 *       500:
 *         description: Erro ao remover gol
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover gol
 */
router.delete('/:matchId/events/goals/:goalId', authenticateToken, deleteGoalEvent);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events/goals:
 *   delete:
 *     summary: Limpar todos os gols da partida
 *     description: |
 *       Remove todos os gols registrados.
 *       
 *       **Verificação de permissão:** Apenas o organizador da partida (match.organizerId === userId) 
 *       OU usuários admin (userTypeId === 1) podem limpar todos os gols.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *     responses:
 *       200:
 *         description: Todos os gols foram removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Todos os gols foram removidos com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - Apenas organizador ou admin podem limpar gols
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para remover eventos desta partida
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       500:
 *         description: Erro ao limpar gols
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover gols
 */
router.delete('/:matchId/events/goals', authenticateToken, clearGoals);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events/cards:
 *   post:
 *     summary: Adicionar cartão à partida
 *     description: |
 *       Registra cartão amarelo ou vermelho aplicado a um jogador.
 *       
 *       **Campo obrigatório:** cardType ('yellow' ou 'red')
 *       
 *       **Identificação do jogador:** Aceita playerId OU userId OU email (opcionais).
 *       
 *       **Validação de duplicatas:** Verifica se já existe cartão do mesmo tipo para o mesmo player_id/user_id no mesmo minuto (409).
 *       
 *       **Sem verificação de permissão** - Apenas autenticação (userId) é necessária.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardType
 *             properties:
 *               playerId:
 *                 type: integer
 *                 description: ID do jogador que recebeu o cartão (opcional)
 *                 example: 3
 *               userId:
 *                 type: integer
 *                 description: ID do usuário (opcional)
 *                 example: 7
 *               email:
 *                 type: string
 *                 description: Email do usuário (opcional)
 *                 example: jogador@email.com
 *               cardType:
 *                 type: string
 *                 enum: [yellow, red]
 *                 description: Tipo do cartão (obrigatório)
 *                 example: yellow
 *               minute:
 *                 type: integer
 *                 minimum: 0
 *                 description: Minuto da aplicação (opcional)
 *                 example: 38
 *           examples:
 *             cartaoAmarelo:
 *               summary: Cartão amarelo
 *               value:
 *                 playerId: 3
 *                 cardType: yellow
 *                 minute: 38
 *             cartaoVermelho:
 *               summary: Cartão vermelho
 *               value:
 *                 playerId: 7
 *                 cardType: red
 *                 minute: 67
 *     responses:
 *       201:
 *         description: Cartão registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 match_id:
 *                   type: integer
 *                 player_id:
 *                   type: integer
 *                 card_type:
 *                   type: string
 *                 minute:
 *                   type: integer
 *             example:
 *               id: 1
 *               match_id: 1
 *               player_id: 3
 *               card_type: yellow
 *               minute: 38
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               matchIdObrigatorio:
 *                 value:
 *                   message: ID da partida é obrigatório
 *               tipoInvalido:
 *                 value:
 *                   message: Tipo de cartão inválido. Use 'yellow' ou 'red'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida não encontrada
 *               jogadorNaoEncontrado:
 *                 value:
 *                   message: Jogador não encontrado
 *               usuarioNaoEncontrado:
 *                 value:
 *                   message: Usuário não encontrado
 *       409:
 *         description: Conflito - Cartão duplicado (mesmo tipo para mesmo jogador/usuário no mesmo minuto)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Já existe um cartão deste tipo registrado para este jogador neste minuto
 *       500:
 *         description: Erro ao registrar cartão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao registrar cartão
 */
router.post('/:matchId/events/cards', authenticateToken, addCard);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events/cards/{cardId}:
 *   delete:
 *     summary: Remover cartão específico
 *     description: |
 *       Remove um cartão aplicado na partida.
 *       
 *       **Verificação de permissão:** Apenas o organizador da partida (match.organizerId === userId) 
 *       OU usuários admin (userTypeId === 1) podem deletar cartões.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do cartão
 *         example: 3
 *     responses:
 *       200:
 *         description: Cartão removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Cartão removido com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - Apenas organizador ou admin podem remover cartões
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para remover eventos desta partida
 *       404:
 *         description: Cartão ou partida não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida não encontrada
 *               cartaoNaoEncontrado:
 *                 value:
 *                   message: Cartão não encontrado
 *       500:
 *         description: Erro ao remover cartão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover cartão
 */
router.delete('/:matchId/events/cards/:cardId', authenticateToken, deleteCardEvent);

/**
 * @swagger
 * /api/friendly-match-reports/{matchId}/events/cards:
 *   delete:
 *     summary: Limpar todos os cartões da partida
 *     description: |
 *       Remove todos os cartões registrados.
 *       
 *       **Verificação de permissão:** Apenas o organizador da partida (match.organizerId === userId) 
 *       OU usuários admin (userTypeId === 1) podem limpar todos os cartões.
 *     tags: [Súmulas - Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *     responses:
 *       200:
 *         description: Todos os cartões foram removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Todos os cartões foram removidos com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - Apenas organizador ou admin podem limpar cartões
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para remover eventos desta partida
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       500:
 *         description: Erro ao limpar cartões
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover cartões
 */
router.delete('/:matchId/events/cards', authenticateToken, clearCards);

export default router;
