import express from 'express';
import TeamController from '../controllers/TeamController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../services/uploadService';
import {
  getAllFriendlyMatchesHistory,
  getAllChampionshipMatchesHistory,
  getMatchesByChampionshipHistory
} from '../controllers/TeamHistoryController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Times
 *   description: Gerenciamento de times e elencos
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Listar times do usuário autenticado
 *     description: |
 *       Retorna todos os times onde o usuário é capitão ou membro.
 *       
 *       **Busca:** Times onde `captainId` = userId OU usuário está em `users`
 *       
 *       **Campos adicionais retornados:**
 *       - `banner`: Prefixado com `/uploads/teams/` (ou null)
 *       - `isCurrentUserCaptain`: Se usuário é o capitão
 *       - `quantidadePartidas`: Contador de MatchTeams.count
 *       
 *       **Inclui:** captain, users (attributes: id/name/email), players (isDeleted=false)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de times do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Team'
 *                   - type: object
 *                     properties:
 *                       banner:
 *                         type: string
 *                         nullable: true
 *                         description: URL do banner (prefixado com /uploads/teams/) ou null
 *                         example: /uploads/teams/banner-1234567890.jpg
 *                       isCurrentUserCaptain:
 *                         type: boolean
 *                         description: Se o usuário autenticado é o capitão deste time
 *                         example: true
 *                       quantidadePartidas:
 *                         type: integer
 *                         description: Número de partidas amistosas que o time participou
 *                         example: 5
 *                       captain:
 *                         type: object
 *                         description: Dados do capitão do time
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 10
 *                           name:
 *                             type: string
 *                             example: João Silva
 *                           email:
 *                             type: string
 *                             example: joao@email.com
 *                       users:
 *                         type: array
 *                         description: Membros do time
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                       players:
 *                         type: array
 *                         description: Jogadores do time (apenas não deletados)
 *                         items:
 *                           $ref: '#/components/schemas/Player'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao listar times
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao listar times
 */
router.get('/', authenticateToken, TeamController.listTeams);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Buscar detalhes de um time
 *     description: |
 *       Retorna dados completos de um time específico.
 *       
 *       **Validações:**
 *       - Time deve existir e não estar deletado
 *       - Usuário deve ser capitão OU membro do time (403 se não for)
 *       
 *       **Campo transformado:**
 *       - `banner`: Prefixado com `/uploads/teams/` (ou null)
 *       - `isCurrentUserCaptain`: Adicionado ao retorno
 *       
 *       **Inclui:** captain, users, players (isDeleted=false)
 *     tags: [Times]
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
 *         description: Dados do time
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     banner:
 *                       type: string
 *                       nullable: true
 *                       description: URL do banner ou null
 *                       example: /uploads/teams/banner-1234567890.jpg
 *                     isCurrentUserCaptain:
 *                       type: boolean
 *                       description: Se o usuário autenticado é o capitão
 *                       example: true
 *                     captain:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                     players:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Player'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Usuário não é capitão nem membro do time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Você não tem permissão para ver este time
 *       404:
 *         description: Time não encontrado ou deletado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro ao buscar time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar time
 */
router.get('/:teamId', authenticateToken, TeamController.getTeam);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Criar novo time
 *     description: |
 *       Cria um novo time com o usuário autenticado como capitão.
 *       
 *       **Lógica especial - Reutilização:**
 *       - Se já existe time deletado com mesmo nome: RESTAURA o time (isDeleted=false)
 *       - Se existe time ativo com mesmo nome: Retorna 409
 *       - Nome é normalizado: `name.trim()`
 *       
 *       **Associação automática:**
 *       - Adiciona usuário criador ao time (team.addUser)
 *       - Define usuário como capitão (captainId)
 *       
 *       **Upload de arquivo:**
 *       - Campo `banner` aceita upload de imagem
 *       - Salvo em `req.file.filename`
 *       
 *       **Retorno inclui:** players (isDeleted=false)
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do time (obrigatório, será normalizado com trim)
 *                 example: Novo Time FC
 *               description:
 *                 type: string
 *                 example: Time de futebol amador
 *               primaryColor:
 *                 type: string
 *                 example: '#0000FF'
 *               secondaryColor:
 *                 type: string
 *                 example: '#FFFF00'
 *               state:
 *                 type: string
 *                 example: SP
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               CEP:
 *                 type: string
 *                 example: 01000-000
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do banner do time
 *     responses:
 *       201:
 *         description: Time criado (ou restaurado) com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     players:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Player'
 *       400:
 *         description: Nome do time não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Nome do time é obrigatório
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       409:
 *         description: Nome do time já está em uso por time ativo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Este nome de time já está em uso. Escolha outro nome.
 *       500:
 *         description: Erro ao criar time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao criar time
 */
