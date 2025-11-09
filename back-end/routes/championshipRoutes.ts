import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createChampionship, 
  listChampionships, 
  getChampionship, 
  updateChampionship, 
  deleteChampionship, 
  joinTeamInChampionship, 
  getChampionshipTeams, 
  leaveTeamFromChampionship,
  applyToChampionship,
  getChampionshipApplications,
  updateApplicationStatus,
  publishChampionship
} from '../controllers/championshipController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Campeonatos
 *   description: Endpoints para gerenciamento de campeonatos
 */

/**
 * @swagger
 * /api/championships:
 *   post:
 *     summary: Criar um novo campeonato
 *     description: Cria campeonato com status 'draft'. Valida nome único (normalizado lowercase), datas (início >= hoje, fim > início), tipo (Liga ou Mata-Mata). Liga requer num_equipes_liga (4-20). Mata-Mata com fase_grupos=true requer num_grupos (2-8) e times_por_grupo (3-6), validando se total de times <= max_teams.
 *     tags: [Campeonatos]
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
 *               - start_date
 *               - end_date
 *               - modalidade
 *               - nomequadra
 *               - tipo
 *               - genero
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do campeonato (será normalizado para lowercase na validação de unicidade)
 *                 example: Campeonato Várzea 2025
 *               description:
 *                 type: string
 *                 description: Descrição opcional do campeonato
 *                 example: Campeonato de futebol society
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Data de início (não pode ser no passado, validação normaliza para 00:00:00)
 *                 example: 2025-01-15
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Data de término (deve ser posterior à data de início)
 *                 example: 2025-03-15
 *               modalidade:
 *                 type: string
 *                 description: Modalidade do campeonato (ex. Futsal, Futebol Society)
 *                 enum: [Futebol de Campo, Futebol Society, Futsal]
 *                 example: Futebol Society
 *               nomequadra:
 *                 type: string
 *                 description: Nome da quadra onde será realizado
 *                 example: Arena Sports Center
 *               tipo:
 *                 type: string
 *                 enum: [Liga, Mata-Mata]
 *                 description: Tipo do campeonato (será normalizado para 'liga' ou 'mata-mata' no BD)
 *                 example: Mata-Mata
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Misto]
 *                 description: Gênero do campeonato (será normalizado para 'masculino', 'feminino' ou 'misto')
 *                 example: Masculino
 *               fase_grupos:
 *                 type: boolean
 *                 description: Se Mata-Mata terá fase de grupos (ignorado para Liga, que sempre é false)
 *                 example: true
 *               max_teams:
 *                 type: integer
 *                 description: Número máximo de times permitidos (padrão 8 se não especificado)
 *                 example: 16
 *               num_grupos:
 *                 type: integer
 *                 description: Número de grupos para Mata-Mata com fase_grupos=true (entre 2 e 8). Ignorado para Liga ou Mata-Mata sem fase de grupos.
 *                 example: 4
 *               times_por_grupo:
 *                 type: integer
 *                 description: Times por grupo para Mata-Mata com fase_grupos=true (entre 3 e 6). Total (num_grupos * times_por_grupo) deve ser <= max_teams. Ignorado para Liga.
 *                 example: 4
 *               num_equipes_liga:
 *                 type: integer
 *                 description: Número de equipes para campeonato tipo Liga (obrigatório se tipo=Liga, entre 4 e 20). Ignorado para Mata-Mata.
 *                 example: 10
 *     responses:
 *       201:
 *         description: Campeonato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Campeonato Várzea 2025
 *                 status:
 *                   type: string
 *                   example: draft
 *       400:
 *         description: Dados inválidos ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campoObrigatorio:
 *                 value:
 *                   message: Nome do campeonato é obrigatório
 *               modalidadeObrigatoria:
 *                 value:
 *                   message: Modalidade é obrigatória
 *               nomequadraObrigatorio:
 *                 value:
 *                   message: Nome da quadra é obrigatório
 *               tipoObrigatorio:
 *                 value:
 *                   message: Tipo do campeonato é obrigatório
 *               generoObrigatorio:
 *                 value:
 *                   message: Gênero é obrigatório
 *               dataInicioObrigatoria:
 *                 value:
 *                   message: Data de início é obrigatória
 *               dataFimObrigatoria:
 *                 value:
 *                   message: Data de término é obrigatória
 *               dataInicioInvalida:
 *                 value:
 *                   message: Data de início inválida
 *               dataFimInvalida:
 *                 value:
 *                   message: Data de término inválida
 *               dataPassado:
 *                 value:
 *                   message: Data de início não pode ser no passado
 *               dataFimAnterior:
 *                 value:
 *                   message: Data de término deve ser posterior à data de início
 *               ligaEquipesInvalidas:
 *                 value:
 *                   message: Para Liga, especifique entre 4 e 20 equipes
 *               gruposInvalidos:
 *                 value:
 *                   message: Número de grupos deve ser entre 2 e 8
 *               timesPorGrupoInvalido:
 *                 value:
 *                   message: Times por grupo deve ser entre 3 e 6
 *               totalTimesExcedido:
 *                 value:
 *                   message: Total de times (16) excede o máximo permitido (8)
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token ausente
 *       409:
 *         description: Conflito - nome duplicado ou tipo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nomeDuplicado:
 *                 value:
 *                   message: Já existe um campeonato com este nome
 *               tipoInvalido:
 *                 value:
 *                   message: Tipo de campeonato inválido. Use Liga, Mata-Mata
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao criar campeonato
 *               error: Erro desconhecido
 */
