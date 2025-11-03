import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createChampionship, 
  listChampionships, 
  getChampionship, 
  updateChampionship, 
  deleteChampionship, 
  joinTeamInChampionship, 
  getChampionshipTeams, 
  leaveTeamFromChampionship,
  applyToChampionship,
  getChampionshipApplications,
  updateApplicationStatus,
  publishChampionship
} from '../controllers/championshipController';
import {
  inserirPunicaoCampeonato,
  buscarPunicaoCampeonato,
  alterarPunicaoCampeonato,
  deletarPunicaoCampeonato
} from '../controllers/ChampionshipPunishmentController';
import {
  buscarSumulaPartidaCampeonato,
  atualizarSumulaPartidaCampeonato,
  deletarSumulaPartidaCampeonato
} from '../controllers/TeamHistoryController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Campeonatos
 *   description: Endpoints para gerenciamento de campeonatos
 */

/**
 * @swagger
 * /api/championships:
 *   post:
 *     summary: Criar um novo campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_date
 *               - end_date
 *               - modalidade
 *               - nomequadra
 *               - tipo
 *               - genero
 *             properties:
 *               name:
 *                 type: string
 *                 example: Copa Várzea 2025
 *               description:
 *                 type: string
 *                 example: Campeonato de futebol society
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-15
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-03-15
 *               modalidade:
 *                 type: string
 *                 enum: [Futebol de Campo, Futebol Society, Futsal]
 *                 example: Futebol Society
 *               nomequadra:
 *                 type: string
 *                 example: Arena Sports Center
 *               tipo:
 *                 type: string
 *                 enum: [Liga, Copa, Mata-Mata]
 *                 example: Copa
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Misto]
 *                 example: Masculino
 *               fase_grupos:
 *                 type: boolean
 *                 example: true
 *               max_teams:
 *                 type: integer
 *                 example: 16
 *               num_grupos:
 *                 type: integer
 *                 example: 4
 *               times_por_grupo:
 *                 type: integer
 *                 example: 4
 *               num_equipes_liga:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Campeonato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Copa Várzea 2025
 *       400:
 *         description: Dados inválidos
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, createChampionship);

/**
 * @swagger
 * /api/championships:
 *   get:
 *     summary: Listar todos os campeonatos
 *     tags: [Campeonatos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Rascunho, Publicado, Em Andamento, Finalizado]
 *         description: Filtrar por status do campeonato
 *       - in: query
 *         name: modalidade
 *         schema:
 *           type: string
 *         description: Filtrar por modalidade
 *     responses:
 *       200:
 *         description: Lista de campeonatos
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
 *                     example: Copa Várzea 2025
 *                   description:
 *                     type: string
 *                     example: Campeonato de futebol society
 *                   start_date:
 *                     type: string
 *                     format: date
 *                     example: 2025-01-15
 *                   end_date:
 *                     type: string
 *                     format: date
 *                     example: 2025-03-15
 *                   modalidade:
 *                     type: string
 *                     example: Futebol Society
 *                   status:
 *                     type: string
 *                     example: Publicado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', listChampionships);

/**
 * @swagger
 * /api/championships/{id}:
 *   get:
 *     summary: Buscar detalhes de um campeonato específico
 *     tags: [Campeonatos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalhes do campeonato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Copa Várzea 2025
 *                 description:
 *                   type: string
 *                   example: Campeonato de futebol society
 *                 start_date:
 *                   type: string
 *                   format: date
 *                 end_date:
 *                   type: string
 *                   format: date
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Campeonato não encontrado
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
router.get('/:id', getChampionship);

/**
 * @swagger
 * /api/championships/{id}:
 *   put:
 *     summary: Atualizar um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Copa Várzea 2025 Atualizada
 *               description:
 *                 type: string
 *                 example: Descrição atualizada
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-02-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-04-01
 *               max_teams:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       200:
 *         description: Campeonato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campeonato atualizado com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato não encontrado
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
router.put('/:id', authenticateToken, updateChampionship);

/**
 * @swagger
 * /api/championships/{id}:
 *   delete:
 *     summary: Deletar um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Campeonato deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campeonato deletado com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato não encontrado
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
router.delete('/:id', authenticateToken, deleteChampionship);

/**
 * @swagger
 * /api/championships/{id}/publish:
 *   put:
 *     summary: Publicar um campeonato (mudar status de Rascunho para Publicado)
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Campeonato publicado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campeonato publicado com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato não encontrado
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
router.put('/:id/publish', authenticateToken, publishChampionship);

/**
 * @swagger
 * /api/championships/{id}/teams:
 *   post:
 *     summary: Inscrever um time em um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
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
 *                 description: ID do time a ser inscrito
 *                 example: 5
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
 *                   example: Time inscrito no campeonato com sucesso
 *       400:
 *         description: Erro na inscrição (time já inscrito, campeonato lotado, etc)
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
 *         description: Campeonato ou time não encontrado
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
router.post('/:id/teams', authenticateToken, joinTeamInChampionship);

/**
 * @swagger
 * /api/championships/{id}/teams:
 *   get:
 *     summary: Listar times inscritos em um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
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
 *                     example: 5
 *                   name:
 *                     type: string
 *                     example: Time dos Campeões
 *                   banner:
 *                     type: string
 *                     example: /uploads/teams/banner.jpg
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato não encontrado
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
router.get('/:id/teams', authenticateToken, getChampionshipTeams);

/**
 * @swagger
 * /api/championships/{id}/teams/{teamId}:
 *   delete:
 *     summary: Remover um time de um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 5
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
 *                   example: Time removido do campeonato com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato ou time não encontrado
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
router.delete('/:id/teams/:teamId', authenticateToken, leaveTeamFromChampionship);

/**
 * @swagger
 * /api/championships/{id}/applications:
 *   post:
 *     summary: Enviar candidatura de time para um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
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
 *                 description: ID do time candidato
 *                 example: 5
 *               message:
 *                 type: string
 *                 description: Mensagem de apresentação do time
 *                 example: Nosso time tem experiência em campeonatos e gostaríamos de participar
 *     responses:
 *       201:
 *         description: Candidatura enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Candidatura enviada com sucesso
 *                 application:
 *                   type: object
 *       400:
 *         description: Candidatura já existe ou campeonato não aceita candidaturas
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
 *         description: Campeonato ou time não encontrado
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
router.post('/:id/applications', authenticateToken, applyToChampionship);

/**
 * @swagger
 * /api/championships/{id}/applications:
 *   get:
 *     summary: Listar candidaturas de um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pendente, Aprovado, Rejeitado]
 *         description: Filtrar por status da candidatura
 *     responses:
 *       200:
 *         description: Lista de candidaturas
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
 *                   teamId:
 *                     type: integer
 *                     example: 5
 *                   teamName:
 *                     type: string
 *                     example: Time dos Campeões
 *                   status:
 *                     type: string
 *                     enum: [Pendente, Aprovado, Rejeitado]
 *                     example: Pendente
 *                   message:
 *                     type: string
 *                     example: Mensagem da candidatura
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato não encontrado
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
router.get('/:id/applications', authenticateToken, getChampionshipApplications);

/**
 * @swagger
 * /api/championships/{id}/applications/{applicationId}/status:
 *   put:
 *     summary: Atualizar status de uma candidatura (aprovar ou rejeitar)
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da candidatura
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Aprovado, Rejeitado]
 *                 example: Aprovado
 *     responses:
 *       200:
 *         description: Status da candidatura atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Candidatura aprovada com sucesso
 *       400:
 *         description: Status inválido
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
 *         description: Candidatura não encontrada
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
router.put('/:id/applications/:applicationId/status', authenticateToken, updateApplicationStatus);

/**
 * @swagger
 * /api/championships/{id}/penalty:
 *   get:
 *     summary: Buscar punições de um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de punições do campeonato
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
 *                   championshipId:
 *                     type: integer
 *                     example: 1
 *                   teamId:
 *                     type: integer
 *                     example: 5
 *                   playerId:
 *                     type: integer
 *                     example: 10
 *                   tipo:
 *                     type: string
 *                     enum: [Advertência, Suspensão, Multa, Desclassificação]
 *                     example: Suspensão
 *                   descricao:
 *                     type: string
 *                     example: Suspensão por cartão vermelho
 *                   jogos_suspensos:
 *                     type: integer
 *                     example: 2
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campeonato não encontrado
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
router.get('/:id/penalty', authenticateToken, buscarPunicaoCampeonato);

/**
 * @swagger
 * /api/championships/{id}/penalty:
 *   post:
 *     summary: Adicionar punição em um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - tipo
 *               - descricao
 *             properties:
 *               teamId:
 *                 type: integer
 *                 description: ID do time punido
 *                 example: 5
 *               playerId:
 *                 type: integer
 *                 description: ID do jogador punido (opcional)
 *                 example: 10
 *               tipo:
 *                 type: string
 *                 enum: [Advertência, Suspensão, Multa, Desclassificação]
 *                 example: Suspensão
 *               descricao:
 *                 type: string
 *                 example: Suspensão por acúmulo de cartões amarelos
 *               jogos_suspensos:
 *                 type: integer
 *                 description: Número de jogos de suspensão (para tipo Suspensão)
 *                 example: 1
 *               valor_multa:
 *                 type: number
 *                 description: Valor da multa (para tipo Multa)
 *                 example: 100.00
 *     responses:
 *       201:
 *         description: Punição adicionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Punição adicionada com sucesso
 *                 penalty:
 *                   type: object
 *       400:
 *         description: Dados inválidos
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
 *         description: Campeonato, time ou jogador não encontrado
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
router.post('/:id/penalty', authenticateToken, inserirPunicaoCampeonato);

/**
 * @swagger
 * /api/championships/{id}/penalty:
 *   put:
 *     summary: Atualizar punição de um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - penaltyId
 *             properties:
 *               penaltyId:
 *                 type: integer
 *                 example: 15
 *               tipo:
 *                 type: string
 *                 enum: [Advertência, Suspensão, Multa, Desclassificação]
 *                 example: Advertência
 *               descricao:
 *                 type: string
 *                 example: Punição reduzida a advertência
 *               jogos_suspensos:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Punição atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Punição atualizada com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Punição não encontrada
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
router.put('/:id/penalty', authenticateToken, alterarPunicaoCampeonato);

/**
 * @swagger
 * /api/championships/{id}/penalty:
 *   delete:
 *     summary: Deletar punição de um campeonato
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *       - in: query
 *         name: penaltyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da punição a ser deletada
 *         example: 15
 *     responses:
 *       200:
 *         description: Punição deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Punição deletada com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Punição não encontrada
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
router.delete('/:id/penalty', authenticateToken, deletarPunicaoCampeonato);

/**
 * @swagger
 * /api/championships/matches/{matchId}/report:
 *   get:
 *     summary: Buscar súmula de partida de campeonato
 *     description: Retorna os dados da súmula de uma partida de campeonato específica incluindo jogadores, gols, cartões e avaliações
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
 *         example: 45
 *     responses:
 *       200:
 *         description: Súmula da partida encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamA:
 *                   type: object
 *                   properties:
 *                     teamId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Flamengo FC"
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           playerId:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: "Carlos Silva"
 *                           goals:
 *                             type: integer
 *                             example: 2
 *                           yellowCards:
 *                             type: integer
 *                             example: 0
 *                           redCards:
 *                             type: integer
 *                             example: 0
 *                           rating:
 *                             type: number
 *                             format: float
 *                             example: 8.5
 *                 teamB:
 *                   type: object
 *                   properties:
 *                     teamId:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: "Botafogo United"
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           playerId:
 *                             type: integer
 *                             example: 15
 *                           name:
 *                             type: string
 *                             example: "João Santos"
 *                           goals:
 *                             type: integer
 *                             example: 1
 *                           yellowCards:
 *                             type: integer
 *                             example: 1
 *                           redCards:
 *                             type: integer
 *                             example: 0
 *                           rating:
 *                             type: number
 *                             format: float
 *                             example: 7.0
 *       401:
 *         description: Não autorizado - Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de autenticação não fornecido"
 *       404:
 *         description: Partida não encontrada ou sem súmula cadastrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Súmula da partida #45 não encontrada"
 *       500:
 *         description: Erro interno do servidor ao buscar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Erro ao buscar súmula da partida de campeonato"
 */