router.post('/', authenticateToken, upload.single('banner'), TeamController.createTeam);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   put:
 *     summary: Atualizar dados do time (apenas capitão)
 *     description: |
 *       Atualiza informações do time. Apenas o capitão pode executar.
 *       
 *       **Validações:**
 *       - 404: Time não encontrado ou deletado
 *       - 403: Usuário não é capitão (captainId !== userId)
 *       - 400: Nome já em uso por outro time ativo (se alterando nome)
 *       
 *       **Campos req.body:**
 *       - `name` → normalizado com trim()
 *       - `estado` → salvo como `state`
 *       - `cidade` → salvo como `city`
 *       - `cep` → salvo como `CEP`
 *       - `jogadores` → JSON.parse, chama handlePlayersAssociations
 *       
 *       **Upload de arquivo:**
 *       - Se `req.file` existe: deleta banner antigo, usa novo filename
 *       
 *       **Retorno transformado:**
 *       - `banner`: Prefixado com `/uploads/teams/` ou null
 *       - Inclui: players (isDeleted=false)
 *     tags: [Times]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do time (será normalizado com trim)
 *                 example: Time Atualizado
 *               description:
 *                 type: string
 *                 example: Descrição atualizada do time
 *               primaryColor:
 *                 type: string
 *                 example: '#FF0000'
 *               secondaryColor:
 *                 type: string
 *                 example: '#FFFFFF'
 *               estado:
 *                 type: string
 *                 description: Salvo como 'state' no banco
 *                 example: PR
 *               cidade:
 *                 type: string
 *                 description: Salvo como 'city' no banco
 *                 example: Curitiba
 *               cep:
 *                 type: string
 *                 description: Salvo como 'CEP' no banco
 *                 example: 80000-000
 *               jogadores:
 *                 type: string
 *                 description: JSON stringificado com array de jogadores (opcional)
 *                 example: '[{"id":1},{"id":5}]'
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Nova imagem do banner (opcional, deleta anterior se existir)
 *     responses:
 *       200:
 *         description: Time atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: object
 *                   properties:
 *                     banner:
 *                       type: string
 *                       nullable: true
 *                       description: URL do banner prefixado
 *                       example: /uploads/teams/banner-1234567890.jpg
 *                     players:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Player'
 *             example:
 *               id: 1
 *               name: Time Atualizado FC
 *               description: Descrição atualizada do time
 *               banner: /uploads/teams/banner-1234567890.jpg
 *               primaryColor: '#FF0000'
 *               secondaryColor: '#FFFFFF'
 *               captainId: 1
 *               city: Curitiba
 *               state: PR
 *               CEP: 80000-000
 *               isDeleted: false
 *       400:
 *         description: Nome do time já em uso por outro time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Este nome de time já está em uso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Apenas o capitão pode atualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode atualizar o time
 *       404:
 *         description: Time não encontrado ou deletado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro ao atualizar time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar time
 */
router.put('/:teamId', authenticateToken, upload.single('banner'), TeamController.updateTeam);

