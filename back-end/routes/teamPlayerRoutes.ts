import express from 'express';
import {
  deleteTeamPlayer,
  getTeamsPlayers,
  createTeamPlayer
} from '../controllers/TeamPlayersController';

export const teamPlayerRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jogadores de Times
 *   description: Endpoints para gerenciar a relação entre jogadores e times (elenco)
 */

/**
 * @swagger
 * /api/team-players/{teamId}:
 *   get:
 *     summary: Buscar todos os jogadores de um time (elenco)
 *     description: Retorna a lista completa de jogadores vinculados a um time específico com suas informações detalhadas
 *     tags: [Jogadores de Times]
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
 *         description: Lista de jogadores do time
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da relação time-jogador
 *                     example: 10
 *                   teamId:
 *                     type: integer
 *                     description: ID do time
 *                     example: 1
 *                   playerId:
 *                     type: integer
 *                     description: ID do jogador
 *                     example: 5
 *                   player:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       nome:
 *                         type: string
 *                         example: Carlos Silva
 *                       sexo:
 *                         type: string
 *                         enum: [Masculino, Feminino]
 *                         example: Masculino
 *                       ano:
 *                         type: string
 *                         description: Ano de nascimento
 *                         example: "1995"
 *                       posicao:
 *                         type: string
 *                         example: Atacante
 *                       numero:
 *                         type: integer
 *                         example: 10
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-01-15T10:30:00.000Z
 *             examples:
 *               elencoCompleto:
 *                 value:
 *                   - id: 10
 *                     teamId: 1
 *                     playerId: 5
 *                     player:
 *                       id: 5
 *                       nome: Carlos Silva
 *                       sexo: Masculino
 *                       ano: "1995"
 *                       posicao: Atacante
 *                       numero: 10
 *                   - id: 11
 *                     teamId: 1
 *                     playerId: 8
 *                     player:
 *                       id: 8
 *                       nome: Maria Santos
 *                       sexo: Feminino
 *                       ano: "1998"
 *                       posicao: Goleira
 *                       numero: 1
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro interno do servidor ao buscar jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
             example:
               message: Erro ao buscar jogadores do time
 */
teamPlayerRoutes.get('/:teamId', getTeamsPlayers);

/**
 * @swagger
 * /api/team-players/{teamId}:
 *   delete:
 *     summary: Remover todos os jogadores de um time
 *     description: Remove a vinculação de todos os jogadores com o time especificado. Útil para resetar o elenco completo.
 *     tags: [Jogadores de Times]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time cujos jogadores serão removidos
 *         example: 1
 *     responses:
 *       200:
 *         description: Todos os jogadores removidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Todos os jogadores foram removidos do time com sucesso
 *                 removedCount:
 *                   type: integer
 *                   description: Quantidade de jogadores removidos
 *                   example: 15
 *             examples:
 *               sucessoRemocao:
 *                 value:
 *                   message: Todos os jogadores foram removidos do time com sucesso
 *                   removedCount: 15
 *       404:
 *         description: Time não encontrado ou não possui jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               timeNaoEncontrado:
 *                 value:
 *                   message: Time não encontrado
 *               semJogadores:
 *                 value:
 *                   message: Time não possui jogadores para remover
 *       403:
 *         description: Sem permissão para remover jogadores deste time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão do time pode remover jogadores
 *       500:
 *         description: Erro interno do servidor ao remover jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover jogadores do time
 */
teamPlayerRoutes.delete('/:teamId', deleteTeamPlayer);

/**
 * @swagger
 * /api/team-players/{teamId}/player/{playerId}:
 *   delete:
 *     summary: Remover um jogador específico do time
 *     description: Remove a vinculação de um jogador específico com o time. O jogador não é deletado do sistema, apenas desvinculado do time.
 *     tags: [Jogadores de Times]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time
 *         example: 1
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do jogador a ser removido
 *         example: 5
 *     responses:
 *       200:
 *         description: Jogador removido do time com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador removido do time com sucesso
 *                 player:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     nome:
 *                       type: string
 *                       example: Carlos Silva
 *             examples:
 *               jogadorRemovido:
 *                 value:
 *                   message: Jogador Carlos Silva removido do time com sucesso
 *                   player:
 *                     id: 5
 *                     nome: Carlos Silva
 *                     posicao: Atacante
 *       404:
 *         description: Time ou jogador não encontrado, ou jogador não está vinculado ao time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               timeNaoEncontrado:
 *                 value:
 *                   message: Time não encontrado
 *               jogadorNaoEncontrado:
 *                 value:
 *                   message: Jogador não encontrado
 *               vinculoNaoExiste:
 *                 value:
 *                   message: Jogador não está vinculado a este time
 *       403:
 *         description: Sem permissão para remover jogadores deste time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão do time pode remover jogadores
 *       500:
 *         description: Erro interno do servidor ao remover jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover jogador do time
 */