router.get('/matches/:matchId/report', authenticateToken, buscarSumulaPartidaCampeonato);

/**
 * @swagger
 * /api/championships/matches/{matchId}/report:
 *   put:
 *     summary: Atualizar súmula de partida de campeonato
 *     description: Atualiza os dados da súmula de uma partida de campeonato incluindo jogadores, gols, cartões e avaliações
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
 *         example: 45
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamA
 *               - teamB
 *             properties:
 *               teamA:
 *                 type: object
 *                 properties:
 *                   players:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         playerId:
 *                           type: integer
 *                           example: 10
 *                         goals:
 *                           type: integer
 *                           example: 2
 *                         yellowCards:
 *                           type: integer
 *                           example: 0
 *                         redCards:
 *                           type: integer
 *                           example: 0
 *                         rating:
 *                           type: number
 *                           format: float
 *                           example: 8.5
 *               teamB:
 *                 type: object
 *                 properties:
 *                   players:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         playerId:
 *                           type: integer
 *                           example: 15
 *                         goals:
 *                           type: integer
 *                           example: 1
 *                         yellowCards:
 *                           type: integer
 *                           example: 1
 *                         redCards:
 *                           type: integer
 *                           example: 0
 *                         rating:
 *                           type: number
 *                           format: float
 *                           example: 7.0
 *     responses:
 *       200:
 *         description: Súmula da partida atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Súmula da partida #45 atualizada com sucesso"
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Dados de jogadores do Time A são obrigatórios"
 *       401:
 *         description: Não autorizado - Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de autenticação não fornecido"
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Partida de campeonato #45 não encontrada"
 *       500:
 *         description: Erro interno do servidor ao atualizar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Erro ao atualizar súmula da partida de campeonato"
 */
router.put('/matches/:matchId/report', authenticateToken, atualizarSumulaPartidaCampeonato);

/**
 * @swagger
 * /api/championships/matches/{matchId}/report:
 *   delete:
 *     summary: Deletar súmula de partida de campeonato
 *     description: Remove completamente os dados da súmula de uma partida de campeonato (jogadores, gols, cartões e avaliações)
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida de campeonato
 *         example: 45
 *     responses:
 *       200:
 *         description: Súmula da partida deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Súmula da partida #45 deletada com sucesso"
 *       401:
 *         description: Não autorizado - Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token de autenticação não fornecido"
 *       404:
 *         description: Partida não encontrada ou sem súmula cadastrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Súmula da partida #45 não encontrada para deletar"
 *       500:
 *         description: Erro interno do servidor ao deletar súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Erro ao deletar súmula da partida de campeonato"
 */
router.delete('/matches/:matchId/report', authenticateToken, deletarSumulaPartidaCampeonato);

export default router;