router.post('/', authenticateToken, createChampionship);

/**
 * @swagger
 * /api/championships:
 *   get:
 *     summary: Listar todos os campeonatos
 *     description: Lista campeonatos com filtros opcionais. Busca por termo em nome/descrição, filtra por datas, tipo, gênero, modalidade e status. Ordena por data de início (padrão ASC). Controller aceita 'from/to' (legado, não usados) e 'search' (ignorado, use searchChampionships).
 *     tags: [Campeonatos]
 *     parameters:
 *       - in: query
 *         name: championshipDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de início >= esta data
 *         example: 2025-01-01
 *       - in: query
 *         name: championshipDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por data de início <= esta data (hora setada para 23:59:59)
 *         example: 2025-12-31
 *       - in: query
 *         name: searchChampionships
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição (LIKE %termo%)
 *         example: Campeonato
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Liga, Mata-Mata, liga, mata-mata]
 *         description: Filtrar por tipo (normalizado para lowercase no BD)
 *         example: Liga
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [Masculino, Feminino, Misto, masculino, feminino, misto]
 *         description: Filtrar por gênero (normalizado para lowercase)
 *         example: Masculino
 *       - in: query
 *         name: modalidade
 *         schema:
 *           type: string
 *         description: Filtrar por modalidade (LIKE %modalidade%)
 *         example: Futebol Society
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, open, closed, in_progress, finished]
 *         description: Filtrar por status (já em lowercase)
 *         example: open
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date_asc, date_desc]
 *         description: Ordenação por start_date (padrão date_asc se inválido ou ausente)
 *         example: date_desc
 *     responses:
 *       200:
 *         description: Lista de campeonatos
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
 *                   name:
 *                     type: string
 *                     example: Campeonato Várzea 2025
 *                   description:
 *                     type: string
 *                     example: Campeonato de futebol society
 *                   start_date:
 *                     type: string
 *                     format: date
 *                     example: 2025-01-15
 *                   end_date:
 *                     type: string
 *                     format: date
 *                     example: 2025-03-15
 *                   modalidade:
 *                     type: string
 *                     example: Futebol Society
 *                   status:
 *                     type: string
 *                     example: Publicado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', listChampionships);

/**
 * @swagger
 * /api/championships/{id}:
 *   get:
 *     summary: Buscar detalhes de um campeonato específico
 *     tags: [Campeonatos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalhes do campeonato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Campeonato Várzea 2025
 *                 description:
 *                   type: string
 *                   example: Campeonato de futebol society
 *                 start_date:
 *                   type: string
 *                   format: date
 *                 end_date:
 *                   type: string
 *                   format: date
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Campeonato não encontrado
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
router.get('/:id', getChampionship);

/**
 * @swagger
 * /api/championships/{id}:
 *   put:
 *     summary: Atualizar um campeonato
 *     description: Atualiza campeonato existente. Valida unicidade de nome (excluindo próprio ID), permissão (apenas criador), datas (se alteradas, início >= hoje, fim > início). Valida configurações por tipo (Liga 4-20 equipes, Mata-Mata com fase_grupos requer num_grupos 2-8 e times_por_grupo 3-6). Campos não enviados não são alterados. Ao alterar tipo, campos incompatíveis são setados para null.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato a ser atualizado
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Todos os campos são opcionais. Apenas os campos enviados serão atualizados.
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do campeonato (validado unicidade excluindo próprio ID)
 *                 example: Campeonato Várzea 2025 Atualizado
 *               description:
 *                 type: string
 *                 description: Descrição do campeonato
 *                 example: Descrição atualizada
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Data de início (validação se alterada - não pode ser no passado)
 *                 example: 2025-02-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Data de término (validação se alterada - deve ser > start_date)
 *                 example: 2025-04-01
 *               modalidade:
 *                 type: string
 *                 description: Modalidade do campeonato
 *                 example: Futebol Society
 *               nomequadra:
 *                 type: string
 *                 description: Nome da quadra
 *                 example: Arena Sports Center
 *               tipo:
 *                 type: string
 *                 enum: [Liga, Mata-Mata]
 *                 description: Tipo do campeonato (ao mudar de Liga para Mata-Mata, num_equipes_liga vira null. Vice-versa, num_grupos e times_por_grupo viram null)
 *                 example: Mata-Mata
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Feminino, Misto, masculino, feminino, misto]
 *                 description: Gênero do campeonato (normalizado para lowercase)
 *                 example: Masculino
 *               fase_grupos:
 *                 type: boolean
 *                 description: Se Mata-Mata terá fase de grupos. Se false, num_grupos e times_por_grupo viram null.
 *                 example: true
 *               max_teams:
 *                 type: integer
 *                 description: Número máximo de times
 *                 example: 16
 *               num_grupos:
 *                 type: integer
 *                 description: Número de grupos para Mata-Mata com fase_grupos (2-8)
 *                 example: 4
 *               times_por_grupo:
 *                 type: integer
 *                 description: Times por grupo para Mata-Mata com fase_grupos (3-6)
 *                 example: 4
 *               num_equipes_liga:
 *                 type: integer
 *                 description: Número de equipes para Liga (4-20)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Campeonato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Retorna o objeto do campeonato atualizado completo
 *       400:
 *         description: Dados inválidos ou validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nomeVazio:
 *                 value:
 *                   message: Nome do campeonato é obrigatório
 *               modalidadeVazia:
 *                 value:
 *                   message: Modalidade é obrigatória
 *               nomequadraVazio:
 *                 value:
 *                   message: Nome da quadra é obrigatório
 *               dataInicioInvalida:
 *                 value:
 *                   message: Data de início inválida
 *               dataFimInvalida:
 *                 value:
 *                   message: Data de término inválida
 *               dataPassado:
 *                 value:
 *                   message: Data de início não pode ser no passado
 *               dataFimAnterior:
 *                 value:
 *                   message: Data de término deve ser posterior à data de início
 *               ligaEquipesInvalidas:
 *                 value:
 *                   message: Para Liga, especifique entre 4 e 20 equipes
 *               gruposInvalidos:
 *                 value:
 *                   message: Número de grupos deve ser entre 2 e 8
 *               timesPorGrupoInvalido:
 *                 value:
 *                   message: Times por grupo deve ser entre 3 e 6
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token ausente
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido
 *       403:
 *         description: Sem permissão - apenas criador pode editar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o criador pode editar este campeonato
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Campeonato não encontrado
 *       409:
 *         description: Conflito - nome duplicado ou tipo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               nomeDuplicado:
 *                 value:
 *                   message: Já existe outro campeonato com este nome
 *               tipoInvalido:
 *                 value:
 *                   message: Tipo de campeonato inválido. Use Liga, Mata-Mata
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar campeonato
 */
