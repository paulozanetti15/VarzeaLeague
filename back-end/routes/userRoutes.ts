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
 *     description: |
 *       Retorna todos os usuários do sistema.
 *       
 *       **Include:**
 *       - usertype (association, apenas attribute 'name')
 *       
 *       **Sem filtros:** Retorna TODOS os usuários (não filtra por isDeleted ou qualquer condição)
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
 *                         description: Tipo de usuário associado
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Nome do tipo de usuário
 *                             example: usuario_comum
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao buscar usuários
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
 *     description: |
 *       Retorna dados de um usuário específico.
 *       
 *       **Include:**
 *       - usertype (association, apenas attribute 'name')
 *       
 *       **Validação:**
 *       - 404 se usuário não encontrado
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
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro ao buscar usuário
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
 *     summary: Criar novo usuário
 *     description: |
 *       Cria um novo usuário no sistema (não requer permissão admin específica, apenas autenticação).
 *       
 *       **Validações (mesmas do /auth/register):**
 *       - Todos os campos obrigatórios: name, email, cpf, phone, gender, password
 *       - CPF: Validação matemática
 *       - Gender: 'Masculino' ou 'Feminino'
 *       - Phone: 10 ou 11 dígitos
 *       - Password: Mín 6 chars + maiúscula + minúscula + número + especial
 *       - UserType: 1, 2, 3 ou 4 (default: 4)
 *       
 *       **Normalização:**
 *       - Nome: `name.trim().toLowerCase()`
 *       
 *       **Verificações de duplicidade (409):**
 *       1. Nome (normalizado)
 *       2. Email
 *       3. CPF
 *       
 *       **Password:**
 *       - Hasheia com bcrypt.hash(password, 10)
 *       
 *       **Retorno:**
 *       - User completo (incluindo password hasheado)
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário (será normalizado: trim + lowercase)
 *                 example: Maria Santos
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Será hasheado com bcrypt (salt 10)
 *                 example: Senha123!
 *               cpf:
 *                 type: string
 *                 description: CPF com validação matemática (aceita formatação)
 *                 pattern: '^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$'
 *                 example: 987.654.321-00
 *               phone:
 *                 type: string
 *                 description: Telefone obrigatório (10 ou 11 dígitos)
 *                 pattern: '^\(\d{2}\) \d{4,5}-\d{4}$'
 *                 example: (41) 98888-8888
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 description: Gênero obrigatório
 *                 example: Feminino
 *               userTypeId:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: 'Tipo de usuário (default: 4 se não fornecido)'
 *                 default: 4
 *                 example: 3
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validações falharam (múltiplos erros separados por vírgula)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposFaltando:
 *                 summary: Campos obrigatórios ausentes
 *                 value:
 *                   message: Nome é obrigatório, Email é obrigatório, CPF é obrigatório, Telefone é obrigatório, Gênero é obrigatório, Senha é obrigatória
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
 *               message: Usuário não autenticado
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
 *                   message: Nome já cadastrado
 *               emailExiste:
 *                 summary: Email já cadastrado
 *                 value:
 *                   message: Email já cadastrado
 *               cpfExiste:
 *                 summary: CPF já cadastrado
 *                 value:
 *                   message: CPF já cadastrado
 *       500:
 *         description: Erro ao criar usuário
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
 *     description: |
 *       Atualiza campos do usuário. Todos os campos são opcionais.
 *       
 *       **Validações:**
 *       - 404: Se usuário não encontrado
 *       - Valida apenas campos presentes em req.body
 *       - CPF, gender, phone, userTypeId, password: mesmas validações do POST
 *       
 *       **Normalização:**
 *       - Se `name` fornecido: normaliza com trim().toLowerCase()
 *       
 *       **Verificações de duplicidade (409):**
 *       - Nome: Se diferente do atual e já existe
 *       - Email: Se diferente do atual e já existe
 *       - CPF: Se diferente do atual e já existe
 *       
 *       **Campo CPF:**
 *       - **REMOVIDO do updateData:** `delete updateData.cpf` (não é atualizado!)
 *       - Ainda valida formato, mas NÃO salva alteração
 *       
 *       **Password:**
 *       - Se fornecido: hasheia com bcrypt.hash(password, 10)
 *       
 *       **Retorno:**
 *       - User atualizado completo
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
 *                 description: Nome (será normalizado: trim + lowercase)
 *                 example: João Silva Atualizado
 *               email:
 *                 type: string
 *                 example: joao.novo@example.com
 *               phone:
 *                 type: string
 *                 description: 10 ou 11 dígitos
 *                 pattern: '^\(\d{2}\) \d{4,5}-\d{4}$'
 *                 example: (41) 97777-7777
 *               gender:
 *                 type: string
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nova senha (será hasheada com bcrypt)
 *                 minLength: 6
 *                 example: NovaSenha@123
 *               userTypeId:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 example: 3
 *               cpf:
 *                 type: string
 *                 description: ⚠️ CPF é VALIDADO mas NÃO é ATUALIZADO (delete updateData.cpf)
 *                 pattern: '^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$'
 *                 example: 123.456.789-00
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validações falharam
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
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
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
 *                 summary: Nome normalizado já existe
 *                 value:
 *                   message: Nome já cadastrado
 *               emailExiste:
 *                 summary: Email já cadastrado
 *                 value:
 *                   message: Email já cadastrado
 *               cpfExiste:
 *                 summary: CPF já cadastrado (valida mas não atualiza)
 *                 value:
 *                   message: CPF já cadastrado
 *       500:
 *         description: Erro ao atualizar usuário
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
 *     summary: Remover usuário (hard delete + cascade)
 *     description: |
 *       Remove permanentemente o usuário e todos os recursos relacionados.
 *       
 *       **⚠️ NÃO É SOFT DELETE - É HARD DELETE!**
 *       
 *       **Validações:**
 *       - 404: Se usuário não encontrado
 *       - 400: Se usuário é capitão de times (bloqueia exclusão)
 *       
 *       **Cascade de exclusão (em ordem):**
 *       
 *       1. **Partidas organizadas:** FriendlyMatchesModel WHERE organizerId
 *          - FriendlyMatchEvaluation (match_id IN matchIds)
 *          - FriendlyMatchGoal (match_id IN matchIds)
 *          - FriendlyMatchCard (match_id IN matchIds)
 *          - FriendlyMatchReport (match_id IN matchIds)
 *          - FriendlyMatchesRulesModel (matchId IN matchIds)
 *          - FriendlyMatchTeamsModel (matchId IN matchIds)
 *          - FriendlyMatchesModel (id IN matchIds)
 *       
 *       2. **Campeonatos criados:** Championship WHERE created_by
 *          - Championship (id IN champIds)
 *       
 *       3. **Vínculos de times:** TeamUser WHERE userId
 *       
 *       4. **Usuário:** user.destroy()
 *       
 *       **Bloqueio:**
 *       - Se `captainedTeams > 0`: Retorna 400 com mensagem de quantos times
 *       
 *       **Retorno:**
 *       - message: "Usuário excluído com sucesso"
 *       - deletedResources: {partidas: N, campeonatos: M}
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
 *         description: Usuário e recursos relacionados excluídos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário excluído com sucesso
 *                 deletedResources:
 *                   type: object
 *                   description: Contadores de recursos deletados em cascade
 *                   properties:
 *                     partidas:
 *                       type: integer
 *                       description: Número de partidas amistosas organizadas que foram deletadas
 *                       example: 5
 *                     campeonatos:
 *                       type: integer
 *                       description: Número de campeonatos criados que foram deletados
 *                       example: 2
 *       400:
 *         description: Usuário é capitão de times (bloqueio de exclusão)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Impossível excluir usuário. Existem 3 time(s) como capitão. Transfira a capitania antes de excluir.
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro ao deletar usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar usuário
 */
router.delete('/:id', authenticateToken, remove);

export default router;