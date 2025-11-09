import express from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { authenticateToken } from '../middleware/auth';
import {getTeamsPlayers} from '../controllers/TeamPlayersController';
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
 *     description: |
 *       Cria um novo jogador ou reutiliza jogador existente sem vínculo.
 *       
 *       **Campos obrigatórios:** name, gender, dateOfBirth, position
 *       
 *       **Campo opcional:** teamId (vincula ao time se fornecido)
 *       
 *       **Validações:**
 *       - Nome é normalizado (trim + lowercase)
 *       - Se teamId fornecido: apenas capitão pode adicionar jogadores
 *       - Se teamId fornecido: verifica duplicata no mesmo time (409)
 *       - Se jogador existe e está vinculado a outro time: retorna 409
 *       - Se jogador existe sem vínculo: reutiliza ao invés de criar novo
 *       
 *       **Resposta:** Retorna dados do jogador (sem message)
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
 *               - dateOfBirth
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do jogador (será normalizado - trim + lowercase)
 *                 example: Carlos Oliveira
 *               gender:
 *                 type: string
 *                 description: Gênero do jogador
 *                 enum: [Masculino, Feminino]
 *                 example: Masculino
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento (obrigatório)
 *                 example: '1995-03-15'
 *               position:
 *                 type: string
 *                 description: Posição do jogador (obrigatório)
 *                 example: Atacante
 *               teamId:
 *                 type: integer
 *                 description: ID do time para vincular o jogador (opcional - requer permissão de capitão)
 *                 example: 1
 *           examples:
 *             semTime:
 *               summary: Criar jogador sem vincular a time
 *               value:
 *                 name: Carlos Oliveira
 *                 gender: Masculino
 *                 dateOfBirth: '1995-03-15'
 *                 position: Atacante
 *             comTime:
 *               summary: Criar e vincular a time
 *               value:
 *                 name: João Silva
 *                 gender: Masculino
 *                 dateOfBirth: '1998-07-22'
 *                 position: Goleiro
 *                 teamId: 1
 *     responses:
 *       201:
 *         description: Jogador criado/reutilizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 nome:
 *                   type: string
 *                   example: carlos oliveira
 *                 sexo:
 *                   type: string
 *                   example: Masculino
 *                 dateOfBirth:
 *                   type: string
 *                   example: '1995-03-15'
 *                 age:
 *                   type: integer
 *                   example: 30
 *                 posicao:
 *                   type: string
 *                   example: Atacante
 *                 isDeleted:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Dados inválidos - campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Todos os campos são obrigatórios
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - apenas capitão pode adicionar jogadores ao time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode adicionar jogadores ao time
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       409:
 *         description: Conflito - Jogador já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               duplicadoMesmoTime:
 *                 value:
 *                   message: Jogador duplicado neste time
 *                   detalhes: Já existe um jogador com o nome "Carlos Oliveira" cadastrado neste time
 *               vinculadoOutroTime:
 *                 value:
 *                   message: Jogador já vinculado a outro time
 *                   detalhes: O jogador "Carlos Oliveira" já está cadastrado no time "FC Barcelona"
 *               jaCadastrado:
 *                 value:
 *                   message: Jogador já cadastrado neste time
 *                   detalhes: Este jogador já está vinculado a este time
 *       500:
 *         description: Erro ao criar jogador
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
 *     description: |
 *       Retorna todos os jogadores vinculados a um time específico (apenas não deletados).
 *       
 *       **Resposta:** Array de jogadores com campos mapeados (nome, sexo, posicao, age)
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: carlos oliveira
 *                   sexo:
 *                     type: string
 *                     example: Masculino
 *                   dateOfBirth:
 *                     type: string
 *                     example: '1995-03-15'
 *                   age:
 *                     type: integer
 *                     example: 30
 *                   posicao:
 *                     type: string
 *                     example: Atacante
 *                   isDeleted:
 *                     type: boolean
 *                     example: false
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro ao buscar jogadores do time
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
 *     summary: Remover jogador de um time (desvincular)
 *     description: |
 *       Remove o vínculo entre jogador e time (não deleta o jogador).
 *       
 *       **Permissão:** Apenas o capitão do time pode remover jogadores.
 *       
 *       **Ação:** Deleta registro em TeamPlayer, mantém jogador no sistema.
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
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do jogador
 *         example: 5
 *     responses:
 *       200:
 *         description: Jogador removido do time com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador removido do time com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - apenas capitão pode remover jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode remover jogadores do time
 *       404:
 *         description: Time ou jogador não encontrado no time
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
 *                   message: Jogador não encontrado no time
 *       500:
 *         description: Erro ao remover jogador do time
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
 *     description: |
 *       Permite atualizar ou adicionar múltiplos jogadores ao time de uma vez.
 *       
 *       **Permissão:** Apenas o capitão do time pode realizar esta operação.
 *       
 *       **Campos obrigatórios por jogador:** name, gender, dateOfBirth, position
 *       
 *       **Lógica:**
 *       - Se jogador tem `id`: atualiza jogador existente
 *       - Se jogador sem `id` e nome já existe sem vínculo: reutiliza e vincula
 *       - Se jogador sem `id` e nome já existe vinculado a outro time: erro
 *       - Se jogador sem `id` e nome não existe: cria novo e vincula
 *       
 *       **Validações:**
 *       - Nome é normalizado (trim + lowercase)
 *       - Ao atualizar: verifica se novo nome já existe em outro jogador
 *       - Ao atualizar: verifica se novo nome já está vinculado a outro time
 *       
 *       **Resposta com erros parciais:** Status 207 se alguns jogadores falharam
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
 *                   required:
 *                     - name
 *                     - gender
 *                     - dateOfBirth
 *                     - position
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID do jogador (opcional - se fornecido, atualiza; se não, cria novo)
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: Nome do jogador (obrigatório - será normalizado)
 *                       example: Carlos Oliveira
 *                     gender:
 *                       type: string
 *                       description: Gênero do jogador (obrigatório)
 *                       enum: [Masculino, Feminino]
 *                       example: Masculino
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       description: Data de nascimento (obrigatório)
 *                       example: '1996-05-20'
 *                     position:
 *                       type: string
 *                       description: Posição do jogador (obrigatório)
 *                       example: Zagueiro
 *           examples:
 *             atualizacaoMista:
 *               summary: Atualização + criação de jogadores
 *               value:
 *                 players:
 *                   - id: 1
 *                     name: Carlos Oliveira
 *                     gender: Masculino
 *                     dateOfBirth: '1995-03-15'
 *                     position: Atacante
 *                   - id: 2
 *                     name: João Silva
 *                     gender: Masculino
 *                     dateOfBirth: '1998-07-22'
 *                     position: Goleiro
 *                   - name: Pedro Santos
 *                     gender: Masculino
 *                     dateOfBirth: '2000-11-10'
 *                     position: Zagueiro
 *     responses:
 *       200:
 *         description: Todos os jogadores foram processados com sucesso
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       sexo:
 *                         type: string
 *                       dateOfBirth:
 *                         type: string
 *                       age:
 *                         type: integer
 *                       posicao:
 *                         type: string
 *                       isDeleted:
 *                         type: boolean
 *       207:
 *         description: Multi-Status - Alguns jogadores processados, outros com erro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Alguns jogadores foram processados com sucesso, outros apresentaram erros
 *                 processados:
 *                   type: integer
 *                   example: 2
 *                 comErro:
 *                   type: integer
 *                   example: 1
 *                 erros:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       player:
 *                         type: string
 *                       motivo:
 *                         type: string
 *                       detalhes:
 *                         type: string
 *                 jogadoresProcessados:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Dados inválidos ou nenhum jogador processado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               listaInvalida:
 *                 value:
 *                   message: Lista de jogadores inválida
 *               nenhumProcessado:
 *                 value:
 *                   message: Nenhum jogador pôde ser processado
 *                   processados: 0
 *                   comErro: 3
 *                   erros:
 *                     - player: João
 *                       motivo: Campos obrigatórios faltando
 *                       detalhes: É necessário preencher: nome, gênero, data de nascimento e posição
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - apenas capitão pode atualizar jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode atualizar jogadores do time
 *       404:
 *         description: Time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro ao atualizar jogadores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar jogadores
 */
