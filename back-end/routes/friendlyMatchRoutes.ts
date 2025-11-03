import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  joinMatchByTeam,
  getMatchTeams,
  deleteTeamMatch,
  getTeamsAvailable,
  checkTeamsRuleCompliance
} from '../controllers/MatchTeamsController';
import {
  createMatch,
  listMatches,
  getMatch,
  deleteMatch,
  updateMatch,
  getMatchesByOrganizer,
  checkAndCancelMatchesWithInsufficientTeams
} from '../controllers/FriendlyMatchesController';
import {
  listMatchEvaluations,
  upsertMatchEvaluation,
  getMatchEvaluationSummary
} from '../controllers/FriendlyMatchesEvaluationController';
import {
  buscarPunicaoPartidaAmistosa,
  alterarPunicaoPartidaAmistosa,
  deletarPunicaoPartidaAmistosa,
  inserirPunicaoPartidaAmistosa
} from '../controllers/FriendlyMatchesPunishmentController';
import {
  finalizeMatch,
  addGoal,
  addCard,
  listEvents,
  deleteGoalEvent,
  deleteCardEvent,
  clearGoals,
  clearCards
} from '../controllers/FriendlyMatchesEventsController';
import { getMatchPlayersForAdmin } from '../controllers/matchPlayersController';
import { getMatchRosterPlayers } from '../controllers/matchRosterController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Partidas Amistosas
 *   description: Gerenciamento de partidas amistosas
 */

/**
 * @swagger
 * /api/friendly-matches:
 *   post:
 *     summary: Criar nova partida amistosa
 *     tags: [Partidas Amistosas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: Rachão de Sábado
 *               description:
 *                 type: string
 *                 example: Partida amistosa entre amigos
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-20T15:00:00.000Z
 *               location:
 *                 type: string
 *                 example: Campo do Bairro - Rua Principal, 123
 *               duration:
 *                 type: string
 *                 example: 90
 *               price:
 *                 type: number
 *                 example: 30.00
 *               modalidade:
 *                 type: string
 *                 example: Futebol Society
 *               nomequadra:
 *                 type: string
 *                 example: Arena Sports
 *     responses:
 *       201:
 *         description: Partida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', authenticateToken, createMatch);

/**
 * @swagger
 * /api/friendly-matches:
 *   get:
 *     summary: Listar partidas amistosas
 *     tags: [Partidas Amistosas]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberta, sem_vagas, confirmada, em_andamento, finalizada, cancelada]
 *         description: Filtrar por status da partida
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude para cálculo de distância
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude para cálculo de distância
 *     responses:
 *       200:
 *         description: Lista de partidas amistosas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendlyMatch'
 *       500:
 *         description: Erro ao buscar partidas
 */
router.get('/', listMatches);

/**
 * @swagger
 * /api/friendly-matches/organizer:
 *   get:
 *     summary: Listar partidas criadas pelo usuário autenticado
 *     tags: [Partidas Amistosas]
 *     responses:
 *       200:
 *         description: Lista de partidas organizadas pelo usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendlyMatch'
 *       401:
 *         description: Não autenticado
 */
router.get('/organizer', authenticateToken, getMatchesByOrganizer);

/**
 * @swagger
 * /api/friendly-matches/check-cancelled:
 *   post:
 *     summary: Verificar e cancelar partidas sem times suficientes
 *     tags: [Partidas Amistosas]
 *     description: Cancela automaticamente partidas que não atingiram o número mínimo de times
 *     responses:
 *       200:
 *         description: Verificação concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verificação concluída
 *                 cancelledMatches:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Não autenticado
 */
router.post('/check-cancelled', authenticateToken, checkAndCancelMatchesWithInsufficientTeams);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   get:
 *     summary: Buscar partida amistosa por ID
 *     tags: [Partidas Amistosas]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     responses:
 *       200:
 *         description: Dados da partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       404:
 *         description: Partida não encontrada
 *       500:
 *         description: Erro ao buscar partida
 */