/**
 * @swagger
 * /api/teams/{teamId}:
 *   delete:
 *     summary: Deletar time (soft delete, apenas capitão)
 *     description: |
 *       Marca o time como deletado (isDeleted=true). Apenas o capitão pode executar.
 *       
 *       **Efeito colateral:**
 *       - Deleta TODAS associações TeamPlayer do time (destroy, não soft delete)
 *       - Define isDeleted=true no time
 *       
 *       **Validações:**
 *       - 400: Se `confirm` não for true
 *       - 404: Time não encontrado ou já deletado
 *       - 403: Usuário não é capitão
 *       
 *       **Retorno:**
 *       - message + objeto {id, name} do time deletado
 *     tags: [Times]
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
 *               - confirm
 *             properties:
 *               confirm:
 *                 type: boolean
 *                 description: Deve ser true para confirmar a exclusão
 *                 example: true
 *     responses:
 *       200:
 *         description: Time deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time deletado com sucesso
 *                 team:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Meu Time FC
 *       400:
 *         description: Confirmação não fornecida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Confirmação necessária. Para deletar o time, envie confirm: true no corpo da requisição
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       403:
 *         description: Apenas o capitão pode deletar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o capitão pode deletar o time
 *       404:
 *         description: Time não encontrado ou já deletado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Time não encontrado
 *       500:
 *         description: Erro ao deletar time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar time
 */
router.delete('/:teamId', authenticateToken, TeamController.deleteTeam);

/**
 * @swagger
 * /api/teams/{idteamCaptain}/teamCaptain:
 *   get:
 *     summary: Buscar time onde usuário é capitão
 *     description: |
 *       Retorna o time onde o usuário especificado é capitão.
 *       
 *       **Atenção:** Nome do parâmetro é confuso!
 *       - Parâmetro: `idteamCaptain` (ID do USUÁRIO capitão, não ID do time)
 *       - Busca: Team.findOne WHERE captainId = idteamCaptain
 *       
 *       **Retorna:** Objeto Team completo (ou null se não encontrado)
 *       
 *       **Não retorna erro 404:** Apenas retorna null se não encontrar
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idteamCaptain
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do USUÁRIO capitão (não é ID do time)
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados do time onde usuário é capitão (ou null)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Team'
 *                 - type: 'null'
 *             examples:
 *               encontrado:
 *                 summary: Time encontrado
 *                 value:
 *                   id: 5
 *                   name: Meu Time FC
 *                   captainId: 1
 *                   description: Time de futebol
 *                   isDeleted: false
 *               naoEncontrado:
 *                 summary: Usuário não é capitão de nenhum time
 *                 value: null
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao buscar dados do time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar dados do time
 */
router.get('/:idteamCaptain/teamCaptain', authenticateToken, TeamController.getTeamCaptain);

/**
 * @swagger
 * /api/teams/{championshipId}/championship-ranking:
 *   get:
 *     summary: Buscar ranking de times em um campeonato
 *     description: |
 *       Retorna o ranking de todos os times participantes de um campeonato.
 *       
 *       **Busca:**
 *       - Encontra times via TeamChampionship (championshipId)
 *       - Calcula estatísticas via MatchChampionshipReport (team_home OU team_away)
 *       
 *       **Cálculo de pontuação:**
 *       - Vitória: +3 pontos
 *       - Empate: +1 ponto
 *       - Derrota: 0 pontos
 *       
 *       **Ordenação:**
 *       1. Pontuação (decrescente)
 *       2. Saldo de gols (decrescente)
 *       
 *       **Inclui aliases:** reportTeamHome, reportTeamAway
 *     tags: [Times]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: championshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Ranking do campeonato ordenado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pontuacaoTime:
 *                     type: integer
 *                     description: Pontos totais do time
 *                     example: 12
 *                   nomeTime:
 *                     type: string
 *                     description: Nome do time
 *                     example: FC Barcelona Várzea
 *                   goalsScore:
 *                     type: integer
 *                     description: Total de gols marcados
 *                     example: 15
 *                   againstgoals:
 *                     type: integer
 *                     description: Total de gols sofridos
 *                     example: 8
 *                   countVitorias:
 *                     type: integer
 *                     description: Número de vitórias
 *                     example: 4
 *                   countDerrotas:
 *                     type: integer
 *                     description: Número de derrotas
 *                     example: 1
 *                   countEmpates:
 *                     type: integer
 *                     description: Número de empates
 *                     example: 0
 *                   saldogoals:
 *                     type: integer
 *                     description: Saldo de gols (marcados - sofridos)
 *                     example: 7
 *             example:
 *               - pontuacaoTime: 12
 *                 nomeTime: FC Barcelona Várzea
 *                 goalsScore: 15
 *                 againstgoals: 8
 *                 countVitorias: 4
 *                 countDerrotas: 1
 *                 countEmpates: 0
 *                 saldogoals: 7
 *               - pontuacaoTime: 9
 *                 nomeTime: PSG Amador
 *                 goalsScore: 10
 *                 againstgoals: 6
 *                 countVitorias: 3
 *                 countDerrotas: 1
 *                 countEmpates: 0
 *                 saldogoals: 4
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao buscar ranking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar ranking do campeonato
 */
