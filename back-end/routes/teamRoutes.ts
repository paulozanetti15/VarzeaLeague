import express from 'express';
import TeamController from '../controllers/TeamController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/uploadService';
import {
  getAllFriendlyMatchesHistory,
  getAllChampionshipMatchesHistory,
  getMatchesByChampionshipHistory
} from '../controllers/TeamHistoryController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Times
 *   description: Gerenciamento de times e elencos
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Listar times do usuário autenticado
 *     description: Retorna todos os times onde o usuário é capitão ou membro
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de times
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Team'
 *                   - type: object
 *                     properties:
 *                       isCurrentUserCaptain:
 *                         type: boolean
 *                         example: true
 *                       quantidadePartidas:
 *                         type: integer
 *                         example: 5
 *                       captain:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       users:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                       players:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Player'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao listar times
 */
router.get('/', authenticateToken, TeamController.listTeams);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Buscar detalhes de um time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados do time
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     isCurrentUserCaptain:
 *                       type: boolean
 *                     captain:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     players:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Player'
 *       403:
 *         description: Sem permissão para visualizar este time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para ver este time
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar time
 */
router.get('/:teamId', authenticateToken, TeamController.getTeam);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Criar novo time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Novo Time FC
 *               description:
 *                 type: string
 *                 example: Time de futebol amador
 *               primaryColor:
 *                 type: string
 *                 example: '#0000FF'
 *               secondaryColor:
 *                 type: string
 *                 example: '#FFFF00'
 *               state:
 *                 type: string
 *                 example: SP
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               CEP:
 *                 type: string
 *                 example: 01000-000
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do banner do time
 *     responses:
 *       201:
 *         description: Time criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       409:
 *         description: Nome do time já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Este nome de time já está em uso. Escolha outro nome.
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao criar time
 */
router.post('/', authenticateToken, upload.single('banner'), TeamController.createTeam);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   put:
 *     summary: Atualizar dados do time (apenas capitão)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Time Atualizado
 *               description:
 *                 type: string
 *                 example: Descrição atualizada do time
 *               primaryColor:
 *                 type: string
 *                 example: '#FF0000'
 *               secondaryColor:
 *                 type: string
 *                 example: '#FFFFFF'
 *               state:
 *                 type: string
 *                 example: PR
 *               city:
 *                 type: string
 *                 example: Curitiba
 *               CEP:
 *                 type: string
 *                 example: 80000-000
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Nova imagem do banner do time (opcional)
 *     responses:
 *       200:
 *         description: Time atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *             example:
 *               id: 1
 *               name: Time Atualizado FC
 *               description: Descrição atualizada do time
 *               banner: uploads/teams/banner-1234567890.jpg
 *               primaryColor: '#FF0000'
 *               secondaryColor: '#FFFFFF'
 *               captainId: 1
 *               city: Curitiba
 *               state: PR
 *               CEP: 80000-000
 *               isDeleted: false
 *       403:
 *         description: Apenas o capitão pode atualizar o time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode atualizar o time
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       409:
 *         description: Nome do time já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Este nome de time já está em uso. Escolha outro nome.
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar time
 */
router.put('/:teamId', authenticateToken, upload.single('banner'), TeamController.updateTeam);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   delete:
 *     summary: Deletar time (soft delete, apenas capitão)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirm
 *             properties:
 *               confirm:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Time deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time deletado com sucesso
 *       403:
 *         description: Apenas o capitão pode deletar o time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode deletar o time
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar time
 */
router.delete('/:teamId', authenticateToken, TeamController.deleteTeam);

/**
 * @swagger
 * /api/teams/{idteamCaptain}/teamCaptain:
 *   get:
 *     summary: Buscar dados do capitão do time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idteamCaptain
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do Capitão do time
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados do capitão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar capitão do time
 */
router.get('/:idteamCaptain/teamCaptain', authenticateToken, TeamController.getTeamCaptain);

/**
 * @swagger
 * /api/teams/{championshipId}/championship-ranking:
 *   get:
 *     summary: Buscar ranking de um campeonato
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: championshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Ranking do time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamId:
 *                   type: integer
 *                 championships:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
       500:
         description: Erro interno do servidor
         content:
           application/json:
             schema:
               $ref: '#/components/schemas/Error'
             example:
               message: Erro ao buscar ranking do campeonato
 */
router.get('/:championshipId/championship-ranking', authenticateToken, TeamController.getTeamRanking);

/**
 * @swagger
 * /api/teams/{teamId}/player-stats:
 *   get:
 *     summary: Buscar estatísticas dos jogadores do time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas dos jogadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: integer
 *                   playerName:
 *                     type: string
 *                   goals:
 *                     type: integer
 *                   assists:
 *                     type: integer
 *                   yellowCards:
 *                     type: integer
 *                   redCards:
 *                     type: integer
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro interno do servidor
         content:
           application/json:
             schema:
               $ref: '#/components/schemas/Error'
             example:
               message: Erro ao buscar estatísticas dos jogadores
 */
router.get('/:teamId/player-stats', authenticateToken, TeamController.getPlayerStats);

/**
 * @swagger
 * /api/teams/{teamId}/history/friendly-matches:
 *   get:
 *     summary: Listar histórico de partidas amistosas de um time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de partidas amistosas do time
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
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-03T19:00:00.000Z
 *                   local:
 *                     type: string
 *                     example: Campo Central
 *                   status:
 *                     type: string
 *                     enum: [Agendado, Em Andamento, Finalizado, Cancelado]
 *                     example: Finalizado
 *                   teams:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         teamId:
 *                           type: integer
 *                           example: 1
 *                         teamName:
 *                           type: string
 *                           example: Time dos Campeões
 *                         score:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro interno do servidor ao buscar histórico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar histórico de partidas amistosas
 */
router.get('/:teamId/history/friendly-matches', authenticateToken, getAllFriendlyMatchesHistory);

/**
 * @swagger
 * /api/teams/{teamId}/history/championship-matches:
 *   get:
 *     summary: Listar histórico de partidas de campeonatos de um time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de partidas de campeonatos do time
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
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-03T19:00:00.000Z
 *                   championshipId:
 *                     type: integer
 *                     example: 5
 *                   championshipName:
 *                     type: string
 *                     example: Copa Várzea 2025
 *                   teams:
 *                     type: array
 *                     items:
 *                       type: object
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro interno do servidor ao buscar histórico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar histórico de partidas de campeonatos
 */
router.get('/:teamId/history/championship-matches', authenticateToken, getAllChampionshipMatchesHistory);

/**
 * @swagger
 * /api/teams/{teamId}/history/championships/{championshipId}/matches:
 *   get:
 *     summary: Listar partidas de um time em um campeonato específico
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *       - in: path
 *         name: championshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de partidas do time no campeonato
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   homeTeam:
 *                     type: object
 *                   awayTeam:
 *                     type: object
 *                   score:
 *                     type: object
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       404:
 *         description: Time ou campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               timeNaoEncontrado:
 *                 value:
 *                   message: Time não encontrado
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor ao buscar partidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar partidas do campeonato
 */
router.get('/:teamId/history/championships/:championshipId/matches', authenticateToken, getMatchesByChampionshipHistory);

export default router;