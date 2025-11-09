import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  buscarSumulaPartidaCampeonato,
  atualizarSumulaPartidaCampeonato,
  deletarSumulaPartidaCampeonato
} from '../controllers/TeamHistoryController';
import {
  addGoal,
  addCard,
  listEvents,
  deleteGoalEvent,
  deleteCardEvent,
  clearGoals,
  clearCards
} from '../controllers/ChampionshipMatchEventsController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Súmulas - Campeonatos
 *   description: Gerenciamento completo de súmulas/relatórios de partidas de campeonatos incluindo eventos (gols e cartões)
 */

/**
 * @swagger
 * /api/championship-reports/{matchId}:
 *   get:
 *     summary: Buscar súmula de partida de campeonato
 *     description: Retorna os dados completos da súmula incluindo placar, times participantes, observações e estatísticas da partida de campeonato
 *     tags: [Súmulas - Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
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
 *                   description: ID do time mandante
 *                   example: 1
 *                 team_away:
 *                   type: integer
 *                   description: ID do time visitante
 *                   example: 2
 *                 team_home_score:
 *                   type: integer
 *                   description: Gols do time mandante
 *                   example: 2
 *                 team_away_score:
 *                   type: integer
 *                   description: Gols do time visitante
 *                   example: 1
 *                 observations:
 *                   type: string
 *                   nullable: true
 *                   example: Vitória importante para classificação
 *                 match:
 *                   type: object
 *                   properties:
 *                     championship:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Copa Várzea 2025
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
 *               sumulaCampeonato:
 *                 summary: Súmula completa de campeonato
 *                 value:
 *                   id: 1
 *                   match_id: 1
 *                   team_home: 1
 *                   team_away: 2
 *                   team_home_score: 2
 *                   team_away_score: 1
 *                   observations: Partida decisiva da semifinal
 *                   match:
 *                     championship:
 *                       name: Copa Várzea 2025
 *                   teamHome:
 *                     id: 1
 *                     name: Time dos Campeões
 *                   teamAway:
 *                     id: 2
 *                     name: Estrelas FC
 *       401:
 *         description: Token de autenticação ausente, inválido ou expirado
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
 *         description: Súmula ou partida de campeonato não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sumulaNaoEncontrada:
 *                 summary: Súmula não existe
 *                 value:
 *                   message: Súmula não encontrada para esta partida
 *               partidaNaoEncontrada:
 *                 summary: Partida não existe
 *                 value:
 *                   message: Partida de campeonato não encontrada
 *       500:
 *         description: Erro interno do servidor ao buscar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroGenerico:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao buscar súmula da partida de campeonato
 *               erroBancoDados:
 *                 summary: Falha no banco de dados
 *                 value:
 *                   message: Erro de conexão com o banco de dados
 */
router.get('/:matchId', authenticateToken, buscarSumulaPartidaCampeonato);

/**
 * @swagger
 * /api/championship-reports/{matchId}:
 *   put:
 *     summary: Atualizar súmula de partida de campeonato
 *     description: Atualiza o placar da súmula. Aceita tanto teamHome_score/teamAway_score quanto team_home_score/team_away_score. Remove todos os eventos (gols e cartões) existentes.
 *     tags: [Súmulas - Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
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
 *               teamHome_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Placar do time mandante (aceita também team_home_score)
 *                 example: 3
 *               teamAway_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Placar do time visitante (aceita também team_away_score)
 *                 example: 1
 *               team_home_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Placar do time mandante (alternativa)
 *                 example: 3
 *               team_away_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Placar do time visitante (alternativa)
 *                 example: 1
 *           examples:
 *             atualizarPlacarCamelCase:
 *               summary: Atualizar usando teamHome_score/teamAway_score
 *               value:
 *                 team_home: 1
 *                 team_away: 2
 *                 teamHome_score: 3
 *                 teamAway_score: 1
 *             atualizarPlacarSnakeCase:
 *               summary: Atualizar usando team_home_score/team_away_score
 *               value:
 *                 team_home: 1
 *                 team_away: 2
 *                 team_home_score: 4
 *                 team_away_score: 2
 *     responses:
 *       200:
 *         description: Súmula atualizada com sucesso
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
 *         description: Erro interno ao atualizar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar súmula do campeonato
 */
