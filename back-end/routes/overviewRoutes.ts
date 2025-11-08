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
 *     description: Retorna KPIs e estatísticas agregadas do sistema incluindo total de partidas, times, jogadores, gols e cartões
 *     tags: [Overview]
 *     security:
 *       - bearerAuth: []
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
 *                     totalMatches:
 *                       type: integer
 *                       description: Total de partidas no sistema
 *                       example: 150
 *                     upcomingMatches:
 *                       type: integer
 *                       description: Partidas agendadas futuras
 *                       example: 10
 *                     pastMatches:
 *                       type: integer
 *                       description: Partidas já realizadas
 *                       example: 140
 *                     totalTeams:
 *                       type: integer
 *                       description: Total de times cadastrados
 *                       example: 50
 *                     totalPlayers:
 *                       type: integer
 *                       description: Total de jogadores cadastrados
 *                       example: 500
 *                     totalGoals:
 *                       type: integer
 *                       description: Total de gols marcados
 *                       example: 450
 *                     totalCards:
 *                       type: integer
 *                       description: Total de cartões aplicados
 *                       example: 75
 *                 matchesByMonth:
 *                   type: array
 *                   description: Distribuição de partidas por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 20
 *                 goalsByMonth:
 *                   type: array
 *                   description: Distribuição de gols por mês
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       count:
 *                         type: integer
 *                         example: 60
 *                 cardsByMonth:
 *                   type: array
 *                   description: Distribuição de cartões por mês e tipo
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       yellow:
 *                         type: integer
 *                         example: 15
 *                       red:
 *                         type: integer
 *                         example: 2
 *             examples:
 *               dashboardCompleto:
 *                 value:
 *                   kpis:
 *                     totalMatches: 150
 *                     upcomingMatches: 10
 *                     pastMatches: 140
 *                     totalTeams: 50
 *                     totalPlayers: 500
 *                     totalGoals: 450
 *                     totalCards: 75
 *                   matchesByMonth:
 *                     - month: "2025-01"
 *                       count: 20
 *                     - month: "2025-02"
 *                       count: 25
 *                   goalsByMonth:
 *                     - month: "2025-01"
 *                       count: 60
 *                     - month: "2025-02"
 *                       count: 75
 *                   cardsByMonth:
 *                     - month: "2025-01"
 *                       yellow: 15
 *                       red: 2
 *                     - month: "2025-02"
 *                       yellow: 20
 *                       red: 3
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
 *               message: Erro ao buscar estatísticas gerais
 */
router.get('/', authenticateToken, getOverview);

/**
 * @swagger
 * /api/overview/search:
 *   get:
 *     summary: Buscar entidades no sistema (times, jogadores, partidas)
 *     description: Realiza busca global por times, jogadores e partidas com base em um termo de pesquisa. Suporta filtro por tipo de entidade.
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
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [teams, players, matches, all]
 *         description: Tipo de entidade a buscar (padrão "all")
 *         example: players
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de resultados por tipo
 *         example: 10
 *     responses:
 *       200:
 *         description: Resultados da busca retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   description: Times encontrados
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "FC Carlos"
 *                       cidade:
 *                         type: string
 *                         example: "Curitiba"
 *                       estado:
 *                         type: string
 *                         example: "PR"
 *                 players:
 *                   type: array
 *                   description: Jogadores encontrados
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       nome:
 *                         type: string
 *                         example: "Carlos Silva"
 *                       posicao:
 *                         type: string
 *                         example: "Atacante"
 *                       sexo:
 *                         type: string
 *                         example: "Masculino"
 *                 matches:
 *                   type: array
 *                   description: Partidas encontradas
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       title:
 *                         type: string
 *                         example: "Rachão Carlos Gomes"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-15T15:00:00.000Z"
 *                       status:
 *                         type: string
 *                         example: "aberta"
 *             examples:
 *               buscaTodos:
 *                 summary: Busca por "carlos" em todas as entidades
 *                 value:
 *                   teams:
 *                     - id: 1
 *                       name: "FC Carlos"
 *                       cidade: "Curitiba"
 *                       estado: "PR"
 *                   players:
 *                     - id: 5
 *                       nome: "Carlos Silva"
 *                       posicao: "Atacante"
 *                       sexo: "Masculino"
 *                     - id: 12
 *                       nome: "Carlos Alberto"
 *                       posicao: "Zagueiro"
 *                       sexo: "Masculino"
 *                   matches:
 *                     - id: 10
 *                       title: "Rachão Carlos Gomes"
 *                       date: "2025-02-15T15:00:00.000Z"
 *                       status: "aberta"
 *               buscaJogadores:
 *                 summary: Busca apenas jogadores
 *                 value:
 *                   teams: []
 *                   players:
 *                     - id: 5
 *                       nome: "Carlos Silva"
 *                       posicao: "Atacante"
 *                   matches: []
 *       400:
 *         description: Parâmetros inválidos (falta termo de busca)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Termo de busca é obrigatório
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
 *               message: Erro ao buscar entidades
 */
router.get('/search', authenticateToken, searchOverviewEntities);

export default router;
