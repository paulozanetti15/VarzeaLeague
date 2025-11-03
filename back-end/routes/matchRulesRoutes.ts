import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  insertRules,
  getAllRules,
  getRuleById,
  deleteRules,
  updateRules
} from '../controllers/FriendlyMatchesRulesController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Regras de Partidas Amistosas
 *   description: Endpoints para gerenciar regras de partidas amistosas (idade, gênero, etc)
 */

/**
 * @swagger
 * /api/match-rules:
 *   post:
 *     summary: Criar regras para uma partida amistosa
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - idadeMinima
 *               - idadeMaxima
 *               - genero
 *             properties:
 *               matchId:
 *                 type: integer
 *                 description: ID da partida amistosa
 *                 example: 1
 *               idadeMinima:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade mínima permitida
 *                 example: 18
 *               idadeMaxima:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade máxima permitida
 *                 example: 45
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Ambos]
 *                 description: Gênero permitido na partida
 *                 example: Masculino
 *               observacoes:
 *                 type: string
 *                 description: Observações adicionais sobre as regras
 *                 example: Partida recreativa, sem contato físico intenso
 *     responses:
 *       201:
 *         description: Regras criadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Regras criadas com sucesso
 *                 rules:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     matchId:
 *                       type: integer
 *                       example: 1
 *                     idadeMinima:
 *                       type: integer
 *                       example: 18
 *                     idadeMaxima:
 *                       type: integer
 *                       example: 45
 *                     genero:
 *                       type: string
 *                       example: Masculino
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               idadeInvalida:
 *                 value:
 *                   message: Idade mínima não pode ser maior que idade máxima
 *               generoInvalido:
 *                 value:
 *                   message: Gênero deve ser Masculino, Feminino ou Ambos
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Partida não encontrada
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
router.post('/', authenticateToken, insertRules);

/**
 * @swagger
 * /api/match-rules/{id}:
 *   get:
 *     summary: Buscar regras de uma partida amistosa por ID
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID das regras da partida
 *         example: 1
 *     responses:
 *       200:
 *         description: Regras da partida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 matchId:
 *                   type: integer
 *                   example: 1
 *                 idadeMinima:
 *                   type: integer
 *                   example: 18
 *                 idadeMaxima:
 *                   type: integer
 *                   example: 45
 *                 genero:
 *                   type: string
 *                   enum: [Masculino, Feminino, Ambos]
 *                   example: Masculino
 *                 observacoes:
 *                   type: string
 *                   example: Partida recreativa
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Regras não encontradas
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
router.get('/:id', authenticateToken, getRuleById);

/**
 * @swagger
 * /api/match-rules/{id}:
 *   delete:
 *     summary: Deletar regras de uma partida amistosa
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID das regras da partida
 *         example: 1
 *     responses:
 *       200:
 *         description: Regras deletadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Regras deletadas com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Regras não encontradas
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
router.delete('/:id', authenticateToken, deleteRules);

/**
 * @swagger
 * /api/match-rules/{id}:
 *   put:
 *     summary: Atualizar regras de uma partida amistosa
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID das regras da partida
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idadeMinima:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *               idadeMaxima:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 50
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Ambos]
 *                 example: Ambos
 *               observacoes:
 *                 type: string
 *                 example: Partida mista atualizada
 *     responses:
 *       200:
 *         description: Regras atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Regras atualizadas com sucesso
 *                 rules:
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
 *         description: Regras não encontradas
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
router.put('/:id', authenticateToken, updateRules);

/**
 * @swagger
 * /api/match-rules/ultimapartida:
 *   get:
 *     summary: Buscar todas as regras de partidas (última partida)
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas as regras
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
 *                   matchId:
 *                     type: integer
 *                     example: 1
 *                   idadeMinima:
 *                     type: integer
 *                     example: 18
 *                   idadeMaxima:
 *                     type: integer
 *                     example: 45
 *                   genero:
 *                     type: string
 *                     example: Masculino
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
router.get('/ultimapartida', authenticateToken, getAllRules);

export default router;