router.put('/:matchId', authenticateToken, atualizarSumulaPartidaCampeonato);

/**
 * @swagger
 * /api/championship-reports/{matchId}:
 *   delete:
 *     summary: Deletar súmula de partida de campeonato
 *     description: Remove completamente a súmula e todos os eventos associados (gols e cartões). Reverte status da partida de 'finalizada' para 'confirmada' se aplicável
 *     tags: [Súmulas - Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Súmula deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Súmula deletada com sucesso e partida retornou para status confirmada
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
 *         description: Erro interno ao deletar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar súmula do campeonato
 */
router.delete('/:matchId', authenticateToken, deletarSumulaPartidaCampeonato);

/**
 * @swagger
 * /api/championship-reports/{matchId}/events:
 *   get:
 *     summary: Listar eventos da partida de campeonato
 *     description: Retorna lista completa de gols e cartões registrados na partida de campeonato
 *     tags: [Súmulas - Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
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
 *                   description: Gols marcados na partida
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
 *                   description: Cartões aplicados
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
 *                   minute: 15
 *                   player:
 *                     id: 5
 *                     nome: Carlos Alberto
 *                 - id: 2
 *                   match_id: 1
 *                   player_id: 8
 *                   minute: 33
 *                   player:
 *                     id: 8
 *                     nome: João Pedro
 *               cards:
 *                 - id: 1
 *                   match_id: 1
 *                   player_id: 3
 *                   card_type: yellow
 *                   minute: 22
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
 *               message: Partida de campeonato não encontrada
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
 * /api/championship-reports/{matchId}/events/goals:
 *   post:
 *     summary: Adicionar gol à partida de campeonato
 *     description: Registra um novo gol marcado. Aceita playerId (jogador cadastrado), userId ou email para identificar quem marcou
 *     tags: [Súmulas - Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
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
 *                 description: ID do jogador cadastrado que marcou o gol
 *                 example: 5
 *               userId:
 *                 type: integer
 *                 description: ID do usuário que marcou o gol (alternativa ao playerId)
 *                 example: 10
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-mail do usuário que marcou o gol (alternativa)
 *                 example: jogador@email.com
 *               minute:
 *                 type: integer
 *                 minimum: 0
 *                 description: Minuto do gol (padrão 0)
 *                 example: 30
 *           examples:
 *             golJogadorCadastrado:
 *               summary: Gol com jogador cadastrado
 *               value:
 *                 playerId: 5
 *                 minute: 23
 *             golUsuario:
 *               summary: Gol com userId
 *               value:
 *                 userId: 10
 *                 minute: 67
 *             golEmail:
 *               summary: Gol identificado por e-mail
 *               value:
 *                 email: jogador@email.com
 *                 minute: 45
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
 *                   nullable: true
 *                 user_id:
 *                   type: integer
 *                   nullable: true
 *                 minute:
 *                   type: integer
 *             example:
 *               id: 1
 *               match_id: 1
 *               player_id: 5
 *               user_id: null
 *               minute: 30
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: ID da partida inválido
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
 *               jogadorNaoEncontrado:
 *                 value:
 *                   message: Jogador não encontrado
 *               usuarioNaoEncontrado:
 *                 value:
 *                   message: Usuário com este e-mail não encontrado
 *       409:
 *         description: Conflito - Gol duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               golDuplicadoJogador:
 *                 value:
 *                   message: Já existe um gol registrado para este jogador neste minuto
 *               golDuplicadoUsuario:
 *                 value:
 *                   message: Já existe um gol registrado para este usuário neste minuto
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
 * /api/championship-reports/{matchId}/events/goals/{goalId}:
 *   delete:
 *     summary: Remover gol específico da partida de campeonato
 *     description: Remove um gol registrado. Apenas o criador do campeonato ou administradores podem remover
 *     tags: [Súmulas - Campeonatos]
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
 *         description: ID do gol
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
 *         description: Sem permissão
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
 *               golNaoEncontrado:
 *                 value:
 *                   message: Gol não encontrado
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida de campeonato não encontrada
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
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
 * /api/championship-reports/{matchId}/events/goals:
 *   delete:
 *     summary: Limpar todos os gols da partida de campeonato
 *     description: Remove todos os gols registrados. Apenas o criador do campeonato ou administradores podem executar
 *     tags: [Súmulas - Campeonatos]
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
 *         description: Gols removidos com sucesso
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
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para limpar eventos desta partida
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida de campeonato não encontrada
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *       500:
 *         description: Erro ao limpar gols
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao limpar gols
 */
