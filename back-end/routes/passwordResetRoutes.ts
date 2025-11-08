import { Router } from 'express';
import { requestPasswordReset, resetPassword, updatePassword } from '../controllers/passwordResetController';
import { authenticateToken } from '../middleware/auth';

const routerReset = Router();

/**
 * @swagger
 * tags:
 *   name: Redefinição de Senha
 *   description: Gerenciamento de solicitação e redefinição de senhas de usuários
 */

/**
 * @swagger
 * /api/password-reset/request-reset:
 *   post:
 *     summary: Solicitar redefinição de senha
 *     description: Envia email com token para redefinição de senha. Requer autenticação
 *     tags: [Redefinição de Senha]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário cadastrado
 *                 example: usuario@example.com
 *           examples:
 *             emailValido:
 *               summary: Email de usuário cadastrado
 *               value:
 *                 email: joao.silva@email.com
 *             emailAdmin:
 *               summary: Email de administrador
 *               value:
 *                 email: admin@varzealeague.com
 *     responses:
 *       201:
 *         description: Email de redefinição enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               emailEnviado:
 *                 summary: Confirmação de envio
 *                 value:
 *                   message: Email de recuperação enviado com sucesso
 *       400:
 *         description: Dados inválidos ou email não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               emailFaltando:
 *                 summary: Email não informado
 *                 value:
 *                   message: Email é obrigatório
 *               emailInvalido:
 *                 summary: Formato de email inválido
 *                 value:
 *                   message: Formato de email inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 summary: Token não fornecido
 *                 value:
 *                   message: Token não fornecido ou inválido
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value:
 *                   message: Token expirado. Faça login novamente
 *       404:
 *         description: Usuário não encontrado no sistema
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               usuarioNaoEncontrado:
 *                 summary: Email não cadastrado
 *                 value:
 *                   message: Usuário com este email não encontrado
 *               usuarioInativo:
 *                 summary: Usuário desativado
 *                 value:
 *                   message: Usuário inativo ou deletado
 *       500:
 *         description: Erro interno ao processar solicitação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroEmail:
 *                 summary: Falha ao enviar email
 *                 value:
 *                   message: Erro ao enviar email de redefinição
 *               erroServidor:
 *                 summary: Erro genérico do servidor
 *                 value:
 *                   message: Erro ao processar solicitação de redefinição de senha
 */
routerReset.post('/request-reset', authenticateToken, requestPasswordReset);

/**
 * @swagger
 * /api/password-reset/reset:
 *   put:
 *     summary: Redefinir senha com token
 *     description: Redefine a senha do usuário usando o token recebido por email
 *     tags: [Redefinição de Senha]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token recebido por email
 *                 example: abc123def456ghi789
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Nova senha (mínimo 6 caracteres)
 *                 example: NovaSenha@123
 *           examples:
 *             senhaForte:
 *               summary: Senha com requisitos de segurança
 *               value:
 *                 token: abc123def456ghi789
 *                 newPassword: Senha@Segura123
 *             senhaMinima:
 *               summary: Senha com comprimento mínimo
 *               value:
 *                 token: xyz789abc456def123
 *                 newPassword: senha123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Senha redefinida com sucesso
 *       400:
 *         description: Dados inválidos ou token expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposFaltando:
 *                 summary: Token ou senha não fornecidos
 *                 value:
 *                   message: Token e nova senha são obrigatórios
 *               senhaFraca:
 *                 summary: Senha não atende requisitos
 *                 value:
 *                   message: A senha deve ter no mínimo 6 caracteres
 *               tokenExpirado:
 *                 summary: Token de redefinição expirado
 *                 value:
 *                   message: Token de redefinição expirado. Solicite um novo
 *               tokenInvalido:
 *                 summary: Token inválido ou já utilizado
 *                 value:
 *                   message: Token de redefinição inválido
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token de autenticação não fornecido ou inválido
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado
 *       500:
 *         description: Erro ao redefinir senha
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroCriptografia:
 *                 summary: Erro ao criptografar senha
 *                 value:
 *                   message: Erro ao processar nova senha
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao redefinir senha
 */
routerReset.put('/reset', authenticateToken, resetPassword);

/**
 * @swagger
 * /api/password-reset/{id}/update:
 *   put:
 *     summary: Atualizar senha do usuário
 *     description: Permite que o usuário autenticado atualize sua própria senha ou que administradores atualizem senhas de outros usuários
 *     tags: [Redefinição de Senha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário cuja senha será atualizada
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Senha atual do usuário
 *                 example: SenhaAtual@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Nova senha (mínimo 6 caracteres)
 *                 example: NovaSenha@456
 *           examples:
 *             atualizacaoNormal:
 *               summary: Usuário atualizando própria senha
 *               value:
 *                 currentPassword: MinhaSenh@Antiga
 *                 newPassword: MinhaSenh@Nova123
 *             atualizacaoAdmin:
 *               summary: Admin atualizando senha de usuário
 *               value:
 *                 currentPassword: SenhaAdmin@123
 *                 newPassword: NovaSenhaUsuario@456
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Senha atualizada com sucesso
 *       400:
 *         description: Dados inválidos ou senha incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               camposFaltando:
 *                 summary: Senhas não fornecidas
 *                 value:
 *                   message: Senha atual e nova senha são obrigatórias
 *               senhaAtualIncorreta:
 *                 summary: Senha atual não confere
 *                 value:
 *                   message: Senha atual incorreta
 *               senhaFraca:
 *                 summary: Nova senha muito curta
 *                 value:
 *                   message: A nova senha deve ter no mínimo 6 caracteres
 *               senhasIguais:
 *                 summary: Nova senha igual à atual
 *                 value:
 *                   message: A nova senha deve ser diferente da senha atual
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 summary: Token não fornecido
 *                 value:
 *                   message: Token não fornecido ou inválido
 *               tokenExpirado:
 *                 summary: Sessão expirada
 *                 value:
 *                   message: Token expirado. Faça login novamente
 *       403:
 *         description: Sem permissão para atualizar senha deste usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               permissaoNegada:
 *                 summary: Usuário tentando alterar senha de outro
 *                 value:
 *                   message: Você não tem permissão para atualizar a senha deste usuário
 *               naoAdministrador:
 *                 summary: Usuário comum sem permissão de admin
 *                 value:
 *                   message: Apenas administradores podem alterar senhas de outros usuários
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               usuarioNaoEncontrado:
 *                 summary: ID de usuário inexistente
 *                 value:
 *                   message: Usuário não encontrado
 *               usuarioDeletado:
 *                 summary: Usuário foi removido do sistema
 *                 value:
 *                   message: Usuário inativo ou deletado
 *       500:
 *         description: Erro interno ao atualizar senha
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroCriptografia:
 *                 summary: Erro ao hash da senha
 *                 value:
 *                   message: Erro ao processar nova senha
 *               erroBancoDados:
 *                 summary: Erro ao salvar no banco
 *                 value:
 *                   message: Erro ao atualizar senha no banco de dados
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao atualizar senha
 */
routerReset.put('/:id/update', authenticateToken, updatePassword);

export default routerReset; 