teamPlayerRoutes.delete('/:teamId/player/:playerId', deleteTeamPlayer);

/**
 * @swagger
 * /api/team-players/{teamId}:
 *   post:
 *     summary: Adicionar jogadores a um time
 *     description: Vincula um ou mais jogadores a um time. Se o jogador não existir no sistema, ele será criado automaticamente. Se já existir, será apenas vinculado ao time.
 *     tags: [Jogadores de Times]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time que receberá os jogadores
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - players
 *             properties:
 *               players:
 *                 type: array
 *                 description: Lista de jogadores a serem adicionados
 *                 items:
 *                   type: object
 *                   required:
 *                     - nome
 *                     - sexo
 *                     - ano
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID do jogador (se já existir no sistema)
 *                       example: 5
 *                     nome:
 *                       type: string
 *                       description: Nome completo do jogador
 *                       minLength: 3
 *                       maxLength: 100
 *                       example: Carlos Silva
 *                     sexo:
 *                       type: string
 *                       enum: [Masculino, Feminino]
 *                       description: Gênero do jogador
 *                       example: Masculino
 *                     ano:
 *                       type: string
 *                       description: Ano de nascimento (4 dígitos)
 *                       pattern: '^\d{4}$'
 *                       example: "1995"
 *                     posicao:
 *                       type: string
 *                       description: Posição do jogador em campo
 *                       example: Atacante
 *                     numero:
 *                       type: integer
 *                       description: Número da camisa
 *                       minimum: 1
 *                       maximum: 99
 *                       example: 10
 *           examples:
 *             adicionarNovosJogadores:
 *               summary: Adicionar jogadores novos ao sistema e ao time
 *               value:
 *                 players:
 *                   - nome: Carlos Silva
 *                     sexo: Masculino
 *                     ano: "1995"
 *                     posicao: Atacante
 *                     numero: 10
 *                   - nome: Maria Santos
 *                     sexo: Feminino
 *                     ano: "1998"
 *                     posicao: Goleira
 *                     numero: 1
 *            
 *     responses:
 *       201:
 *         description: Jogadores adicionados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogadores adicionados ao time com sucesso
 *                 addedPlayers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       posicao:
 *                         type: string
 *                 skippedPlayers:
 *                   type: array
 *                   description: Jogadores que já estavam vinculados ao time
 *                   items:
 *                     type: object
 *             examples:
 *               sucessoCompleto:
 *                 value:
 *                   message: 3 jogadores adicionados ao time com sucesso
 *                   addedPlayers:
 *                     - id: 5
 *                       nome: Carlos Silva
 *                       posicao: Atacante
 *                     - id: 15
 *                       nome: Maria Santos
 *                       posicao: Goleira
 *                     - id: 16
 *                       nome: João Pedro
 *                       posicao: Meio-Campo
 *                   skippedPlayers: []
 *               comJogadoresDuplicados:
 *                 value:
 *                   message: 2 jogadores adicionados, 1 já estava no time
 *                   addedPlayers:
 *                     - id: 15
 *                       nome: Maria Santos
 *                     - id: 16
 *                       nome: João Pedro
 *                   skippedPlayers:
 *                     - id: 5
 *                       nome: Carlos Silva
 *                       motivo: Jogador já está vinculado a este time
 *       400:
 *         description: Dados inválidos ou jogadores não fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               semJogadores:
 *                 value:
 *                   message: Nenhum jogador foi fornecido
 *               dadosInvalidos:
 *                 value:
 *                   message: Dados de jogador inválidos - nome, sexo e ano são obrigatórios
 *               anoInvalido:
 *                 value:
 *                   message: Ano de nascimento inválido - deve ter 4 dígitos
 *               sexoInvalido:
 *                 value:
 *                   message: Sexo inválido - deve ser Masculino ou Feminino
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       403:
 *         description: Sem permissão para adicionar jogadores a este time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão do time pode adicionar jogadores
 *       409:
 *         description: Conflito - jogador com mesmo nome já existe em outro time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Jogador Carlos Silva já está vinculado a outro time
 *       500:
 *         description: Erro interno do servidor ao adicionar jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
             example:
               message: Erro ao adicionar jogadores ao time
 */
teamPlayerRoutes.post('/:teamId', createTeamPlayer);

export default teamPlayerRoutes;
