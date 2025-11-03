import express from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jogadores
 *   description: Gerenciamento de jogadores e vínculos com times
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
 *               - nome
 *               - sexo
 *               - ano
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Carlos Oliveira
 *               sexo:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               ano:
 *                 type: string
 *                 pattern: '^\d{4}$'
 *                 example: '1995'
 *               posicao:
 *                 type: string
 *                 example: Atacante
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
                 player:
                   $ref: '#/components/schemas/Player'
 *       400:
 *         description: Dados inválidos ou jogador já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               dadosInvalidos:
 *                 value:
 *                   message: Nome, sexo e ano são obrigatórios
 *               jogadorExiste:
 *                 value:
 *                   message: Jogador com este nome já existe
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
                           createdAt:
                             type: string
                             format: date-time
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
 * /api/players/add-to-team:
 *   post:
 *     summary: Adicionar jogador a um time
 *     description: Vincula um jogador existente ou cria um novo e vincula ao time
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
 *               - teamId
 *               - nome
 *               - sexo
 *               - ano
 *             properties:
 *               teamId:
 *                 type: integer
 *                 example: 1
 *               playerId:
 *                 type: integer
 *                 description: ID do jogador existente (opcional)
 *                 example: 5
 *               nome:
 *                 type: string
 *                 example: Pedro Santos
 *               sexo:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               ano:
 *                 type: string
 *                 example: '1998'
 *               posicao:
 *                 type: string
 *                 example: Meio-campo
 *     responses:
 *       201:
 *         description: Jogador adicionado ao time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
                 player:
                   $ref: '#/components/schemas/Player'
 *       400:
 *         description: Jogador já está vinculado ao time ou dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               jogadorJaVinculado:
 *                 value:
 *                   message: Jogador já está vinculado a este time
 *               dadosInvalidos:
 *                 value:
 *                   message: Dados do jogador são inválidos
 *               jogadorVinculadoOutroTime:
 *                 value:
 *                   message: Jogador já está vinculado a outro time
 *       404:
 *         description: Time ou jogador não encontrado
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
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor ao adicionar jogador ao time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao adicionar jogador ao time
 */
router.post('/add-to-team', PlayerController.addToTeam);

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
                 message:
                   type: string
                   example: Jogador removido do time com sucesso
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
 * /api/players/{id}:
 *   put:
 *     summary: Atualizar dados do jogador
 *     tags: [Jogadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               sexo:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *               ano:
 *                 type: string
 *               posicao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jogador atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
                 player:
                   $ref: '#/components/schemas/Player'
 *       404:
 *         description: Jogador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Jogador não encontrado
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               dadosInvalidos:
 *                 value:
 *                   message: Dados inválidos para atualização
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
 *       500:
 *         description: Erro interno do servidor ao atualizar jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar jogador
 */
router.put('/:id', PlayerController.update);

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
                 message:
                   type: string
                   example: Jogador deletado com sucesso
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