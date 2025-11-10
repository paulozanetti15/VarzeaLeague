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
 *     description: |
 *       Cria um novo usuário no sistema com validações rigorosas.
 *       
 *       **Validações obrigatórias:**
 *       - name, email, cpf, phone, gender, password (todos obrigatórios)
 *       - CPF: Validação matemática + formato (11 dígitos ou XXX.XXX.XXX-XX)
 *       - Gender: Apenas 'Masculino' ou 'Feminino'
 *       - Phone: 10 ou 11 dígitos (aceita com ou sem formatação)
 *       - Password: Mínimo 6 caracteres + maiúscula + minúscula + número + especial
 *       - UserType: 1, 2, 3 ou 4 (default: 4)
 *       
 *       **Normalização:**
 *       - Nome é salvo em lowercase: `name.trim().toLowerCase()`
 *       
 *       **Verificações de duplicidade (409):**
 *       1. Nome (normalizado)
 *       2. Email
 *       3. CPF
 *       
 *       **Retorno:**
 *       - Inclui token JWT (expiresIn: 24h) com {userId: id}
 *       - User com campos: id, name, email, userTypeId (SEM cpf, phone, gender, password)
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
 *               - phone
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário (será normalizado com trim e lowercase)
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mínimo 6 caracteres com maiúscula, minúscula, número e especial
 *                 minLength: 6
 *                 example: Senha123!
 *               cpf:
 *                 type: string
 *                 description: CPF com validação matemática (aceita com ou sem formatação)
 *                 pattern: '^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$'
 *                 example: 123.456.789-00
 *               phone:
 *                 type: string
 *                 description: Telefone obrigatório (10 ou 11 dígitos, aceita formatação)
 *                 example: (41) 99999-9999
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 description: Gênero obrigatório
 *                 example: Masculino
 *               userTypeId:
 *                 type: integer
 *                 description: '1=Admin Master, 2=Admin Eventos, 3=Admin Times, 4=Usuário Comum (default: 4)'
 *                 enum: [1, 2, 3, 4]
 *                 default: 4
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
 *                 token:
 *                   type: string
 *                   description: Token JWT (24h) com {userId}
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   description: Dados públicos do usuário (sem cpf/phone/gender/password)
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: Nome normalizado (lowercase)
 *                       example: joão silva
 *                     email:
 *                       type: string
 *                       example: joao@example.com
 *                     userTypeId:
 *                       type: integer
 *                       example: 4
 *       400:
 *         description: Validações falharam (múltiplos erros separados por vírgula)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposObrigatorios:
 *                 summary: Campos ausentes
 *                 value:
 *                   message: Nome é obrigatório, Email é obrigatório, CPF é obrigatório, Telefone é obrigatório, Gênero é obrigatório, Senha é obrigatória
 *               cpfInvalido:
 *                 summary: CPF com formato ou dígitos inválidos
 *                 value:
 *                   message: CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos)
 *               generoInvalido:
 *                 summary: Gênero diferente de Masculino/Feminino
 *                 value:
 *                   message: Gênero inválido (use Masculino ou Feminino)
 *               telefoneInvalido:
 *                 summary: Telefone sem 10 ou 11 dígitos
 *                 value:
 *                   message: Telefone inválido (use formato (XX) XXXXX-XXXX)
 *               userTypeInvalido:
 *                 summary: UserType não é 1, 2, 3 ou 4
 *                 value:
 *                   message: Tipo de usuário inválido (use 1, 2, 3 ou 4)
 *               senhaInvalida:
 *                 summary: Senha sem requisitos mínimos
 *                 value:
 *                   message: Senha inválida (mínimo 6 caracteres com maiúsculas, minúsculas, números e caracteres especiais)
 *               multiplosErros:
 *                 summary: Múltiplas validações falharam
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
 *                 summary: Nome normalizado já existe
 *                 value:
 *                   message: Este nome de usuário já está em uso. Por favor, escolha outro nome.
 *               emailExiste:
 *                 summary: Email já cadastrado
 *                 value:
 *                   message: Este e-mail já está cadastrado. Use outro e-mail ou faça login.
 *               cpfExiste:
 *                 summary: CPF já cadastrado
 *                 value:
 *                   message: Este CPF já está cadastrado no sistema.
 *       500:
 *         description: Erro ao registrar usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao registrar usuário
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login no sistema
 *     description: |
 *       Autentica usuário com email e senha.
 *       
 *       **Validações:**
 *       - Email e senha são obrigatórios (400 se ausentes)
 *       - Senha é comparada com bcrypt.compare
 *       
 *       **Segurança:**
 *       - Não revela se email existe ou não (sempre 401 "Email ou senha incorretos")
 *       
 *       **Token JWT:**
 *       - Payload: {id: userId} (não userId, apenas id)
 *       - Expira em 24h
 *       
 *       **Retorno:**
 *       - message: "Login realizado com sucesso"
 *       - token: JWT string
 *       - user: {id, name, email, userTypeId} (SEM password, cpf, etc)
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
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 token:
 *                   type: string
 *                   description: Token JWT (24h) com {id}
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   description: Dados públicos do usuário
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: joão silva
 *                     email:
 *                       type: string
 *                       example: joao@example.com
 *                     userTypeId:
 *                       type: integer
 *                       example: 4
 *       400:
 *         description: Email ou senha não fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Email e senha são obrigatórios
 *       401:
 *         description: Email não existe OU senha incorreta (não revela qual)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Email ou senha incorretos
 *       500:
 *         description: Erro ao fazer login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao fazer login
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/check-cpf/{cpf}:
 *   get:
 *     summary: Verificar se um CPF já está cadastrado
 *     tags: [Autenticação]
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF (com ou sem formatação)
 *     responses:
 *       200:
 *         description: Retorna objeto com campo exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *       400:
 *         description: CPF inválido ou não fornecido
 *       500:
 *         description: Erro ao verificar CPF
 */
router.get('/check-cpf/:cpf', authController.checkCpf);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token de autenticação
 *     description: |
 *       Valida um token JWT e retorna dados do usuário.
 *       
 *       **Fontes de token (em ordem de prioridade):**
 *       1. Header Authorization: "Bearer {token}"
 *       2. Query param: ?token={token}
 *       
 *       **Processo de verificação:**
 *       1. Extrai token de header ou query
 *       2. Verifica com jwt.verify (JWT_SECRET)
 *       3. Extrai userId de decoded.id OU decoded.userId (compatibilidade)
 *       4. Busca usuário no banco (UserModel.findByPk)
 *       
 *       **Erros possíveis:**
 *       - 401: Token não fornecido, inválido, expirado, ou userId ausente
 *       - 404: Token válido mas usuário não existe no banco
 *       
 *       **Retorno:**
 *       - user: {id, name, email, userTypeId}
 *       - authenticated: true
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token JWT (alternativa ao header Authorization)
 *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: joão silva
 *                     email:
 *                       type: string
 *                       example: joao@example.com
 *                     userTypeId:
 *                       type: integer
 *                       example: 4
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Token não fornecido, inválido, expirado ou sem userId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenNaoFornecido:
 *                 summary: Nem header nem query param fornecidos
 *                 value:
 *                   message: Token não fornecido
 *               tokenInvalido:
 *                 summary: JWT malformado ou expirado
 *                 value:
 *                   message: Token inválido ou expirado
 *               usuarioNaoAutenticado:
 *                 summary: Token válido mas sem id/userId no payload
 *                 value:
 *                   message: Usuário não autenticado
 *       404:
 *         description: Token válido mas usuário não existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro ao verificar token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao verificar token
 */
router.get('/verify', authController.verify);

export default router;
