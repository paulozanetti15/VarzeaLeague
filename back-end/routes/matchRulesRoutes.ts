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
 *               - registrationDeadline
 *               - minimumAge
 *               - maximumAge
 *               - gender
 *             properties:
 *               matchId:
 *                 type: integer
 *                 description: ID da partida amistosa
 *                 example: 1
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *                 description: Data limite para inscrições
 *                 example: 2025-11-10T23:59:59.000Z
 *               minimumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade mínima permitida
 *                 example: 18
 *               maximumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade máxima permitida
 *                 example: 45
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino, Ambos]
 *                 description: Gênero permitido na partida
 *                 example: Masculino
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
 *                     registrationDeadline:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-10T23:59:59.000Z
 *                     minimumAge:
 *                       type: integer
 *                       example: 18
 *                     maximumAge:
 *                       type: integer
 *                       example: 45
 *                     gender:
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
 *                 registrationDeadline:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-11-10T23:59:59.000Z
 *                 minimumAge:
 *                   type: integer
 *                   example: 18
 *                 maximumAge:
 *                   type: integer
 *                   example: 45
 *                 gender:
 *                   type: string
 *                   enum: [Masculino, Feminino, Ambos]
 *                   example: Masculino
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
 *               registrationDeadline:
 *                 type: string
 *                 format: date-time
 *                 description: Data limite para inscrições
 *                 example: 2025-11-15T23:59:59.000Z
 *               minimumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade mínima permitida
 *                 example: 20
 *               maximumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade máxima permitida
 *                 example: 50
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino, Ambos]
 *                 description: Gênero permitido na partida
 *                 example: Ambos
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



export default router;