router.get('/:championshipId/championship-ranking', authenticateToken, TeamController.getTeamRanking);

/**
 * @swagger
 * /api/teams/{teamId}/player-stats:
 *   get:
 *     summary: Buscar estatísticas dos jogadores do time
 *     description: |
 *       Retorna estatísticas de gols e cartões de todos os jogadores do time.
 *       
 *       **Validações:**
 *       - 404: Time não encontrado ou deletado
 *       - 403: Usuário não é capitão nem membro
 *       
 *       **Fonte de dados:**
 *       - Partidas: Via MatchTeams (teamId) → matchIds
 *       - Gols: FriendlyMatchGoal (player_id IN playerIds, match_id IN matchIds)
 *       - Cartões: FriendlyMatchCard (card_type='yellow'/'red')
 *       
 *       **Ordenação:**
 *       1. Gols (decrescente)
 *       2. Cartões totais (decrescente)
 *       3. Nome (alfabética)
 *       
 *       **Retorno:**
 *       - Objeto com {teamId, total, stats[]}
 *       - Se time sem partidas: retorna stats com zeros
 *     tags: [Times]
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
 *         description: Estatísticas dos jogadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamId:
 *                   type: integer
 *                   description: ID do time
 *                   example: 1
 *                 total:
 *                   type: integer
 *                   description: Total de jogadores no time
 *                   example: 15
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: integer
 *                         example: 5
 *                       nome:
 *                         type: string
 *                         description: Nome do jogador
 *                         example: Carlos Silva
 *                       posicao:
 *                         type: string
 *                         nullable: true
 *                         description: Posição do jogador
 *                         example: Atacante
 *                       sexo:
 *                         type: string
 *                         nullable: true
 *                         description: Gênero do jogador
 *                         example: Masculino
 *                       gols:
 *                         type: integer
 *                         description: Total de gols marcados
 *                         example: 8
 *                       amarelos:
 *                         type: integer
 *                         description: Total de cartões amarelos
 *                         example: 2
 *                       vermelhos:
 *                         type: integer
 *                         description: Total de cartões vermelhos
 *                         example: 0
 *                       cartoes:
 *                         type: integer
 *                         description: Total de cartões (amarelos + vermelhos)
 *                         example: 2
 *             example:
 *               teamId: 1
 *               total: 2
 *               stats:
 *                 - playerId: 5
 *                   nome: Carlos Silva
 *                   posicao: Atacante
 *                   sexo: Masculino
 *                   gols: 8
 *                   amarelos: 2
 *                   vermelhos: 0
 *                   cartoes: 2
 *                 - playerId: 12
 *                   nome: Ana Costa
 *                   posicao: Meio-campo
 *                   sexo: Feminino
 *                   gols: 3
 *                   amarelos: 1
 *                   vermelhos: 1
 *                   cartoes: 2
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Usuário não autenticado
 *       403:
 *         description: Usuário não é capitão nem membro do time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Acesso negado a este time
 *       404:
 *         description: Time não encontrado ou deletado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Time não encontrado
 *       500:
 *         description: Erro ao gerar estatísticas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao gerar estatísticas
 */
router.get('/:teamId/player-stats', authenticateToken, TeamController.getPlayerStats);

