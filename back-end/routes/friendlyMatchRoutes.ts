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
  finalizeMatch
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
 *     security:
 *       - bearerAuth: []
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
 *               - matchType
 *               - square
 *             properties:
 *               title:
 *                 type: string
 *                 example: Rachão de Sábado
 *               description:
 *                 type: string
 *                 example: Partida amistosa entre amigos, venha participar!
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-02-15T15:00:00.000Z
 *               location:
 *                 type: string
 *                 example: Campo do Bairro - Rua Principal, 123
 *               duration:
 *                 type: string
 *                 example: "90"
 *               price:
 *                 type: number
 *                 example: 30.00
 *               matchType:
 *                 type: string
 *                 enum: [Futebol de Campo, Futebol Society, Futsal]
 *                 example: Futebol Society
 *               square:
 *                 type: string
 *                 example: Arena Sports Center
 *     responses:
 *       201:
 *         description: Partida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: A data da partida deve ser futura
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Partida duplicada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 hint:
 *                   type: string
 *             example:
 *               message: Já existe uma partida com este nome
 *               hint: Escolha um nome diferente para criar uma nova partida
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, createMatch);

/**
 * @swagger
 * /api/friendly-matches:
 *   get:
 *     summary: Listar partidas amistosas
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberta, sem_vagas, confirmada, em_andamento, finalizada, cancelada]
 *         description: Filtrar por status da partida
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
router.get('/', authenticateToken, listMatches);

/**
 * @swagger
 * /api/friendly-matches/organizer:
 *   get:
 *     summary: Listar partidas criadas pelo usuário autenticado
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/organizer', authenticateToken, getMatchesByOrganizer);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   get:
 *     summary: Buscar partida amistosa por ID
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
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
router.get('/:id',authenticateToken, getMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   put:
 *     summary: Atualizar partida amistosa
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *                 example: Rachão de Domingo Atualizado
 *               description:
 *                 type: string
 *                 example: Descrição atualizada da partida
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-02-16T16:00:00.000Z
 *               location:
 *                 type: string
 *                 example: Novo local - Arena Sports Center
 *               status:
 *                 type: string
 *                 enum: [aberta, sem_vagas, confirmada, em_andamento, finalizada, cancelada]
 *                 example: confirmada
 *               duration:
 *                 type: string
 *                 example: "120"
 *               price:
 *                 type: number
 *                 example: 40.00
 *     responses:
 *       200:
 *         description: Partida atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão para editar esta partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, updateMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   delete:
 *     summary: Deletar partida amistosa
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *     responses:
 *       200:
 *         description: Partida deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Partida deletada com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão para deletar esta partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateToken, deleteMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams:
 *   post:
 *     summary: Inscrever time na partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: integer
 *                 example: 5
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
 *                   example: Time inscrito na partida com sucesso
 *       400:
 *         description: Partida sem vagas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partida ou time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Time já inscrito nesta partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/teams', authenticateToken, joinMatchByTeam);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams:
 *   get:
 *     summary: Listar times inscritos na partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
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
 *                     example: 1
 *                   matchId:
 *                     type: integer
 *                     example: 1
 *                   teamId:
 *                     type: integer
 *                     example: 5
 *                   team:
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/teams', authenticateToken, getMatchTeams);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams/{teamId}:
 *   delete:
 *     summary: Remover time da partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
/**
 * @swagger
 * /api/friendly-matches/{id}/finalize:
 *   post:
 *     summary: Finalizar partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     description: Marca a partida como finalizada e registra o resultado
 *     parameters:idas Amistosas]
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

export default router;
