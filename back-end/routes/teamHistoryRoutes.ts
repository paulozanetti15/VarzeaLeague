import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getAllFriendlyMatchesHistory,
  getAllChampionshipMatchesHistory,
  getMatchesByChampionshipHistory
} from '../controllers/TeamHistoryController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Histórico de Times
 *   description: Consultar histórico completo de partidas amistosas e campeonatos dos times
 */

/**
 * @swagger
 * /api/team-history/{teamId}/friendly-matches:
 *   get:
 *     summary: Listar histórico de partidas amistosas do time
 *     description: Retorna todas as partidas amistosas que o time participou com placar, adversários e detalhes da partida
 *     tags: [Histórico de Times]
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
 *         description: Lista de partidas amistosas retornada com sucesso
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
 *                   match_id:
 *                     type: integer
 *                     example: 5
 *                   team_home:
 *                     type: integer
 *                     example: 1
 *                   team_away:
 *                     type: integer
 *                     example: 2
 *                   teamHome_score:
 *                     type: integer
 *                     example: 3
 *                   teamAway_score:
 *                     type: integer
 *                     example: 2
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-15T15:00:00.000Z"
 *                   teamHome:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: "FC Barcelona Várzea"
 *                   teamAway:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: "Real Madrid Amador"
 *                   Match:
 *                     type: object
 *                     properties:
 *                       nomequadra:
 *                         type: string
 *                         example: "Arena Sports"
 *                       location:
 *                         type: string
 *                         example: "Rua das Flores, 123"
 *                       date:
 *                         type: string
 *                         format: date-time
 *             examples:
 *               historicoCheio:
 *                 summary: Time com múltiplas partidas
 *                 value:
 *                   - id: 1
 *                     match_id: 5
 *                     team_home: 1
 *                     team_away: 2
 *                     teamHome_score: 3
 *                     teamAway_score: 2
 *                     date: "2025-01-15T15:00:00.000Z"
 *                     teamHome:
 *                       id: 1
 *                       name: "FC Barcelona Várzea"
 *                     teamAway:
 *                       id: 2
 *                       name: "Real Madrid Amador"
 *                     Match:
 *                       nomequadra: "Arena Sports"
 *                       location: "Rua das Flores, 123"
 *                   - id: 2
 *                     match_id: 8
 *                     team_home: 3
 *                     team_away: 1
 *                     teamHome_score: 1
 *                     teamAway_score: 2
 *                     date: "2025-01-20T17:00:00.000Z"
 *                     teamHome:
 *                       id: 3
 *                       name: "Juventus Várzea"
 *                     teamAway:
 *                       id: 1
 *                       name: "FC Barcelona Várzea"
 *                     Match:
 *                       nomequadra: "Campo Municipal"
 *                       location: "Av. Central, 456"
 *               historicoVazio:
 *                 summary: Time sem partidas amistosas
 *                 value: []
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 summary: Token não fornecido
 *                 value:
 *                   message: Token não fornecido ou inválido
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value:
 *                   message: Token expirado. Faça login novamente
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               timeNaoEncontrado:
 *                 summary: ID de time inexistente
 *                 value:
 *                   message: Time não encontrado
 *               timeDeletado:
 *                 summary: Time foi removido
 *                 value:
 *                   message: Time inativo ou deletado
 *       500:
 *         description: Erro interno ao buscar histórico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroBancoDados:
 *                 summary: Erro de conexão com banco
 *                 value:
 *                   message: Erro de conexão com o banco de dados
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao buscar histórico de partidas amistosas
 */
router.get('/:teamId/friendly-matches', authenticateToken, getAllFriendlyMatchesHistory);