/**
 * @swagger
 * /api/teams/{teamId}/history/friendly-matches:
 *   get:
 *     summary: Listar histórico de partidas amistosas de um time
 *     description: |
 *       Retorna todas as partidas amistosas (finalizadas com súmula) que o time participou.
 *       
 *       **Busca:** Time como mandante (team_home) OU visitante (team_away)
 *       
 *       **Validação:** Retorna 400 se teamId for inválido (não numérico)
 *       
 *       **Resposta:** Array com súmulas + includes de reportFriendlyMatch, teamHome, teamAway
 *     tags: [Times]
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
 *         description: Lista de partidas amistosas (pode ser array vazio)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da súmula
 *                   match_id:
 *                     type: integer
 *                     description: ID da partida
 *                   team_home:
 *                     type: integer
 *                   team_away:
 *                     type: integer
 *                   teamHome_score:
 *                     type: integer
 *                   teamAway_score:
 *                     type: integer
 *                   reportFriendlyMatch:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       location:
 *                         type: string
 *                       square:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                   teamHome:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   teamAway:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       400:
 *         description: ID do time inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: ID do time inválido
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao buscar histórico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar partidas amistosas
 */
router.get('/:teamId/history/friendly-matches', authenticateToken, getAllFriendlyMatchesHistory);

/**
 * @swagger
 * /api/teams/{teamId}/history/championship-matches:
 *   get:
 *     summary: Listar histórico de partidas de campeonatos de um time
 *     description: |
 *       Retorna todas as partidas de campeonatos (finalizadas com súmula) que o time participou.
 *       
 *       **Busca:** Time como mandante (team_home) OU visitante (team_away)
 *       
 *       **Filtro opcional:** Query param `championshipId` para filtrar por campeonato específico
 *       
 *       **Validação:** Retorna 400 se teamId for inválido (não numérico)
 *       
 *       **Resposta:** Array com súmulas + includes de championshipMatch, reportTeamHome, reportTeamAway
 *     tags: [Times]
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
 *       - in: query
 *         name: championshipId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtrar por campeonato específico (opcional)
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista de partidas de campeonatos (pode ser array vazio)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da súmula
 *                   match_id:
 *                     type: integer
 *                     description: ID da partida de campeonato
 *                   team_home:
 *                     type: integer
 *                   team_away:
 *                     type: integer
 *                   teamHome_score:
 *                     type: integer
 *                   teamAway_score:
 *                     type: integer
 *                   championshipMatch:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                       quadra:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       matchChampionship:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           start_date:
 *                             type: string
 *                             format: date
 *                           end_date:
 *                             type: string
 *                             format: date
 *                   reportTeamHome:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                   reportTeamAway:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       400:
 *         description: ID do time inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: ID do time inválido
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao buscar histórico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar partidas de campeonatos
 */
router.get('/:teamId/history/championship-matches', authenticateToken, getAllChampionshipMatchesHistory);

/**
 * @swagger
 * /api/teams/{teamId}/history/championships/{championshipId}/matches:
 *   get:
 *     summary: Listar partidas de um time em um campeonato específico (formatado)
 *     description: |
 *       Retorna partidas do time em um campeonato com resposta formatada e simplificada.
 *       
 *       **Diferença do endpoint anterior:** Resposta FORMATADA com estrutura simplificada
 *       
 *       **Busca:** Time como mandante (team_home) OU visitante (team_away)
 *       
 *       **Resposta formatada:**
 *       - matchId, location, date
 *       - teamHome, teamAway: Nomes dos times (strings)
 *       - score: Objeto com home e away
 *     tags: [Times]
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
 *         name: championshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 5
 *     responses:
 *       200:
 *         description: Lista formatada de partidas do time no campeonato
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   matchId:
 *                     type: integer
 *                   location:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   teamHome:
 *                     type: string
 *                   teamAway:
 *                     type: string
 *                   score:
 *                     type: object
 *                     properties:
 *                       home:
 *                         type: integer
 *                       away:
 *                         type: integer
 *             example:
 *               - matchId: 20
 *                 location: "Rua Central, 100"
 *                 date: "2025-03-10T18:00:00.000Z"
 *                 teamHome: "FC Barcelona Várzea"
 *                 teamAway: "PSG Amador"
 *                 score:
 *                   home: 4
 *                   away: 2
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não autenticado
 *       500:
 *         description: Erro ao buscar partidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar partidas do campeonato
 */
router.get('/:teamId/history/championships/:championshipId/matches', authenticateToken, getMatchesByChampionshipHistory);

export default router;