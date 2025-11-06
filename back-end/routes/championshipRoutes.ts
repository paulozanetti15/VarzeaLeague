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
 *                 example: Campeonato Várzea 2025
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
 *                 enum: [Liga, Mata-Mata]
 *                 example: Mata-Mata
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
 *                   example: Campeonato Várzea 2025
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campoObrigatorio:
 *                 value:
 *                   message: Nome do campeonato é obrigatório
 *               dataInvalida:
 *                 value:
 *                   message: Data de início não pode ser no passado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflito - Campeonato com este nome já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nomeDuplicado:
 *                 value:
 *                   message: Já existe um campeonato com este nome
 *               tipoInvalido:
 *                 value:
 *                   message: Tipo de campeonato inválido. Use Liga, Mata-Mata
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
 *         name: championshipDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de início (a partir de)
 *         example: 2025-01-01
 *       - in: query
 *         name: championshipDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de início (até)
 *         example: 2025-12-31
 *       - in: query
 *         name: searchChampionships
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *         example: Campeonato
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Liga, Mata-Mata]
 *         description: Filtrar por tipo do campeonato
 *         example: Liga
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [Masculino, Feminino, Misto]
 *         description: Filtrar por gênero
 *         example: Masculino
 *       - in: query
 *         name: modalidade
 *         schema:
 *           type: string
 *           enum: [Futebol de Campo, Futebol Society, Futsal]
 *         description: Filtrar por modalidade
 *         example: Futebol Society
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, open, closed, in_progress, finished]
 *         description: Filtrar por status do campeonato
 *         example: open
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date_asc, date_desc]
 *         description: Ordenação por data
 *         example: date_desc
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
 *                     example: Campeonato Várzea 2025
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
 *                   example: Campeonato Várzea 2025
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
 *                 example: Campeonato Várzea 2025 Atualizado
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
 *               modalidade:
 *                 type: string
 *                 enum: [Futebol de Campo, Futebol Society, Futsal]
 *                 example: Futebol Society
 *               nomequadra:
 *                 type: string
 *                 example: Arena Sports Center
 *               tipo:
 *                 type: string
 *                 enum: [Liga, Mata-Mata]
 *                 example: Mata-Mata
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
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campoVazio:
 *                 value:
 *                   message: Nome do campeonato é obrigatório
 *               dataPassado:
 *                 value:
 *                   message: Data de início não pode ser no passado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão para editar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o criador pode editar este campeonato
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflito - Nome de campeonato já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Já existe outro campeonato com este nome
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
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campoObrigatorio:
 *                 value:
 *                   message: teamId é obrigatório
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
 *       409:
 *         description: Time já está inscrito neste campeonato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               jaInscrito:
 *                 value:
 *                   message: O time já está inscrito neste campeonato
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
 *         description: Campeonato não aceita candidaturas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campeonatoFechado:
 *                 value:
 *                   message: Este campeonato não está aceitando aplicações no momento
 *               campoObrigatorio:
 *                 value:
 *                   message: ID do time é obrigatório
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
 *       409:
 *         description: Time já aplicou para este campeonato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               jaAplicou:
 *                 value:
 *                   message: Este time já aplicou para este campeonato
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
 *                 enum: [approved, rejected]
 *                 example: approved
 *               rejection_reason:
 *                 type: string
 *                 description: Motivo da rejeição (obrigatório quando status é rejected)
 *                 example: Time não atende aos requisitos do campeonato
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
 *             examples:
 *               statusInvalido:
 *                 value:
 *                   message: Status deve ser "approved" ou "rejected"
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão (apenas criador do campeonato)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidatura ou campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Candidatura já está no status desejado ou não pode ser alterada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               jaNoStatus:
 *                 value:
 *                   message: Esta candidatura já está com o status "approved"
 *                   currentStatus: approved
 *               naoPermiteAlterar:
 *                 value:
 *                   message: Não é possível alterar candidatura com status "approved"
 *                   currentStatus: approved
 *                   hint: Apenas candidaturas pendentes podem ser aprovadas ou rejeitadas
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/applications/:applicationId/status', authenticateToken, updateApplicationStatus);


export default router;