router.put('/team/:id/update-all', PlayerController.update);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Deletar jogador (soft delete)
 *     description: |
 *       Realiza soft delete do jogador (isDeleted = true).
 *       
 *       **Permissão:** Apenas o capitão de um time que possui o jogador pode deletá-lo.
 *       
 *       **Ação:**
 *       1. Remove todos os vínculos TeamPlayer do jogador
 *       2. Marca jogador como deletado (isDeleted = true)
 *       
 *       **Validação:** Busca times onde userId é capitão E jogador está vinculado.
 *     tags: [Jogadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do jogador
 *         example: 1
 *     responses:
 *       200:
 *         description: Jogador excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Jogador excluído com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Sem permissão - usuário não é capitão de nenhum time que possui este jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão do time pode excluir o jogador
 *       404:
 *         description: Jogador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Jogador não encontrado
 *       500:
 *         description: Erro ao excluir jogador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao excluir jogador
 */
router.delete('/:id', PlayerController.delete);

/**
 * @swagger
 * /api/players/{teamId}:
 *   get:
 *     summary: Buscar jogadores de um time (via TeamPlayer)
 *     description: |
 *       Retorna todos os jogadores vinculados a um time através da tabela TeamPlayer.
 *       
 *       **Diferença de `/team/{teamId}`:**
 *       - Esta rota retorna campos duplicados (nome/name, sexo/gender, posicao/position)
 *       - Não inclui `age` nem `isDeleted` na resposta
 *       - Usa alias 'player' para buscar dados do jogador
 *       
 *       **Filtros:**
 *       - Apenas jogadores não deletados (isDeleted: false)
 *       
 *       **Resposta:** Array de jogadores com campos mapeados duplicados
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     description: Nome do jogador (duplicado com 'name')
 *                     example: carlos oliveira
 *                   name:
 *                     type: string
 *                     description: Nome do jogador (duplicado com 'nome')
 *                     example: carlos oliveira
 *                   gender:
 *                     type: string
 *                     description: Gênero do jogador (duplicado com 'sexo')
 *                     example: Masculino
 *                   sexo:
 *                     type: string
 *                     description: Gênero do jogador (duplicado com 'gender')
 *                     example: Masculino
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                     example: '1995-03-15'
 *                   posicao:
 *                     type: string
 *                     description: Posição do jogador (duplicado com 'position')
 *                     example: Atacante
 *                   position:
 *                     type: string
 *                     description: Posição do jogador (duplicado com 'posicao')
 *                     example: Atacante
 *             example:
 *               - id: 1
 *                 nome: carlos oliveira
 *                 name: carlos oliveira
 *                 gender: Masculino
 *                 sexo: Masculino
 *                 dateOfBirth: '1995-03-15'
 *                 posicao: Atacante
 *                 position: Atacante
 *               - id: 2
 *                 nome: joão silva
 *                 name: joão silva
 *                 gender: Masculino
 *                 sexo: Masculino
 *                 dateOfBirth: '1998-07-22'
 *                 posicao: Goleiro
 *                 position: Goleiro
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao obter jogadores do time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao obter jogadores do time
 */
router.get('/:teamId', getTeamsPlayers);

export default router; 