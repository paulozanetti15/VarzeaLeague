import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para registro, login e verificação de usuários
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Autenticação]
 *     security: []
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
 *               - sexo
 *               - userTypeId
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: Senha123!
 *               cpf:
 *                 type: string
 *                 pattern: '^\d{3}\.\d{3}\.\d{3}-\d{2}$'
 *                 example: 123.456.789-00
 *               phone:
 *                 type: string
 *                 example: (41) 99999-9999
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               userTypeId:
 *                 type: integer
 *                 description: '1=Admin Master, 2=Admin Eventos, 3=Admin Times, 4=Usuário Comum'
 *                 example: 4
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário registrado com sucesso
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposObrigatorios:
 *                 value:
 *                   message: Nome é obrigatório, Email é obrigatório, CPF é obrigatório
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
 *                   message: CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos), Gênero inválido (use Masculino ou Feminino), Telefone inválido (use formato (XX) XXXXX-XXXX)
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
 *                   message: E-mail já cadastrado
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
 *               message: Erro ao registrar usuário.  
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login no sistema
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Senha123!
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               credenciaisInvalidas:
 *                 value:
 *                   message: Email ou senha inválidos
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao fazer login. 
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token de autenticação
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token JWT (alternativa ao header Authorization)
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenNaoFornecido:
 *                 value:
 *                   message: Token não fornecido
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido ou expirado
 *               usuarioNaoAutenticado:
 *                 value:
 *                   message: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao verificar token
 */
router.get('/verify', authController.verify);

export default router;
