import express from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jogadores
 *   description: Gerenciamento completo de jogadores - criação, consulta, atualização, remoção e vínculos com times
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Criar novo jogador
 *     tags: [Jogadores]
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
 *               - gender
 *               - year
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do jogador (coluna 'name' no BD)
 *                 example: Carlos Oliveira
 *               gender:
 *                 type: string
 *                 description: Gênero do jogador (coluna 'gender' no BD)
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               year:
 *                 type: string
 *                 description: Ano de nascimento (coluna 'year' no BD)
 *                 pattern: '^\d{4}$'
 *                 example: '1995'
 *               position:
 *                 type: string
 *                 description: Posição do jogador (coluna 'position' no BD)
 *                 example: Atacante
 *               teamId:
 *                 type: integer
 *                 description: ID do time para vincular o jogador (opcional)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Jogador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador criado com sucesso
 *                 player:
 *                   $ref: '#/components/schemas/Player'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               dadosInvalidos:
 *                 value:
 *                   message: Nome, sexo e ano são obrigatórios
 *               anoInvalido:
 *                 value:
 *                   message: Ano deve ter 4 dígitos
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       409:
 *         description: Conflito - Jogador já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               jogadorExiste:
 *                 value:
 *                   message: Já existe um jogador com este nome vinculado a outro time
 *               jogadorNoMesmoTime:
 *                 value:
 *                   message: Já existe um jogador com este nome neste time
 *       500:
 *         description: Erro interno do servidor ao criar jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao criar jogador
 */
router.post('/', PlayerController.create);

/**
 * @swagger
 * /api/players/team/{teamId}:
 *   get:
 *     summary: Listar jogadores de um time
 *     tags: [Jogadores]
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
 *         description: Lista de jogadores do time
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Player'
 *                   - type: object
 *                     properties:
 *                       teamPlayer:
 *                         type: object
 *                         properties:
 *                           teamId:
 *                             type: integer
 *                           playerId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
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
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor ao buscar jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar jogadores do time
 */
router.get('/team/:teamId', PlayerController.getPlayersFromTeam);



/**
 * @swagger
 * /api/players/team/{teamId}/player/{playerId}:
 *   delete:
 *     summary: Remover jogador de um time (apenas desvincular)
 *     tags: [Jogadores]
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
 *         description: Jogador removido do time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador removido do time com sucesso
 *       404:
 *         description: Time ou jogador não encontrado, ou vínculo não existe
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
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
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
router.delete('/team/:teamId/player/:playerId', PlayerController.removeFromTeam);

/**
 * @swagger
 * /api/players/team/{teamId}/update-all:
 *   put:
 *     summary: Atualizar todos os jogadores de um time (em lote)
 *     description: Permite atualizar ou adicionar múltiplos jogadores ao time de uma vez. Apenas o capitão do time pode realizar esta operação.
 *     tags: [Jogadores]
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
 *               - players
 *             properties:
 *               players:
 *                 type: array
 *                 description: Array de jogadores para atualizar/criar
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID do jogador (opcional - se não fornecido, cria novo jogador)
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: Nome do jogador (coluna 'name' no BD)
 *                       example: Carlos Oliveira
 *                       required: true
 *                     gender:
 *                       type: string
 *                       description: Gênero do jogador (coluna 'gender' no BD)
 *                       enum: [Masculino, Feminino]
 *                       example: Masculino
 *                       required: true
 *                     year:
 *                       type: string
 *                       description: Ano de nascimento (coluna 'year' no BD)
 *                       example: '1996'
 *                       required: true
 *                     position:
 *                       type: string
 *                       description: Posição do jogador (coluna 'position' no BD)
 *                       example: Zagueiro
 *                       required: true
 *           examples:
 *             atualizacaoCompleta:
 *               summary: Atualização de múltiplos jogadores
 *               value:
 *                 players:
 *                   - id: 1
 *                     name: Carlos Oliveira
 *                     gender: Masculino
 *                     year: '1995'
 *                     position: Atacante
 *                   - id: 2
 *                     name: João Silva
 *                     gender: Masculino
 *                     year: '1998'
 *                     position: Goleiro
 *                   - name: Pedro Santos
 *                     gender: Masculino
 *                     year: '2000'
 *                     position: Zagueiro
 *     responses:
 *       200:
 *         description: Jogadores atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogadores atualizados com sucesso
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       400:
 *         description: Dados inválidos ou erro ao processar jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               listaInvalida:
 *                 value:
 *                   message: Lista de jogadores inválida
 *               camposObrigatorios:
 *                 value:
 *                   error: Alguns jogadores não puderam ser processados
 *                   details:
 *                     errors:
 *                       - player:
 *                           name: João
 *                         erro: Todos os campos são obrigatórios (name, gender, year, position)
 *                     success: []
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão para atualizar este jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão do time pode atualizar jogadores
 *       409:
 *         description: Conflito - Nome já existe no time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Já existe um jogador com este nome neste time
 *       500:
 *         description: Erro interno do servidor ao atualizar jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar jogador
 */
router.put('/team/:id/update-all', PlayerController.update);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Deletar jogador (soft delete)
 *     tags: [Jogadores]
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
 *         description: Jogador deletado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador deletado com sucesso
 *       404:
 *         description: Jogador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Jogador não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão para deletar este jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para deletar este jogador
 *       409:
 *         description: Jogador está vinculado a times ativos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não é possível deletar jogador vinculado a times ativos
 *       500:
 *         description: Erro interno do servidor ao deletar jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar jogador
 */
router.delete('/:id', PlayerController.delete);

export default router; 