import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { index, store, update, remove, getById } from '../controllers/userController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários do sistema
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       usertype:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: usuario_comum
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar usuários
 */
router.get('/', authenticateToken, index);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   properties:
 *                     usertype:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: usuario_comum
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar usuário
 */
router.get('/:id', authenticateToken, getById);

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Criar novo usuário (requer permissão admin)
 *     tags: [Usuários]
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
 *               - email
 *               - password
 *               - cpf
 *               - phone
 *               - gender
 *               - userTypeId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maria Santos
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Senha123!
 *               cpf:
 *                 type: string
 *                 pattern: '^\d{3}\.\d{3}\.\d{3}-\d{2}$'
 *                 example: 987.654.321-00
 *               phone:
 *                 type: string
 *                 pattern: '^\(\d{2}\) \d{4,5}-\d{4}$'
 *                 example: (41) 98888-8888
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 example: Feminino
 *               userTypeId:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: 'Tipo de usuário: 1=Admin Master, 2=Admin Eventos, 3=Admin Times, 4=Usuário Comum'
 *                 example: 3
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposFaltando:
 *                 value:
 *                   message: Todos os campos obrigatórios devem ser preenchidos
 *               cpfInvalido:
 *                 value:
 *                   message: CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos)
 *               generoInvalido:
 *                 value:
 *                   message: Gênero inválido (use Masculino ou Feminino)
 *               telefoneInvalido:
 *                 value:
 *                   message: Telefone inválido (use formato (XX) XXXXX-XXXX)
 *               userTypeInvalido:
 *                 value:
 *                   message: Tipo de usuário inválido (use 1, 2, 3 ou 4)
 *               senhaInvalida:
 *                 value:
 *                   message: Senha inválida (mínimo 6 caracteres com maiúsculas, minúsculas, números e caracteres especiais)
 *               multiplosErros:
 *                 value:
 *                   message: CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos), Gênero inválido (use Masculino ou Feminino)
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Sem permissão para criar usuários
 *       409:
 *         description: Conflito - Nome, Email ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nomeExiste:
 *                 value:
 *                   message: Nome já cadastrado
 *               emailExiste:
 *                 value:
 *                   message: Email já cadastrado
 *               cpfExiste:
 *                 value:
 *                   message: CPF já cadastrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao criar usuário
 */
router.post('/', authenticateToken, store);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Atualizar dados do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva Atualizado
 *               email:
 *                 type: string
 *                 example: joao.novo@example.com
 *               phone:
 *                 type: string
 *                 pattern: '^\(\d{2}\) \d{4,5}-\d{4}$'
 *                 example: (41) 97777-7777
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Nova senha (opcional, será criptografada automaticamente)
 *                 example: NovaSenha@123
 *               userTypeId:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: 'Tipo de usuário: 1=Admin Master, 2=Admin Eventos, 3=Admin Times, 4=Usuário Comum'
 *                 example: 3
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               cpfInvalido:
 *                 value:
 *                   message: CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos)
 *               generoInvalido:
 *                 value:
 *                   message: Gênero inválido (use Masculino ou Feminino)
 *               telefoneInvalido:
 *                 value:
 *                   message: Telefone inválido (use formato (XX) XXXXX-XXXX)
 *               userTypeInvalido:
 *                 value:
 *                   message: Tipo de usuário inválido (use 1, 2, 3 ou 4)
 *               senhaInvalida:
 *                 value:
 *                   message: Senha inválida (mínimo 6 caracteres com maiúsculas, minúsculas, números e caracteres especiais)
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       409:
 *         description: Conflito - Nome, Email ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nomeExiste:
 *                 value:
 *                   message: Nome já cadastrado
 *               emailExiste:
 *                 value:
 *                   message: Email já cadastrado
 *               cpfExiste:
 *                 value:
 *                   message: CPF já cadastrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar usuário
 */
router.put('/:id', authenticateToken, update);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Remover usuário (soft delete)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao excluir usuário
 */
router.delete('/:id', authenticateToken, remove);

export default router;