router.put('/:id', authenticateToken, updateChampionship);

/**
 * @swagger
 * /api/championships/{id}:
 *   delete:
 *     summary: Deletar um campeonato
 *     description: Deleta campeonato permanentemente. Valida permissão (apenas criador), verifica se há times vinculados (bloqueia exclusão se existirem registros em TeamChampionship). Requer autenticação JWT.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato a ser deletado
 *         example: 1
 *     responses:
 *       200:
 *         description: Campeonato deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campeonato deletado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token ausente
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido
 *       403:
 *         description: Sem permissão - apenas criador pode excluir
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas o criador pode excluir este campeonato
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Campeonato não encontrado
 *       409:
 *         description: Conflito - existem times vinculados ao campeonato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não é possível excluir - existem times vinculados ao campeonato.
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao deletar campeonato
 */
router.delete('/:id', authenticateToken, deleteChampionship);

/**
 * @swagger
 * /api/championships/{id}/publish:
 *   put:
 *     summary: Publicar um campeonato
 *     description: Muda status de 'draft' para 'open', permitindo que times se inscrevam. Valida permissão (apenas criador) e status atual (apenas rascunhos podem ser publicados). Requer autenticação JWT.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato a ser publicado
 *         example: 1
 *     responses:
 *       200:
 *         description: Campeonato publicado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campeonato publicado com sucesso! Agora está aberto para inscrições.
 *                 championship:
 *                   type: object
 *                   description: Objeto completo do campeonato atualizado com status 'open'
 *       400:
 *         description: Status inválido para publicação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Apenas campeonatos em rascunho podem ser publicados
 *               currentStatus: open
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token ausente
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido
 *       403:
 *         description: Sem permissão - apenas criador pode publicar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Acesso negado
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao publicar campeonato
 */