/**
 * @swagger
 * /api/team-history/{teamId}/championship-matches:
 *   get:
 *     summary: Listar histórico de partidas de campeonatos do time
 *     description: Retorna todas as partidas de campeonatos que o time participou incluindo nome do campeonato e placar
 *     tags: [Histórico de Times]
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
 *         description: Lista de partidas de campeonatos retornada com sucesso
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
 *                   match_id:
 *                     type: integer
 *                     example: 10
 *                   team_home:
 *                     type: integer
 *                     example: 1
 *                   team_away:
 *                     type: integer
 *                     example: 4
 *                   teamHome_score:
 *                     type: integer
 *                     example: 2
 *                   teamAway_score:
 *                     type: integer
 *                     example: 1
 *                   teamHome:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: "FC Barcelona Várzea"
 *                   teamAway:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: "Bayern Amador"
 *                   match:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       nomequadra:
 *                         type: string
 *                       fase:
 *                         type: string
 *                       championship:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                             example: "Copa Várzea 2025"
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           end_date:
 *                             type: string
 *                             format: date
 *             examples:
 *               multiplosJogos:
 *                 summary: Time com partidas em vários campeonatos
 *                 value:
 *                   - id: 1
 *                     match_id: 10
 *                     team_home: 1
 *                     team_away: 4
 *                     teamHome_score: 2
 *                     teamAway_score: 1
 *                     teamHome:
 *                       id: 1
 *                       name: "FC Barcelona Várzea"
 *                     teamAway:
 *                       id: 4
 *                       name: "Bayern Amador"
 *                     match:
 *                       date: "2025-02-01T19:00:00.000Z"
 *                       nomequadra: "Estádio Regional"
 *                       fase: "Quartas de Final"
 *                       championship:
 *                         id: 1
 *                         name: "Copa Várzea 2025"
 *                         start_date: "2025-02-01"
 *                         end_date: "2025-04-30"
 *                   - id: 2
 *                     match_id: 15
 *                     team_home: 5
 *                     team_away: 1
 *                     teamHome_score: 0
 *                     teamAway_score: 3
 *                     teamHome:
 *                       id: 5
 *                       name: "Chelsea Várzea"
 *                     teamAway:
 *                       id: 1
 *                       name: "FC Barcelona Várzea"
 *                     match:
 *                       date: "2025-02-08T20:00:00.000Z"
 *                       nomequadra: "Arena Central"
 *                       fase: "Semifinal"
 *                       championship:
 *                         id: 1
 *                         name: "Copa Várzea 2025"
 *               semJogos:
 *                 summary: Time sem participação em campeonatos
 *                 value: []
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenInvalido:
 *                 value:
 *                   message: Usuário não autenticado
 *               tokenExpirado:
 *                 value:
 *                   message: Token expirado
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro ao buscar histórico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroConsulta:
 *                 summary: Erro na query do banco
 *                 value:
 *                   message: Erro ao consultar histórico de campeonatos
 *               erroServidor:
 *                 summary: Erro interno
 *                 value:
 *                   message: Erro ao buscar histórico de partidas de campeonatos
 */
router.get('/:teamId/championship-matches', authenticateToken, getAllChampionshipMatchesHistory);

/**
 * @swagger
 * /api/team-history/{teamId}/championships/{championshipId}/matches:
 *   get:
 *     summary: Listar partidas do time em um campeonato específico
 *     description: Retorna todas as partidas que o time jogou em um campeonato específico com placar e detalhes
 *     tags: [Histórico de Times]
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
 *         description: Lista de partidas do time no campeonato retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   match_id:
 *                     type: integer
 *                   team_home:
 *                     type: integer
 *                   team_away:
 *                     type: integer
 *                   teamHome_score:
 *                     type: integer
 *                   teamAway_score:
 *                     type: integer
 *                   teamHome:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   teamAway:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   match:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       nomequadra:
 *                         type: string
 *                       fase:
 *                         type: string
 *                       championship:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *             examples:
 *               campanhaCompleta:
 *                 summary: Campanha do time no campeonato
 *                 value:
 *                   - id: 1
 *                     match_id: 20
 *                     team_home: 1
 *                     team_away: 6
 *                     teamHome_score: 4
 *                     teamAway_score: 2
 *                     teamHome:
 *                       id: 1
 *                       name: "FC Barcelona Várzea"
 *                     teamAway:
 *                       id: 6
 *                       name: "PSG Amador"
 *                     match:
 *                       date: "2025-03-10T18:00:00.000Z"
 *                       nomequadra: "Campo Olímpico"
 *                       fase: "Quartas de Final"
 *                       championship:
 *                         id: 5
 *                         name: "Campeonato Regional 2025"
 *                   - id: 2
 *                     match_id: 25
 *                     team_home: 7
 *                     team_away: 1
 *                     teamHome_score: 1
 *                     teamAway_score: 1
 *                     teamHome:
 *                       id: 7
 *                       name: "Milan Várzea"
 *                     teamAway:
 *                       id: 1
 *                       name: "FC Barcelona Várzea"
 *                     match:
 *                       date: "2025-03-17T19:30:00.000Z"
 *                       nomequadra: "Estádio Municipal"
 *                       fase: "Semifinal"
 *                       championship:
 *                         id: 5
 *                         name: "Campeonato Regional 2025"
 *               semParticipacao:
 *                 summary: Time não jogou neste campeonato
 *                 value: []
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token não fornecido
 *               sessaoExpirada:
 *                 value:
 *                   message: Sessão expirada. Faça login novamente
 *       404:
 *         description: Time ou campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               timeNaoEncontrado:
 *                 summary: ID de time inexistente
 *                 value:
 *                   message: Time não encontrado
 *               campeonatoNaoEncontrado:
 *                 summary: ID de campeonato inexistente
 *                 value:
 *                   message: Campeonato não encontrado
 *               timeNaoInscrito:
 *                 summary: Time não participa do campeonato
 *                 value:
 *                   message: Time não está inscrito neste campeonato
 *       500:
 *         description: Erro interno ao buscar partidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroBancoDados:
 *                 summary: Falha na conexão
 *                 value:
 *                   message: Erro de conexão com o banco de dados
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao buscar partidas do campeonato
 */
router.get('/:teamId/championships/:championshipId/matches', authenticateToken, getMatchesByChampionshipHistory);

export default router;
