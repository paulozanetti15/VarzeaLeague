import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  insertRules,
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
 *     description: |
 *       Cria regras de inscrição para uma partida amistosa (idade, gênero, prazo).
 *       
 *       **Campos obrigatórios:** matchId, registrationDeadline, minimumAge, maximumAge, gender
 *       
 *       **Campo opcional:** registrationDeadlineTime (padrão: '23:59:59')
 *       
 *       **Validações:**
 *       - Idades entre 0 e 100 anos
 *       - minimumAge não pode ser maior que maximumAge
 *       - gender: 'Masculino', 'Feminino' ou 'Ambos'
 *       - Não permite criar regras duplicadas para mesma partida (409)
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
 *                 description: ID da partida amistosa (obrigatório)
 *                 example: 1
 *               registrationDeadline:
 *                 type: string
 *                 format: date
 *                 description: Data limite para inscrições (obrigatório)
 *                 example: 2025-11-10
 *               registrationDeadlineTime:
 *                 type: string
 *                 format: time
 *                 description: Hora limite para inscrições (opcional, padrão 23:59:59)
 *                 example: 18:00:00
 *               minimumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade mínima permitida (obrigatório)
 *                 example: 18
 *               maximumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade máxima permitida (obrigatório)
 *                 example: 45
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino, Ambos]
 *                 description: Gênero permitido na partida (obrigatório)
 *                 example: Masculino
 *           examples:
 *             regrasCompletas:
 *               summary: Regras com horário customizado
 *               value:
 *                 matchId: 1
 *                 registrationDeadline: 2025-11-10
 *                 registrationDeadlineTime: 18:00:00
 *                 minimumAge: 18
 *                 maximumAge: 45
 *                 gender: Masculino
 *             regrasBasicas:
 *               summary: Regras com horário padrão
 *               value:
 *                 matchId: 1
 *                 registrationDeadline: 2025-11-10
 *                 minimumAge: 16
 *                 maximumAge: 50
 *                 gender: Ambos
 *     responses:
 *       201:
 *         description: Regra criada com sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Regra criada com sucesso!
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
 *                       example: 2025-11-10
 *                     registrationDeadlineTime:
 *                       type: string
 *                       example: 23:59:59
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
 *               camposFaltando:
 *                 value:
 *                   message: Todos os campos são obrigatórios
 *               idadesForaIntervalo:
 *                 value:
 *                   message: Idades devem estar entre 0 e 100 anos
 *               idadeInvalida:
 *                 value:
 *                   message: Idade mínima não pode ser maior que idade máxima
 *               generoInvalido:
 *                 value:
 *                   message: Gênero inválido
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Partida não encontrada
 *       409:
 *         description: Conflito - Regras já existem para esta partida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você já criou regras para esta partida. Para modificá-las, use a opção de editar.
 *       500:
 *         description: Erro ao criar regra
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao criar regra
 */
router.post('/', authenticateToken, insertRules);

/**
 * @swagger
 * /api/match-rules/{id}:
 *   get:
 *     summary: Buscar regras de uma partida amistosa por matchId
 *     description: |
 *       Retorna as regras cadastradas para uma partida específica.
 *       
 *       **Importante:** O parâmetro 'id' na URL é o matchId (ID da partida), não o ID das regras.
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida (matchId)
 *         example: 1
 *     responses:
 *       200:
 *         description: Regras da partida encontradas
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
 *                   example: 2025-11-10
 *                 registrationDeadlineTime:
 *                   type: string
 *                   example: 23:59:59
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
 *       404:
 *         description: Regras não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não existem regras cadastradas
 *       500:
 *         description: Erro ao buscar regras
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar regras
 */
router.get('/:id', authenticateToken, getRuleById);