router.put('/:id/publish', authenticateToken, publishChampionship);

/**
 * @swagger
 * /api/championships/{id}/teams:
 *   post:
 *     summary: Inscrever um time em um campeonato
 *     description: Inscreve time diretamente no campeonato (cria registro em TeamChampionship). Valida existência de campeonato e team (isDeleted=false), verifica duplicação. Não requer permissões específicas além de autenticação. Inclui console.logs para debug.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: integer
 *                 description: ID do time a ser inscrito (deve ter isDeleted=false)
 *                 example: 5
 *     responses:
 *       201:
 *         description: Time inscrito com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time inscrito no campeonato com sucesso
 *       400:
 *         description: teamId ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: teamId é obrigatório
 *       404:
 *         description: Campeonato ou time não encontrado (ou time deletado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *               timeNaoEncontrado:
 *                 value:
 *                   message: Time não encontrado
 *       409:
 *         description: Time já inscrito neste campeonato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: O time já está inscrito neste campeonato
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao inscrever time no campeonato
 */
router.post('/:id/teams', authenticateToken, joinTeamInChampionship);

/**
 * @swagger
 * /api/championships/{id}/teams:
 *   get:
 *     summary: Listar times inscritos em um campeonato
 *     description: Retorna array de times vinculados ao campeonato via TeamChampionship. Filtra times com isDeleted=false. Retorna apenas os objetos Team (não inclui dados de TeamChampionship). Inclui console.logs para debug.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Array de times inscritos (apenas com isDeleted=false)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Objeto Team completo
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao listar times do campeonato
 */
router.get('/:id/teams', authenticateToken, getChampionshipTeams);

/**
 * @swagger
 * /api/championships/{id}/teams/{teamId}:
 *   delete:
 *     summary: Remover um time de um campeonato
 *     description: Remove vínculo do time com campeonato (deleta registro de TeamChampionship). Valida existência de campeonato e vínculo. Não verifica permissões específicas além de autenticação.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do time a ser removido
 *         example: 5
 *     responses:
 *       200:
 *         description: Time removido do campeonato com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time removido do campeonato com sucesso
 *       404:
 *         description: Campeonato não encontrado ou time não está inscrito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *               timeNaoInscrito:
 *                 value:
 *                   message: O time não está inscrito neste campeonato
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao remover time do campeonato
 */
router.delete('/:id/teams/:teamId', authenticateToken, leaveTeamFromChampionship);

