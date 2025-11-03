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
 * /api/teams/{id}:
 *   get:
 *     summary: Buscar detalhes de um time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/:id', authenticateToken, TeamController.getTeam);

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
 *               estado:
 *                 type: string
 *                 example: SP
 *               cidade:
 *                 type: string
 *                 example: São Paulo
 *               cep:
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
 *       400:
 *         description: Nome do time já está em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Este nome de time já está em uso. Escolha outro nome.
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
 *               message: Erro ao criar time
 */
router.post('/', authenticateToken, upload.single('banner'), TeamController.createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Atualizar dados do time (apenas capitão)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               primaryColor:
 *                 type: string
 *               secondaryColor:
 *                 type: string
 *               estado:
 *                 type: string
 *               cidade:
 *                 type: string
 *               cep:
 *                 type: string
 *               jogadores:
 *                 type: string
 *                 description: 'Array JSON de jogadores com seus IDs'
 *                 example: '[{"id": 1}, {"id": 2}]'
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Time atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar time
 */
router.put('/:id', authenticateToken, upload.single('banner'), TeamController.updateTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Deletar time (soft delete, apenas capitão)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
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
router.delete('/:id', authenticateToken, TeamController.deleteTeam);

/**
 * @swagger
 * /api/teams/{teamId}/players/{playerId}:
 *   delete:
 *     summary: Remover jogador do time (apenas capitão)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogador removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador removido com sucesso
 *       403:
 *         description: Apenas o capitão pode remover jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode remover jogadores
 *       404:
 *         description: Time ou jogador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time ou jogador não encontrado
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
 *               message: Erro ao remover jogador
 */
router.delete('/:teamId/players/:playerId', authenticateToken, TeamController.removePlayerFromTeam);

/**
 * @swagger
 * /api/teams/{id}/teamCaptain:
 *   get:
 *     summary: Buscar dados do capitão do time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
router.get('/:id/teamCaptain', authenticateToken, TeamController.getTeamCaptain);

/**
 * @swagger
 * /api/teams/{id}/championship-ranking:
 *   get:
 *     summary: Buscar ranking do time em campeonatos
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar ranking do time
 */
router.get('/:id/championship-ranking', authenticateToken, TeamController.getTeamRanking);

/**
 * @swagger
 * /api/teams/{id}/player-stats:
 *   get:
 *     summary: Buscar estatísticas dos jogadores do time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar estatísticas dos jogadores
 */
router.get('/:id/player-stats', authenticateToken, TeamController.getPlayerStats);

/**
 * @swagger
 * /api/teams/{id}/history/friendly-matches:
 *   get:
 *     summary: Listar histórico de partidas amistosas de um time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/:id/history/friendly-matches', authenticateToken, getAllFriendlyMatchesHistory);

/**
 * @swagger
 * /api/teams/{id}/history/championship-matches:
 *   get:
 *     summary: Listar histórico de partidas de campeonatos de um time
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/:id/history/championship-matches', authenticateToken, getAllChampionshipMatchesHistory);

/**
 * @swagger
 * /api/teams/{id}/history/championships/{championshipId}/matches:
 *   get:
 *     summary: Listar partidas de um time em um campeonato específico
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/:id/history/championships/:championshipId/matches', authenticateToken, getMatchesByChampionshipHistory);

export default router;