/**
 * @swagger
 * /api/match-rules/{id}:
 *   delete:
 *     summary: Deletar regras de uma partida amistosa
 *     description: |
 *       Remove as regras cadastradas para uma partida específica.
 *       
 *       **Importante:** O parâmetro 'id' na URL é o matchId (ID da partida), não o ID das regras.
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida (matchId)
 *         example: 1
 *     responses:
 *       200:
 *         description: Regras deletadas com sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Regras deletadas com sucesso!
 *       404:
 *         description: Regras não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Regras não encontradas
 *       500:
 *         description: Erro ao deletar as regras
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar as regras
 */
router.delete('/:id', authenticateToken, deleteRules);

/**
 * @swagger
 * /api/match-rules/{id}:
 *   put:
 *     summary: Atualizar regras de uma partida amistosa
 *     description: |
 *       Atualiza as regras de uma partida e pode ajustar o status da partida com base nas mudanças.
 *       
 *       **Importante:** O parâmetro 'id' na URL é o matchId (ID da partida), não o ID das regras.
 *       
 *       **Campos obrigatórios:** registrationDeadline, minimumAge, maximumAge, gender
 *       
 *       **Campo opcional:** registrationDeadlineTime (padrão: '23:59:59')
 *       
 *       **Validações:**
 *       - Idades entre 0 e 100 anos
 *       - minimumAge não pode ser maior que maximumAge
 *       - gender: 'Masculino', 'Feminino' ou 'Ambos'
 *       - registrationDeadline deve ser data válida
 *       
 *       **Efeito colateral - Atualização de status da partida:**
 *       - Se prazo expirou e < 2 times: status → 'cancelada'
 *       - Se prazo expirou e ≥ 2 times: status → 'confirmada'
 *       - Se prazo futuro e status era 'confirmada'/'cancelada': 
 *         - ≥ 2 times: status → 'sem_vagas'
 *         - < 2 times: status → 'aberta'
 *     tags: [Regras de Partidas Amistosas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida (matchId)
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationDeadline
 *               - minimumAge
 *               - maximumAge
 *               - gender
 *             properties:
 *               registrationDeadline:
 *                 type: string
 *                 format: date
 *                 description: Data limite para inscrições (obrigatório)
 *                 example: 2025-11-15
 *               registrationDeadlineTime:
 *                 type: string
 *                 format: time
 *                 description: Hora limite para inscrições (opcional, padrão 23:59:59)
 *                 example: 20:00:00
 *               minimumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade mínima permitida (obrigatório)
 *                 example: 20
 *               maximumAge:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Idade máxima permitida (obrigatório)
 *                 example: 50
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino, Ambos]
 *                 description: Gênero permitido na partida (obrigatório)
 *                 example: Ambos
 *           examples:
 *             atualizacaoCompleta:
 *               summary: Atualização com todos os campos
 *               value:
 *                 registrationDeadline: 2025-11-15
 *                 registrationDeadlineTime: 20:00:00
 *                 minimumAge: 20
 *                 maximumAge: 50
 *                 gender: Ambos
 *             atualizacaoBasica:
 *               summary: Atualização com horário padrão
 *               value:
 *                 registrationDeadline: 2025-11-15
 *                 minimumAge: 18
 *                 maximumAge: 45
 *                 gender: Masculino
 *     responses:
 *       200:
 *         description: Regras atualizadas com sucesso! Status da partida pode ter sido alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Regras atualizadas com sucesso!
 *                 rules:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposFaltando:
 *                 value:
 *                   message: Todos os campos são obrigatórios
 *               idadesForaIntervalo:
 *                 value:
 *                   message: Idades devem estar entre 0 e 100 anos
 *               idadeInvalida:
 *                 value:
 *                   message: Idade mínima não pode ser maior que idade máxima
 *               generoInvalido:
 *                 value:
 *                   message: Gênero inválido
 *               dataInvalida:
 *                 value:
 *                   message: Data limite inválida
 *       404:
 *         description: Regras não encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Regras não encontradas
 *       500:
 *         description: Erro ao atualizar as regras
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar as regras
 */
router.put('/:id', authenticateToken, updateRules);



export default router;