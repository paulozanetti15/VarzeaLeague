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
  checkAndCancelMatchesWithInsufficientTeams,
  getFilteredMatches
} from '../controllers/FriendlyMatchesController';
import {
  listMatchEvaluations,
  createMatchEvaluation,
  updateMatchEvaluation,
  getMatchEvaluationSummary,
  deleteMatchEvaluation
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
 *     description: Cria partida com status 'aberta'. Valida título único, data futura, duration positivo. Aceita campo time (HH:MM) para definir hora específica da partida. Requer usuário autenticado. CEP é sanitizado (remove não-dígitos), UF normalizado para uppercase.
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
 *                 description: Título da partida (único, será trimmed)
 *                 example: Rachão de Sábado
 *               description:
 *                 type: string
 *                 description: Descrição opcional da partida
 *                 example: Partida amistosa entre amigos, venha participar!
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Data da partida (deve ser futura). Se 'time' for enviado, hora é sobrescrita.
 *                 example: 2025-02-15T15:00:00.000Z
 *               time:
 *                 type: string
 *                 description: Hora da partida no formato HH:MM (opcional, sobrescreve hora do campo date)
 *                 example: "15:30"
 *               location:
 *                 type: string
 *                 description: Endereço/localização da partida
 *                 example: Campo do Bairro - Rua Principal, 123
 *               duration:
 *                 type: string
 *                 description: Duração em minutos (deve ser número positivo, padrão 90)
 *                 example: "90"
 *               price:
 *                 type: number
 *                 description: Preço da partida (padrão 0)
 *                 example: 30.00
 *               matchType:
 *                 type: string
 *                 enum: [Futebol de Campo, Futebol Society, Futsal]
 *                 description: Modalidade da partida
 *                 example: Futebol Society
 *               square:
 *                 type: string
 *                 description: Nome da quadra
 *                 example: Arena Sports Center
 *               Cep:
 *                 type: string
 *                 description: CEP do local (será sanitizado removendo não-dígitos)
 *                 example: "12345-678"
 *               Uf:
 *                 type: string
 *                 description: UF do local (normalizado para uppercase)
 *                 example: SP
 *     responses:
 *       201:
 *         description: Partida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       400:
 *         description: Dados inválidos ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposObrigatorios:
 *                 value:
 *                   message: Campos obrigatórios - título, data, localização, modalidade e nome da quadra
 *               formatoDataInvalido:
 *                 value:
 *                   message: Formato de data inválido
 *               dataPassado:
 *                 value:
 *                   message: A data da partida deve ser futura
 *               duracaoInvalida:
 *                 value:
 *                   message: Duração deve ser um número positivo de minutos
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               naoAutenticado:
 *                 value:
 *                   message: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       409:
 *         description: Título de partida duplicado
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
 *             example:
 *               message: Erro ao criar partida amistosa
 */
router.post('/', authenticateToken, createMatch);

/**
 * @swagger
 * /api/friendly-matches:
 *   get:
 *     summary: Listar partidas amistosas
 *     description: Lista todas as partidas amistosas com organizer, rules e matchTeams incluídos. Atualiza status de todas as partidas antes de listar. Ordena por data ASC. Não aceita filtros (use /search para filtros).
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberta, sem_vagas, confirmada, em_andamento, finalizada, cancelada]
 *         description: Parâmetro ignorado pelo controller (use /search para filtrar)
 *     responses:
 *       200:
 *         description: Array de partidas com campos calculados (countTeams, maxTeams=2, registrationDeadline)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendlyMatch'
 *       500:
 *         description: Erro ao buscar partidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não foi possível carregar as partidas. Tente novamente mais tarde.
 */

/**
 * @swagger
 * /api/friendly-matches/search:
 *   get:
 *     summary: Buscar partidas amistosas (pública)
 *     description: Endpoint público para buscar partidas amistosas com filtros. Não requer autenticação. Atualiza status de todas as partidas antes de buscar. Aceita múltiplos status separados por vírgula. Busca por termo em title/description/location (LIKE). Ordena por data (padrão ASC).
 *     tags: [Partidas Amistosas]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status (separar múltiplos valores por vírgula)
 *         example: aberta,confirmada
 *       - in: query
 *         name: matchDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data da partida >= esta data
 *         example: 2025-01-01
 *       - in: query
 *         name: registrationDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de inscrição (registrationDeadline) >= esta data (força include de rules)
 *         example: 2025-01-01
 *       - in: query
 *         name: searchMatches
 *         schema:
 *           type: string
 *         description: Buscar por termo em título, descrição ou localização (LIKE %termo%)
 *         example: rachão
 *       - in: query
 *         name: myMatches
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Se 'true', filtra por partidas organizadas pelo usuário autenticado (requer auth)
 *         example: 'true'
 *       - in: query
 *         name: friendlyOnly
 *         schema:
 *           type: string
 *         description: Parâmetro legado, não utilizado pelo controller
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date_asc, date_desc]
 *         description: Ordenação por data da partida (padrão date_asc)
 *         example: date_desc
 *     responses:
 *       200:
 *         description: Array de partidas encontradas com organizer, rules, matchTeams incluídos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Partida com campos calculados (countTeams, maxTeams=2, registrationDeadline)
 *       500:
 *         description: Erro ao buscar partidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não foi possível carregar as partidas. Tente novamente mais tarde.
 */
router.get('/search', getFilteredMatches);
router.get('/', listMatches);

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
 *     description: Retorna detalhes da partida com organizer e rules incluídos. Atualiza status antes de buscar (finaliza se passou do horário fim, cancela se passou deadline com <2 times). Calcula countTeams e retorna registrationDeadline.
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
 *         description: Dados da partida com campos calculados (countTeams, maxTeams=2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       500:
 *         description: Erro ao buscar partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não foi possível carregar os detalhes da partida. Tente novamente mais tarde.
 */
router.get('/:id', getMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   put:
 *     summary: Atualizar partida amistosa
 *     description: Atualiza partida existente. Valida unicidade de título (excluindo próprio ID), data futura (se alterada). Após update, verifica status baseado em rules e countTeams (cancela se passou deadline com <2 times, confirma se passou deadline com >=2 times). Aceita campos parciais (apenas enviados são atualizados). Não verifica permissões (TODO - deveria verificar organizerId).
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida a ser atualizada
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos os campos são opcionais. Apenas campos enviados serão atualizados.
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título da partida (validado unicidade excluindo próprio ID)
 *                 example: Rachão de Domingo Atualizado
 *               description:
 *                 type: string
 *                 example: Descrição atualizada da partida
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Nova data (validação - deve ser futura)
 *                 example: 2025-02-16T16:00:00.000Z
 *               time:
 *                 type: string
 *                 description: Nova hora no formato HH:MM
 *                 example: "16:30"
 *               location:
 *                 type: string
 *                 example: Novo local - Arena Sports Center
 *               duration:
 *                 type: string
 *                 description: Duração em minutos
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
 *               Cep:
 *                 type: string
 *                 example: "98765-432"
 *               Uf:
 *                 type: string
 *                 example: RJ
 *     responses:
 *       200:
 *         description: Partida atualizada com sucesso (retorna objeto FriendlyMatch completo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendlyMatch'
 *       400:
 *         description: Data futura inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: A data da partida deve ser futura
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       409:
 *         description: Título duplicado
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
 *             example:
 *               message: Erro ao atualizar partida
 */
router.put('/:id', authenticateToken, updateMatch);

/**
 * @swagger
 * /api/friendly-matches/{id}:
 *   delete:
 *     summary: Deletar partida amistosa
 *     description: Deleta partida e todas as relações (MatchEvaluation, Rules, MatchTeams, Cards, Goals, Penalties, Reports) usando transaction. Valida permissão - apenas organizador ou admin (userTypeId=1) podem deletar.
 *     tags: [Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida a ser deletada
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
 *                   example: Partida excluída com sucesso
 *       403:
 *         description: Sem permissão - apenas organizador ou admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Sem permissão para excluir esta partida
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
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao excluir partida
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
 * /api/friendly-matches/{id}/evaluations:
 *   delete:
 *     summary: Deletar avaliação da partida
 *     tags: [Partidas Amistosas]
 *     description: Remove a avaliação do usuário autenticado para a partida
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
 *         description: Avaliação deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avaliação deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Avaliação não encontrada
 *       500:
 *         description: Erro ao deletar avaliação
 */
router.delete('/:id/evaluations', authenticateToken, deleteMatchEvaluation);

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
