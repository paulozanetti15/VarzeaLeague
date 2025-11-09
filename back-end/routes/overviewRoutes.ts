import { Router } from 'express';
import { getOverview, searchOverviewEntities } from '../controllers/overviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Overview
 *   description: Dashboard e estatísticas gerais do sistema
 */

/**
 * @swagger
 * /api/overview:
 *   get:
 *     summary: Obter estatísticas gerais do dashboard
 *     description: Retorna KPIs e estatísticas agregadas do sistema incluindo partidas amistosas, campeonatos, times, jogadores e inscrições
 *     tags: [Overview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: ['7d', '30d', '90d', 'all']
 *           default: '30d'
 *         description: Período para filtrar dados (7 dias, 30 dias, 90 dias ou todos)
 *         example: '30d'
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial customizada (sobrescreve period se fornecido com endDate)
 *         example: '2025-01-01'
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final customizada (deve ser usado com startDate)
 *         example: '2025-01-31'
 *       - in: query
 *         name: matchId
 *         schema:
 *           type: integer
 *         description: Filtrar dados por ID de partida específica
 *         example: 1
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filtrar dados por ID de time específico
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas gerais retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kpis:
 *                   type: object
 *                   properties:
 *                     amistososPeriodo:
 *                       type: integer
 *                       description: Total de partidas amistosas no período
 *                       example: 45
 *                     campeonatosPeriodo:
 *                       type: integer
 *                       description: Total de campeonatos criados no período
 *                       example: 3
 *                     inscricoesAmistososPeriodo:
 *                       type: integer
 *                       description: Total de inscrições de times em partidas amistosas
 *                       example: 90
 *                     inscricoesCampeonatosPeriodo:
 *                       type: integer
 *                       description: Total de inscrições de times em campeonatos
 *                       example: 12
 *                     cancelledMatches:
 *                       type: integer
 *                       description: Partidas canceladas no período
 *                       example: 2
 *                     completedMatches:
 *                       type: integer
 *                       description: Partidas finalizadas no período
 *                       example: 40
 *                     championshipsInProgress:
 *                       type: integer
 *                       description: Campeonatos em andamento ou com inscrições abertas
 *                       example: 2
 *                     newUsers:
 *                       type: integer
 *                       description: Novos usuários cadastrados no período
 *                       example: 15
 *                     totalUsers:
 *                       type: integer
 *                       description: Total de usuários cadastrados no sistema
 *                       example: 150
 *                     totalTeams:
 *                       type: integer
 *                       description: Total de times cadastrados
 *                       example: 50
 *                     totalPlayers:
 *                       type: integer
 *                       description: Total de jogadores cadastrados
 *                       example: 500
 *                 matchesByMonth:
 *                   type: array
 *                   description: Distribuição de partidas amistosas por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 20
 *                 applicationsByMonth:
 *                   type: array
 *                   description: Inscrições em campeonatos por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 5
 *                 teamsByMonth:
 *                   type: array
 *                   description: Times criados por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 8
 *                 championshipsByMonth:
 *                   type: array
 *                   description: Campeonatos criados por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 1
 *                 matchRegistrationsByMonth:
 *                   type: array
 *                   description: Inscrições de times em partidas amistosas por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 40
 *                 statusBreakdown:
 *                   type: array
 *                   description: Distribuição de partidas amistosas por status
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: "finalizada"
 *                       count:
 *                         type: integer
 *                         example: 40
 *                 championshipStatusBreakdown:
 *                   type: array
 *                   description: Distribuição de campeonatos por status
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: "em_andamento"
 *                       count:
 *                         type: integer
 *                         example: 2
 *             examples:
 *               dashboardCompleto:
 *                 value:
 *                   kpis:
 *                     amistososPeriodo: 45
 *                     campeonatosPeriodo: 3
 *                     inscricoesAmistososPeriodo: 90
 *                     inscricoesCampeonatosPeriodo: 12
 *                     cancelledMatches: 2
 *                     completedMatches: 40
 *                     championshipsInProgress: 2
 *                     newUsers: 15
 *                     totalUsers: 150
 *                     totalTeams: 50
 *                     totalPlayers: 500
 *                   matchesByMonth:
 *                     - month: "2025-01"
 *                       count: 20
 *                     - month: "2025-02"
 *                       count: 25
 *                   applicationsByMonth:
 *                     - month: "2025-01"
 *                       count: 5
 *                     - month: "2025-02"
 *                       count: 7
 *                   teamsByMonth:
 *                     - month: "2025-01"
 *                       count: 8
 *                     - month: "2025-02"
 *                       count: 5
 *                   championshipsByMonth:
 *                     - month: "2025-01"
 *                       count: 1
 *                     - month: "2025-02"
 *                       count: 2
 *                   matchRegistrationsByMonth:
 *                     - month: "2025-01"
 *                       count: 40
 *                     - month: "2025-02"
 *                       count: 50
 *                   statusBreakdown:
 *                     - status: "finalizada"
 *                       count: 40
 *                     - status: "aberta"
 *                       count: 3
 *                     - status: "cancelada"
 *                       count: 2
 *                   championshipStatusBreakdown:
 *                     - status: "em_andamento"
 *                       count: 2
 *                     - status: "inscricoes_abertas"
 *                       count: 1
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não autenticado
 *       500:
 *         description: Erro interno ao buscar estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao obter overview
 */
router.get('/', authenticateToken, getOverview);

/**
 * @swagger
 * /api/overview/search:
 *   get:
 *     summary: Buscar entidades no sistema (times, jogadores, partidas)
 *     description: Realiza busca global por times, jogadores e partidas amistosas com base em um termo de pesquisa
 *     tags: [Overview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Termo de busca (mínimo 1 caractere)
 *         example: carlos
 *     responses:
 *       200:
 *         description: Resultados da busca retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [match, team, player]
 *                     description: Tipo da entidade encontrada
 *                     example: team
 *                   id:
 *                     type: integer
 *                     description: ID da entidade
 *                     example: 1
 *                   label:
 *                     type: string
 *                     description: Nome/título da entidade
 *                     example: "FC Carlos"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Data da partida (apenas para type=match)
 *                     example: "2025-02-15T15:00:00.000Z"
 *                   position:
 *                     type: string
 *                     description: Posição do jogador (apenas para type=player)
 *                     example: "Atacante"
 *             examples:
 *               buscaTodos:
 *                 summary: Busca por "carlos" retorna times, jogadores e partidas
 *                 value:
 *                   - type: match
 *                     id: 10
 *                     label: "Rachão Carlos Gomes"
 *                     date: "2025-02-15T15:00:00.000Z"
 *                   - type: team
 *                     id: 1
 *                     label: "FC Carlos"
 *                   - type: player
 *                     id: 5
 *                     label: "Carlos Silva"
 *                     position: "Atacante"
 *               buscaVazia:
 *                 summary: Termo não encontrado retorna array vazio
 *                 value: []
 *       400:
 *         description: Termo de busca não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               example: []
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token inválido ou ausente
 *       500:
 *         description: Erro interno ao realizar busca
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro na busca
 */
router.get('/search', authenticateToken, searchOverviewEntities);

export default router;