router.delete('/:matchId/events/goals', authenticateToken, clearGoals);

/**
 * @swagger
 * /api/championship-reports/{matchId}/events/cards:
 *   post:
 *     summary: Adicionar cartão à partida de campeonato
 *     description: Registra cartão amarelo ou vermelho. Aceita playerId (jogador cadastrado), userId ou email para identificar quem recebeu
 *     tags: [Súmulas - Campeonatos]
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
 *                 description: ID do jogador cadastrado que recebeu o cartão
 *                 example: 3
 *               userId:
 *                 type: integer
 *                 description: ID do usuário que recebeu o cartão (alternativa ao playerId)
 *                 example: 15
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-mail do usuário que recebeu o cartão (alternativa)
 *                 example: jogador@email.com
 *               cardType:
 *                 type: string
 *                 enum: [yellow, red]
 *                 description: Tipo do cartão (obrigatório)
 *                 example: yellow
 *               minute:
 *                 type: integer
 *                 minimum: 0
 *                 description: Minuto da aplicação (padrão 0)
 *                 example: 42
 *           examples:
 *             cartaoAmareloJogador:
 *               summary: Cartão amarelo para jogador cadastrado
 *               value:
 *                 playerId: 3
 *                 cardType: yellow
 *                 minute: 42
 *             cartaoVermelhoUsuario:
 *               summary: Cartão vermelho para usuário
 *               value:
 *                 userId: 15
 *                 cardType: red
 *                 minute: 85
 *             cartaoEmail:
 *               summary: Cartão identificado por e-mail
 *               value:
 *                 email: jogador@email.com
 *                 cardType: yellow
 *                 minute: 30
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
 *                   nullable: true
 *                 user_id:
 *                   type: integer
 *                   nullable: true
 *                 card_type:
 *                   type: string
 *                 minute:
 *                   type: integer
 *             example:
 *               id: 1
 *               match_id: 1
 *               player_id: 3
 *               user_id: null
 *               card_type: yellow
 *               minute: 42
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tipoInvalido:
 *                 value:
 *                   message: Tipo de cartão inválido. Use "yellow" ou "red"
 *               partidaInvalida:
 *                 value:
 *                   message: ID da partida inválido
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
 *               jogadorNaoEncontrado:
 *                 value:
 *                   message: Jogador não encontrado
 *               usuarioNaoEncontrado:
 *                 value:
 *                   message: Usuário com este e-mail não encontrado
 *       409:
 *         description: Conflito - Cartão duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               cartaoDuplicadoJogador:
 *                 value:
 *                   message: Já existe um cartão deste tipo registrado para este jogador neste minuto
 *               cartaoDuplicadoUsuario:
 *                 value:
 *                   message: Já existe um cartão deste tipo registrado para este usuário neste minuto
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
 * /api/championship-reports/{matchId}/events/cards/{cardId}:
 *   delete:
 *     summary: Remover cartão específico da partida de campeonato
 *     description: Remove um cartão aplicado. Apenas o criador do campeonato ou administradores podem remover
 *     tags: [Súmulas - Campeonatos]
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
 *         example: 2
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
 *         description: Sem permissão
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
 *               cartaoNaoEncontrado:
 *                 value:
 *                   message: Cartão não encontrado
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida de campeonato não encontrada
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
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
 * /api/championship-reports/{matchId}/events/cards:
 *   delete:
 *     summary: Limpar todos os cartões da partida de campeonato
 *     description: Remove todos os cartões registrados. Apenas o criador do campeonato ou administradores podem executar
 *     tags: [Súmulas - Campeonatos]
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
 *         description: Cartões removidos com sucesso
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
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para limpar eventos desta partida
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 value:
 *                   message: Partida de campeonato não encontrada
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *       500:
 *         description: Erro ao limpar cartões
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao limpar cartões
 */
router.delete('/:matchId/events/cards', authenticateToken, clearCards);

export default router;