router.get('/:id', getMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   put:
 *     summary: Atualizar partida amistosa
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [aberta, sem_vagas, confirmada, em_andamento, finalizada, cancelada]
 *               duration:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Partida atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para editar esta partida
 *       404:
 *         description: Partida não encontrada
 */
router.put('/:id', authenticateToken, updateMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   delete:
 *     summary: Deletar partida amistosa
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     responses:
 *       200:
 *         description: Partida deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para deletar esta partida
 *       404:
 *         description: Partida não encontrada
 */
router.delete('/:id', authenticateToken, deleteMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams:
 *   post:
 *     summary: Inscrever time na partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: integer
 *                 example: 1
 *                 description: ID do time a ser inscrito
 *     responses:
 *       201:
 *         description: Time inscrito com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time inscrito com sucesso
 *       400:
 *         description: Partida sem vagas ou time já inscrito
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Partida ou time não encontrado
 */
router.post('/:id/teams', authenticateToken, joinMatchByTeam);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams:
 *   get:
 *     summary: Listar times inscritos na partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     responses:
 *       200:
 *         description: Lista de times inscritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   matchId:
 *                     type: integer
 *                   teamId:
 *                     type: integer
 *                   team:
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/teams', authenticateToken, getMatchTeams);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams/{teamId}:
 *   delete:
 *     summary: Remover time da partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *     responses:
 *       200:
 *         description: Time removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para remover este time
 *       404:
 *         description: Time não encontrado na partida
 */
router.delete('/:id/teams/:teamId', authenticateToken, deleteTeamMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams/available:
 *   get:
 *     summary: Listar times disponíveis para inscrição
 *     tags: [Partidas Amistosas]
 *     description: Retorna times do usuário que podem ser inscritos na partida
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     responses:
 *       200:
 *         description: Lista de times disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/teams/available', authenticateToken, getTeamsAvailable);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams/compliance:
 *   get:
 *     summary: Verificar conformidade dos times com as regras da partida
 *     tags: [Partidas Amistosas]
 *     description: Valida se os times inscritos atendem aos requisitos (gênero, idade, número de jogadores)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     responses:
 *       200:
 *         description: Times em conformidade com as regras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 compliant:
 *                   type: boolean
 *                   example: true
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Um ou mais times não atendem às regras
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/teams/compliance', authenticateToken, checkTeamsRuleCompliance);

router.get('/:id/players', authenticateToken, getMatchPlayersForAdmin);
router.get('/:id/roster', authenticateToken, getMatchRosterPlayers);

/**
 * @swagger
 * /api/friendly-matches/{id}/finalize:
 *   post:
 *     summary: Finalizar partida
 *     tags: [Partidas Amistosas]
 *     description: Marca a partida como finalizada e registra o resultado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamHomeId:
 *                 type: integer
 *                 example: 1
 *               teamAwayId:
 *                 type: integer
 *                 example: 2
 *               goalsHome:
 *                 type: integer
 *                 example: 3
 *               goalsAway:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Partida finalizada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para finalizar
 *       404:
 *         description: Partida não encontrada
 */
router.post('/:id/finalize', authenticateToken, finalizeMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}/events:
 *   get:
 *     summary: Listar eventos da partida (gols e cartões)
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 goals:
 *                   type: array
 *                   items:
 *                     type: object
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/events', authenticateToken, listEvents);

/**
 * @swagger
 * /api/friendly-matches/{id}/events/goals:
 *   post:
 *     summary: Adicionar gol à partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - teamId
 *             properties:
 *               playerId:
 *                 type: integer
 *                 example: 1
 *               teamId:
 *                 type: integer
 *                 example: 1
 *               minute:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       201:
 *         description: Gol registrado com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/:id/events/goals', authenticateToken, addGoal);

/**
 * @swagger
 * /api/friendly-matches/{id}/events/goals/{eventId}:
 *   delete:
 *     summary: Remover gol específico
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gol removido
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id/events/goals/:eventId', authenticateToken, deleteGoalEvent);

/**
 * @swagger
 * /api/friendly-matches/{id}/events/goals:
 *   delete:
 *     summary: Limpar todos os gols da partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Todos os gols foram removidos
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id/events/goals', authenticateToken, clearGoals);

/**
 * @swagger
 * /api/friendly-matches/{id}/events/cards:
 *   post:
 *     summary: Adicionar cartão à partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - cardType
 *             properties:
 *               playerId:
 *                 type: integer
 *                 example: 1
 *               cardType:
 *                 type: string
 *                 enum: [yellow, red]
 *                 example: yellow
 *               minute:
 *                 type: integer
 *                 example: 42
 *               reason:
 *                 type: string
 *                 example: Falta violenta
 *     responses:
 *       201:
 *         description: Cartão registrado com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/:id/events/cards', authenticateToken, addCard);

/**
 * @swagger
 * /api/friendly-matches/{id}/events/cards/{eventId}:
 *   delete:
 *     summary: Remover cartão específico
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cartão removido
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id/events/cards/:eventId', authenticateToken, deleteCardEvent);

/**
 * @swagger
 * /api/friendly-matches/{id}/events/cards:
 *   delete:
 *     summary: Limpar todos os cartões da partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Todos os cartões foram removidos
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id/events/cards', authenticateToken, clearCards);

/**
 * @swagger
 * /api/friendly-matches/{id}/evaluations:
 *   get:
 *     summary: Listar avaliações da partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de avaliações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evaluation'
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/evaluations', authenticateToken, listMatchEvaluations);

/**
 * @swagger
 * /api/friendly-matches/{id}/evaluations:
 *   post:
 *     summary: Criar ou atualizar avaliação da partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Ótima organização!
 *     responses:
 *       200:
 *         description: Avaliação registrada
 *       401:
 *         description: Não autenticado
 */
router.post('/:id/evaluations', authenticateToken, upsertMatchEvaluation);

/**
 * @swagger
 * /api/friendly-matches/{id}/evaluations/summary:
 *   get:
 *     summary: Obter resumo das avaliações
 *     tags: [Partidas Amistosas]
 *     description: Retorna média de avaliações e total
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resumo das avaliações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                   example: 4.2
 *                 totalEvaluations:
 *                   type: integer
 *                   example: 15
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/evaluations/summary', authenticateToken, getMatchEvaluationSummary);

/**
 * @swagger
 * /api/friendly-matches/{id}/penalty:
 *   get:
 *     summary: Buscar punições da partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de punições
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/penalty', authenticateToken, buscarPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/friendly-matches/{id}/penalty:
 *   post:
 *     summary: Inserir punição na partida
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idTeam
 *               - points
 *             properties:
 *               idTeam:
 *                 type: integer
 *                 example: 1
 *               points:
 *                 type: integer
 *                 example: -3
 *               reason:
 *                 type: string
 *                 example: WO - Não comparecimento
 *     responses:
 *       201:
 *         description: Punição criada
 *       401:
 *         description: Não autenticado
 */
router.post('/:id/penalty', authenticateToken, inserirPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/friendly-matches/{id}/penalty:
 *   put:
 *     summary: Atualizar punição
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Punição atualizada
 *       401:
 *         description: Não autenticado
 */
router.put('/:id/penalty', authenticateToken, alterarPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/friendly-matches/{id}/penalty:
 *   delete:
 *     summary: Deletar punição
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Punição deletada
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id/penalty', authenticateToken, deletarPunicaoPartidaAmistosa);

export default router;
