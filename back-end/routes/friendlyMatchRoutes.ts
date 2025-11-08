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
  createMatchEvaluation,
  updateMatchEvaluation,
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
 *               duration:
 *                 type: string
 *                 example: "120"
 *               price:
 *                 type: number
 *                 example: 40.00
 *               matchType:
 *                 type: string
 *                 enum: [Futebol de Campo, Futebol Society, Futsal]
 *                 example: Futebol de Campo
 *               square:
 *                 type: string
 *                 example: Arena Sports Center
 *     responses:
 *       200:
 *         description: Partida atualizada com sucesso
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
 *               hint: Escolha um nome diferente para atualizar a partida
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
 *     summary: Inscrever time na partida amistosa
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     description: Inscreve um time na partida. Apenas o capitão do time ou administrador podem realizar esta ação.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 42
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
 *                 example: 15
 *                 description: ID do time a ser inscrito na partida
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
 *             example:
 *               message: Time inscrito na partida com sucesso
 *       400:
 *         description: Dados inválidos ou partida sem vagas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               semVagas:
 *                 summary: Partida completa
 *                 value:
 *                   message: Partida já está completa
 *               partidaCancelada:
 *                 summary: Partida cancelada
 *                 value:
 *                   message: Esta partida foi cancelada e não aceita mais inscrições
 *               prazoEncerrado:
 *                 summary: Prazo encerrado
 *                 value:
 *                   message: O prazo de inscrição para esta partida já encerrou
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               semPermissao:
 *                 summary: Não é capitão
 *                 value:
 *                   message: Apenas o criador do time pode inscrever este time na partida
 *               naoQualifica:
 *                 summary: Time não se qualifica
 *                 value:
 *                   message: Time não se qualifica nas regras de gênero da partida
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               partidaNaoEncontrada:
 *                 summary: Partida não encontrada
 *                 value:
 *                   message: Partida não encontrada
 *               timeNaoEncontrado:
 *                 summary: Time não encontrado
 *                 value:
 *                   message: Time não encontrado ou foi removido
 *       409:
 *         description: Conflito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               timeJaInscrito:
 *                 summary: Time já inscrito
 *                 value:
 *                   message: Time já está inscrito nesta partida
 *               conflitoHorario:
 *                 summary: Conflito de horário
 *                 value:
 *                   message: Time já possui outra partida agendada neste horário
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao inscrever time na partida
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
 *     description: Retorna a lista de todos os times que estão inscritos na partida amistosa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
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
 *                   name:
 *                     type: string
 *                     example: Time Exemplo FC
 *                   captainId:
 *                     type: integer
 *                     example: 5
 *                   banner:
 *                     type: string
 *                     example: banner.jpg
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token de autenticação inválido ou expirado
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             example:
 *               message: Erro ao obter times da partida
 *               error: Detalhes do erro
 */
router.get('/:id/teams', authenticateToken, getMatchTeams);

/**
 * @swagger
 * /api/friendly-matches/{id}/teams/{teamId}:
 *   delete:
 *     summary: Remover time da partida amistosa
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     description: Remove um time inscrito da partida. Apenas o capitão do time, organizador da partida ou administrador podem realizar esta ação.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 42
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time a ser removido
 *         example: 15
 *     responses:
 *       200:
 *         description: Time removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time removido da partida com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token de autenticação inválido ou expirado
 *       403:
 *         description: Sem permissão para remover este time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Apenas o capitão do time, organizador da partida ou administrador podem remover o time
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               partidaNaoEncontrada:
 *                 summary: Partida não encontrada
 *                 value:
 *                   message: Partida não encontrada
 *               timeNaoEncontrado:
 *                 summary: Time não encontrado
 *                 value:
 *                   message: Time não encontrado
 *               timeNaoInscrito:
 *                 summary: Time não está inscrito na partida
 *                 value:
 *                   message: Time não está inscrito nesta partida
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             example:
 *               message: Erro ao remover time da partida
 *               error: Detalhes do erro
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
 *     description: Retorna times que ainda não estão inscritos na partida e podem ser inscritos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 42
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token de autenticação inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             example:
 *               message: Erro ao obter times disponíveis
 *               error: Detalhes do erro
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
 *     description: Valida se os times inscritos atendem aos requisitos de gênero e categoria. Remove automaticamente times que não estão em conformidade.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 42
 *     responses:
 *       200:
 *         description: Todos os times estão em conformidade com as regras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Todos os times estão em conformidade com as regras
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token de autenticação inválido ou expirado
 *       403:
 *         description: Um ou mais times não atendem às regras e foram removidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Time Exemplo FC não se qualifica nas regras da partida
 *       404:
 *         description: Regras da partida não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Regras da partida não encontradas
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             example:
 *               message: Erro ao verificar conformidade das regras
 *               error: Detalhes do erro
 */
router.get('/:id/teams/compliance', authenticateToken, checkTeamsRuleCompliance);

router.get('/:id/players', authenticateToken, getMatchPlayersForAdmin);
/**
 * @swagger
 * /api/friendly-matches/{id}/finalize:
 *   put:
 *     summary: Finalizar partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     description: Marca a partida como finalizada. Apenas o organizador da partida ou administrador podem finalizar.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 42
 *     responses:
 *       200:
 *         description: Partida finalizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 match:
 *                   $ref: '#/components/schemas/FriendlyMatch'
 *             example:
 *               message: Partida finalizada com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão para finalizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para finalizar esta partida
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       409:
 *         description: Partida já foi finalizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Esta partida já foi finalizada
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao finalizar partida
 */
router.put('/:id/finalize', authenticateToken, finalizeMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}/evaluations:
 *   get:
 *     summary: Listar avaliações da partida
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
 *         description: Lista de avaliações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evaluation'
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
router.get('/:id/evaluations', authenticateToken, listMatchEvaluations);

/**
 * @swagger
 * /api/friendly-matches/{id}/evaluations:
 *   post:
 *     summary: Criar avaliação da partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     description: Cria uma nova avaliação para a partida. Apenas participantes podem avaliar.
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *                 description: Nota de 1 a 5
 *               comment:
 *                 type: string
 *                 example: Ótima organização!
 *                 description: Comentário opcional sobre a partida
 *     responses:
 *       201:
 *         description: Avaliação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluation'
 *       400:
 *         description: Rating inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Rating deve ser 1-5
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Usuário não é participante da partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas participantes podem avaliar
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Usuário já avaliou esta partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você já avaliou esta partida
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/evaluations', authenticateToken, createMatchEvaluation);

/**
 * @swagger
 * /api/friendly-matches/{id}/evaluations:
 *   put:
 *     summary: Atualizar avaliação da partida
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     description: Atualiza a avaliação existente do usuário para a partida
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Nova nota de 1 a 5
 *               comment:
 *                 type: string
 *                 example: Avaliação atualizada - excelente!
 *                 description: Novo comentário opcional
 *     responses:
 *       200:
 *         description: Avaliação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Evaluation'
 *       400:
 *         description: Rating inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Rating deve ser 1-5
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partida ou avaliação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 summary: Partida não encontrada
 *                 value:
 *                   message: Partida não encontrada
 *               avaliacaoNaoEncontrada:
 *                 summary: Avaliação não encontrada
 *                 value:
 *                   message: Avaliação não encontrada
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/evaluations', authenticateToken, updateMatchEvaluation);

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