/**
 * @swagger
 * /api/championships/{id}/applications:
 *   post:
 *     summary: Enviar candidatura de time para um campeonato
 *     description: Cria application com status 'pending'. Valida que campeonato existe, status='open' (rejeita se draft/closed/in_progress/finished), team existe, e não há candidatura duplicada. Extrai userId do JWT. Não armazena 'message' (campo não existe no model).
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: integer
 *                 description: ID do time candidato
 *                 example: 5
 *     responses:
 *       201:
 *         description: Application criada com status 'pending'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Objeto ChampionshipApplication completo (championship_id, team_id, status, applied_at, etc.)
 *       400:
 *         description: teamId ausente ou campeonato não aceita candidaturas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               teamIdObrigatorio:
 *                 value:
 *                   message: ID do time é obrigatório
 *               statusInvalido:
 *                 value:
 *                   message: Este campeonato não está aceitando aplicações no momento. Status atual draft
 *                   hint: O campeonato precisa ser publicado primeiro
 *       401:
 *         description: Token ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token ausente
 *       404:
 *         description: Campeonato ou time não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *               timeNaoEncontrado:
 *                 value:
 *                   message: Time não encontrado
 *       409:
 *         description: Time já aplicou para este campeonato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Este time já aplicou para este campeonato
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao aplicar para campeonato
 */
router.post('/:id/applications', authenticateToken, applyToChampionship);

/**
 * @swagger
 * /api/championships/{id}/applications:
 *   get:
 *     summary: Listar candidaturas de um campeonato
 *     description: Retorna applications do campeonato com dados do time (via include applicationTeam). Valida permissão (apenas criador do campeonato). Ordena por applied_at ASC. Controller não filtra por status (query param ignorado se enviado).
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Array de applications com dados do time incluídos (id, name, description)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: ChampionshipApplication com include de Team (as 'applicationTeam')
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token ausente
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido
 *       403:
 *         description: Sem permissão - apenas criador do campeonato pode listar applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Acesso negado
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao buscar aplicações
 */
router.get('/:id/applications', authenticateToken, getChampionshipApplications);

/**
 * @swagger
 * /api/championships/{id}/applications/{applicationId}/status:
 *   put:
 *     summary: Atualizar status de uma candidatura (aprovar ou rejeitar)
 *     description: Altera status de application 'pending' para 'approved' ou 'rejected'. Valida permissão (apenas criador do campeonato), status válido, application existe, e status atual é 'pending' (bloqueia se já approved/rejected). Define approved_at ou rejected_at conforme status. Campo rejection_reason opcional mas registrado se enviado.
 *     tags: [Campeonatos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato (usado na validação de permissão)
 *         example: 1
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da application a ser atualizada
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Novo status da application (só aceita approved ou rejected)
 *                 example: approved
 *               rejection_reason:
 *                 type: string
 *                 description: Motivo da rejeição (opcional, mas registrado se status=rejected)
 *                 example: Time não atende aos requisitos do campeonato
 *     responses:
 *       200:
 *         description: Status da application atualizado, retorna objeto application completo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: ChampionshipApplication atualizada com approved_at ou rejected_at preenchidos
 *       400:
 *         description: Status inválido (não é approved nem rejected)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Status deve ser "approved" ou "rejected"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token ausente
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido
 *       403:
 *         description: Sem permissão - apenas criador do campeonato pode atualizar applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Acesso negado
 *       404:
 *         description: Application ou campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               applicationNaoEncontrada:
 *                 value:
 *                   message: Aplicação não encontrada
 *               campeonatoNaoEncontrado:
 *                 value:
 *                   message: Campeonato não encontrado
 *       409:
 *         description: Application já está no status ou não pode ser alterada (status atual não é 'pending')
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               jaNoStatus:
 *                 value:
 *                   message: Esta candidatura já está com o status "approved"
 *                   currentStatus: approved
 *               naoPendente:
 *                 value:
 *                   message: Não é possível alterar candidatura com status "approved"
 *                   currentStatus: approved
 *                   hint: Apenas candidaturas pendentes podem ser aprovadas ou rejeitadas
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Erro ao atualizar aplicação
 */
router.put('/:id/applications/:applicationId/status', authenticateToken, updateApplicationStatus);


export default router;
