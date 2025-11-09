import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  inserirPunicaoPartidaAmistosa,
  buscarPunicaoPartidaAmistosa,
  alterarPunicaoPartidaAmistosa,
  deletarPunicaoPartidaAmistosa
} from '../controllers/FriendlyMatchesPunishmentController';
import {
  inserirPunicaoCampeonato,
  buscarPunicaoCampeonato,
  alterarPunicaoCampeonato,
  deletarPunicaoCampeonato
} from '../controllers/ChampionshipPunishmentController';

export const punishmentRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Punições
 *   description: Gerenciamento de punições (WO) para partidas amistosas e campeonatos
 */

/**
 * @swagger
 * /api/punishments/friendly-matches/{idAmistosaPartida}:
 *   post:
 *     summary: Aplicar punição WO em partida amistosa
 *     description: |
 *       Cria uma punição WO para um time em partida amistosa, gerando automaticamente uma súmula 3x0 e finalizando a partida.
 *       
 *       **Validações:**
 *       - Partida deve existir e não estar deletada
 *       - Partida deve ter regras configuradas
 *       - Data atual deve ser após a data limite de inscrição
 *       - Partida deve ter pelo menos 2 times inscritos
 *       - Não pode existir punição ou súmula prévia
 *       - Time punido deve estar na partida
 *       - Times mandante e visitante devem ser diferentes
 *       
 *       **Permissão:** Organizador da partida (match.userId) OU admin (userTypeId === 1)
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmistosaPartida
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida amistosa
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idTeam
 *               - reason
 *               - team_home
 *               - team_away
 *             properties:
 *               idTeam:
 *                 type: integer
 *                 description: ID do time punido (que levará WO)
 *                 example: 1
 *               reason:
 *                 type: string
 *                 description: Motivo da punição
 *                 example: "Time não compareceu à partida"
 *               team_home:
 *                 type: integer
 *                 description: ID do time mandante
 *                 example: 1
 *               team_away:
 *                 type: integer
 *                 description: ID do time visitante
 *                 example: 2
 *           examples:
 *             timeMandanteNaoCompareceu:
 *               value:
 *                 idTeam: 1
 *                 reason: "Time mandante não compareceu"
 *                 team_home: 1
 *                 team_away: 2
 *     responses:
 *       201:
 *         description: Punição aplicada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punição criada com sucesso. Súmula 3x0 gerada automaticamente e partida finalizada"
 *       400:
 *         description: Dados inválidos ou regras não atendidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               dadosIncompletos:
 *                 value:
 *                   message: "Dados inválidos: id da partida, time punido, motivo, time da casa e visitante são obrigatórios"
 *               antesDataLimite:
 *                 value:
 *                   message: "Não é possível aplicar punição antes da data limite de inscrição"
 *               semRegras:
 *                 value:
 *                   message: "Partida não possui regras configuradas"
 *               poucosTimes:
 *                 value:
 *                   message: "A partida deve ter pelo menos 2 times inscritos"
 *               timesIguais:
 *                 value:
 *                   message: "Time mandante e visitante devem ser diferentes"
 *               timeNaoParticipa:
 *                 value:
 *                   message: "O time punido não está inscrito nesta partida"
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
 *         description: Sem permissão (não é organizador nem admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Sem permissão para aplicar punição"
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 summary: ID de partida inexistente
 *                 value:
 *                   message: Partida amistosa não encontrada
 *               partidaDeletada:
 *                 summary: Partida foi removida
 *                 value:
 *                   message: Partida inativa ou deletada
 *               timeNaoEncontrado:
 *                 summary: Time não existe
 *                 value:
 *                   message: Time não encontrado
 *               timeDeletado:
 *                 summary: Time foi removido
 *                 value:
 *                   message: Time está deletado
 *       409:
 *         description: Conflito (já existe punição ou súmula)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               punicaoExistente:
 *                 value:
 *                   message: "Já existe uma punição para esta partida"
 *               sumulaExistente:
 *                 value:
 *                   message: "Já existe uma súmula para esta partida. Delete a súmula existente antes de aplicar punição"
 *       500:
 *         description: Erro interno ao aplicar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroCriarPunicao:
 *                 summary: Erro ao salvar punição
 *                 value:
 *                   message: Erro ao criar punição no banco de dados
 *               erroCriarSumula:
 *                 summary: Erro ao gerar súmula automática
 *                 value:
 *                   message: Erro ao gerar súmula 3x0 automaticamente
 *               erroFinalizarPartida:
 *                 summary: Erro ao finalizar partida
 *                 value:
 *                   message: Erro ao atualizar status da partida
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao aplicar punição
 */
punishmentRoutes.post('/friendly-matches/:idAmistosaPartida', authenticateToken, inserirPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/punishments/friendly-matches/{idAmistosaPartida}:
 *   get:
 *     summary: Buscar punição de partida amistosa
 *     description: |
 *       Retorna informações da punição aplicada à partida amistosa, incluindo dados do time punido e times da súmula.
 *       
 *       **Nota:** Retorna a punição com o alias `penaltyTeam` para o time punido e adiciona `team_home`/`team_away` da súmula gerada.
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmistosaPartida
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Punição encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 idTeam:
 *                   type: integer
 *                 reason:
 *                   type: string
 *                 idMatch:
 *                   type: integer
 *                 penaltyTeam:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 team_home:
 *                   type: integer
 *                   description: ID do time mandante na súmula
 *                 team_away:
 *                   type: integer
 *                   description: ID do time visitante na súmula
 *             example:
 *               id: 1
 *               idTeam: 1
 *               reason: "Time não compareceu"
 *               idMatch: 1
 *               penaltyTeam:
 *                 id: 1
 *                 name: "FC Exemplo"
 *               team_home: 1
 *               team_away: 2
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenInvalido:
 *                 summary: Token inválido
 *                 value:
 *                   message: Token não fornecido ou inválido
 *               tokenExpirado:
 *                 summary: Sessão expirada
 *                 value:
 *                   message: Token expirado
 *       404:
 *         description: Punição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               punicaoNaoEncontrada:
 *                 summary: Nenhuma punição para esta partida
 *                 value:
 *                   message: Punição não encontrada para esta partida
 *               partidaNaoEncontrada:
 *                 summary: Partida inexistente
 *                 value:
 *                   message: Partida não encontrada
 *       500:
 *         description: Erro ao buscar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroBancoDados:
 *                 summary: Erro de consulta
 *                 value:
 *                   message: Erro ao consultar punição no banco de dados
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao buscar punição
 */
punishmentRoutes.get('/friendly-matches/:idAmistosaPartida', authenticateToken, buscarPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/punishments/friendly-matches/{idAmistosaPartida}:
 *   put:
 *     summary: Atualizar punição de partida amistosa
 *     description: |
 *       Atualiza o time punido e/ou motivo da punição. Se `team_home` E `team_away` forem fornecidos juntos, recalcula a súmula 3x0.
 *       
 *       **Validações (quando altera times):**
 *       - Times devem existir e não estarem deletados
 *       - Times devem participar da partida
 *       - Times mandante e visitante devem ser diferentes
 *       
 *       **Nota:** Todos os campos são opcionais. A súmula só é recalculada se ambos `team_home` E `team_away` forem enviados.
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmistosaPartida
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idTeam:
 *                 type: integer
 *                 description: Novo ID do time punido (opcional)
 *               reason:
 *                 type: string
 *                 description: Novo motivo (opcional)
 *               team_home:
 *                 type: integer
 *                 description: Novo ID do time mandante (opcional, deve ser enviado com team_away)
 *               team_away:
 *                 type: integer
 *                 description: Novo ID do time visitante (opcional, deve ser enviado com team_home)
 *     responses:
 *       200:
 *         description: Punição atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Punição alterada com sucesso"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               dadosIncompletos:
 *                 summary: Campos obrigatórios faltando
 *                 value:
 *                   message: Informe o time punido e/ou motivo para atualizar
 *               timesIguais:
 *                 summary: Times mandante e visitante iguais
 *                 value:
 *                   message: Time mandante e visitante devem ser diferentes
 *               timeNaoParticipa:
 *                 summary: Time não está na partida
 *                 value:
 *                   message: Time não participa desta partida
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão para atualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               naoAutorizado:
 *                 summary: Usuário sem permissão
 *                 value:
 *                   message: Sem permissão para atualizar punições
 *               naoAdmin:
 *                 summary: Sem permissão de administrador
 *                 value:
 *                   message: Permissão de administrador necessária
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               punicaoNaoEncontrada:
 *                 summary: Punição inexistente
 *                 value:
 *                   message: Punição não encontrada para esta partida
 *               partidaNaoEncontrada:
 *                 summary: Partida inexistente
 *                 value:
 *                   message: Partida não encontrada
 *               timeNaoEncontrado:
 *                 summary: Time não existe
 *                 value:
 *                   message: Time não encontrado
 *               timeDeletado:
 *                 summary: Time foi removido
 *                 value:
 *                   message: Time está deletado
 *       500:
 *         description: Erro ao atualizar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroAtualizarPunicao:
 *                 summary: Erro ao salvar alterações
 *                 value:
 *                   message: Erro ao atualizar punição no banco de dados
 *               erroRecalcularSumula:
 *                 summary: Erro ao recalcular súmula
 *                 value:
 *                   message: Erro ao recalcular súmula após atualização
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao atualizar punição
 */
punishmentRoutes.put('/friendly-matches/:idAmistosaPartida', authenticateToken, alterarPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/punishments/friendly-matches/{idAmistosaPartida}:
 *   delete:
 *     summary: Deletar punição de partida amistosa
 *     description: Remove a punição e a súmula gerada automaticamente, retornando a partida ao status "confirmada"
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAmistosaPartida
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Punição deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punição e súmula deletadas com sucesso. Partida voltou ao status confirmada"
 *       400:
 *         description: Operação inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não é possível deletar punição de partida já iniciada
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token não fornecido
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido ou expirado
 *       403:
 *         description: Sem permissão para deletar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               naoAutorizado:
 *                 summary: Usuário sem permissão
 *                 value:
 *                   message: Sem permissão para deletar punições
 *               permissaoNegada:
 *                 summary: Sem permissão administrativa
 *                 value:
 *                   message: Permissão negada
 *       404:
 *         description: Partida ou punição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               partidaNaoEncontrada:
 *                 summary: ID de partida inexistente
 *                 value:
 *                   message: Partida não encontrada
 *               punicaoNaoEncontrada:
 *                 summary: Nenhuma punição para deletar
 *                 value:
 *                   message: Punição não encontrada para esta partida
 *       500:
 *         description: Erro ao deletar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroDeletarPunicao:
 *                 summary: Erro ao remover do banco
 *                 value:
 *                   message: Erro ao deletar punição do banco de dados
 *               erroDeletarSumula:
 *                 summary: Erro ao remover súmula
 *                 value:
 *                   message: Erro ao deletar súmula associada
 *               erroAtualizarStatus:
 *                 summary: Erro ao restaurar status
 *                 value:
 *                   message: Erro ao retornar partida ao status confirmada
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao deletar punição
 */
punishmentRoutes.delete('/friendly-matches/:idAmistosaPartida', authenticateToken, deletarPunicaoPartidaAmistosa);

/**
 * @swagger
 * /api/punishments/championships/{idCampeonato}:
 *   post:
 *     summary: Aplicar punição WO em partida de campeonato
 *     description: |
 *       Cria uma punição WO para um time em partida de campeonato, gerando automaticamente uma súmula 3x0.
 *       
 *       **Validações:**
 *       - Campeonato deve ter iniciado (data atual >= start_date)
 *       - Campeonato deve ter pelo menos 2 times inscritos
 *       - Não pode existir punição ou súmula prévia
 *       - Time punido deve estar inscrito no campeonato
 *       - Times mandante e visitante devem ser diferentes
 *       
 *       **Permissão:** Criador do campeonato (championship.userId) OU admin (userTypeId === 1)
 *       
 *       **Nota:** Ao contrário das partidas amistosas, NÃO atualiza automaticamente o status da partida.
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCampeonato
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
 *               - match_championship_id
 *               - team_id
 *               - reason
 *               - team_home
 *               - team_away
 *             properties:
 *               match_championship_id:
 *                 type: integer
 *                 description: ID da partida do campeonato
 *                 example: 5
 *               team_id:
 *                 type: integer
 *                 description: ID do time punido
 *                 example: 2
 *               reason:
 *                 type: string
 *                 description: Motivo da punição
 *                 example: "Acúmulo de cartões vermelhos"
 *               team_home:
 *                 type: integer
 *                 description: ID do time mandante
 *                 example: 1
 *               team_away:
 *                 type: integer
 *                 description: ID do time visitante
 *                 example: 2
 *     responses:
 *       201:
 *         description: Punição aplicada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punição criada com sucesso. Súmula 3x0 gerada automaticamente"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               dadosIncompletos:
 *                 summary: Campos obrigatórios faltando
 *                 value:
 *                   message: Dados inválidos. ID da partida, time punido, motivo e times são obrigatórios
 *               campeonatoNaoIniciado:
 *                 summary: Campeonato ainda não começou
 *                 value:
 *                   message: Campeonato ainda não iniciado. Aguarde a data de início
 *               poucosTimes:
 *                 summary: Times insuficientes
 *                 value:
 *                   message: O campeonato deve ter pelo menos 2 times inscritos
 *               timesIguais:
 *                 summary: Times mandante e visitante iguais
 *                 value:
 *                   message: Time mandante e visitante devem ser diferentes
 *               timePunidoInvalido:
 *                 summary: Time punido não participa da partida
 *                 value:
 *                   message: O time punido deve ser um dos participantes da partida
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token não fornecido
 *               tokenExpirado:
 *                 value:
 *                   message: Token expirado. Faça login novamente
 *       403:
 *         description: Sem permissão para aplicar punição (não é criador nem admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               naoAdministrador:
 *                 summary: Usuário não é administrador
 *                 value:
 *                   message: Apenas administradores podem aplicar punições em campeonatos
 *               permissaoNegada:
 *                 summary: Sem permissão adequada
 *                 value:
 *                   message: Permissão negada para aplicar punições
 *       404:
 *         description: Recurso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campeonatoNaoEncontrado:
 *                 summary: ID de campeonato inexistente
 *                 value:
 *                   message: Campeonato não encontrado
 *               partidaNaoEncontrada:
 *                 summary: Partida inexistente
 *                 value:
 *                   message: Partida não encontrada no campeonato
 *               timeNaoEncontrado:
 *                 summary: Time não cadastrado
 *                 value:
 *                   message: Time não encontrado
 *       409:
 *         description: Já existe punição ou súmula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               punicaoExistente:
 *                 summary: Punição já aplicada
 *                 value:
 *                   message: Já existe uma punição para esta partida
 *               sumulaExistente:
 *                 summary: Súmula já cadastrada
 *                 value:
 *                   message: Já existe uma súmula para esta partida. Delete a súmula antes de aplicar punição
 *       500:
 *         description: Erro ao aplicar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroCriarPunicao:
 *                 summary: Erro ao salvar punição
 *                 value:
 *                   message: Erro ao criar punição no banco de dados
 *               erroCriarSumula:
 *                 summary: Erro ao gerar súmula
 *                 value:
 *                   message: Erro ao gerar súmula 3x0 automaticamente
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao aplicar punição no campeonato
 */
punishmentRoutes.post('/championships/:idCampeonato', authenticateToken, inserirPunicaoCampeonato);

/**
 * @swagger
 * /api/punishments/championships/{idCampeonato}/match/{match_championship_id}:
 *   get:
 *     summary: Buscar punição de campeonato por partida
 *     description: |
 *       Retorna a punição aplicada a uma partida específica do campeonato.
 *       
 *       **Nota:** Retorna array vazio se não houver punição (não retorna 404). O alias do time é `championshipPenaltyTeam`.
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCampeonato
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: match_championship_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Punição encontrada (ou array vazio)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   teamId:
 *                     type: integer
 *                   reason:
 *                     type: string
 *                   championshipId:
 *                     type: integer
 *                   matchChampionshipId:
 *                     type: integer
 *                   championshipPenaltyTeam:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *             examples:
 *               comPunicao:
 *                 summary: Punição encontrada
 *                 value:
 *                   - id: 1
 *                     teamId: 2
 *                     reason: "Acúmulo de cartões vermelhos"
 *                     championshipId: 1
 *                     matchChampionshipId: 5
 *                     championshipPenaltyTeam:
 *                       id: 2
 *                       name: "FC Exemplo"
 *               semPunicao:
 *                 summary: Sem punição
 *                 value: []
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido
 *               tokenExpirado:
 *                 value:
 *                   message: Sessão expirada
 *       500:
 *         description: Erro ao buscar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroBancoDados:
 *                 summary: Erro de consulta
 *                 value:
 *                   message: Erro ao consultar punição no banco de dados
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao buscar punição do campeonato
 */
punishmentRoutes.get('/championships/:idCampeonato/match/:match_championship_id', authenticateToken, buscarPunicaoCampeonato);

/**
 * @swagger
 * /api/punishments/championships/{idCampeonato}/match/{match_championship_id}:
 *   put:
 *     summary: Atualizar punição de campeonato por partida
 *     description: |
 *       Atualiza o time punido e/ou motivo da punição em uma partida específica do campeonato.
 *       
 *       **Validações:**
 *       - Time deve estar inscrito no campeonato
 *       
 *       **Nota:** Ao contrário das partidas amistosas, NÃO recalcula a súmula automaticamente.
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCampeonato
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: match_championship_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_id:
 *                 type: integer
 *                 description: Novo ID do time punido (opcional)
 *               reason:
 *                 type: string
 *                 description: Novo motivo (opcional)
 *     responses:
 *       200:
 *         description: Punição atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Punição alterada com sucesso"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               semDados:
 *                 summary: Nenhum campo para atualizar
 *                 value:
 *                   message: Informe o time punido e/ou motivo para atualizar
 *               timePunidoInvalido:
 *                 summary: Time não participa da partida
 *                 value:
 *                   message: Time punido deve estar na partida
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão para atualizar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               naoAdministrador:
 *                 summary: Usuário não é admin
 *                 value:
 *                   message: Apenas administradores podem atualizar punições
 *               permissaoNegada:
 *                 summary: Sem permissão adequada
 *                 value:
 *                   message: Permissão negada
 *       404:
 *         description: Punição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               punicaoNaoEncontrada:
 *                 summary: Punição inexistente
 *                 value:
 *                   message: Punição não encontrada
 *               campeonatoNaoEncontrado:
 *                 summary: Campeonato inexistente
 *                 value:
 *                   message: Campeonato não encontrado
 *       500:
 *         description: Erro ao atualizar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroAtualizacao:
 *                 summary: Erro ao salvar
 *                 value:
 *                   message: Erro ao atualizar punição no banco de dados
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao atualizar punição
 */
punishmentRoutes.put('/championships/:idCampeonato/match/:match_championship_id', authenticateToken, alterarPunicaoCampeonato);


/**
 * @swagger
 * /api/punishments/championships/{idCampeonato}/match/{match_championship_id}:
 *   delete:
 *     summary: Deletar punição de campeonato por partida
 *     description: |
 *       Remove a punição e a súmula gerada automaticamente para uma partida específica do campeonato.
 *       
 *       **Comportamento:** Se a partida estava com status 'finalizada', volta para 'confirmada'. Caso contrário, mantém o status atual.
 *     tags: [Punições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCampeonato
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: match_championship_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Punição deletada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               partidaFinalizada:
 *                 summary: Partida estava finalizada
 *                 value:
 *                   message: "Punição e súmula deletadas com sucesso. Partida voltou ao status confirmada"
 *               partidaNaoFinalizada:
 *                 summary: Partida não estava finalizada
 *                 value:
 *                   message: "Punição e súmula deletadas com sucesso"
 *       400:
 *         description: Operação inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Não é possível deletar punição de partida já iniciada
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               tokenAusente:
 *                 value:
 *                   message: Token não fornecido
 *               tokenInvalido:
 *                 value:
 *                   message: Token inválido ou expirado
 *       403:
 *         description: Sem permissão para deletar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               naoAdministrador:
 *                 summary: Usuário não é admin
 *                 value:
 *                   message: Apenas administradores podem deletar punições
 *               permissaoNegada:
 *                 summary: Sem permissão adequada
 *                 value:
 *                   message: Permissão negada para deletar punições
 *       404:
 *         description: Punição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               punicaoNaoEncontrada:
 *                 summary: Punição inexistente
 *                 value:
 *                   message: Punição não encontrada
 *               campeonatoNaoEncontrado:
 *                 summary: Campeonato inexistente
 *                 value:
 *                   message: Campeonato não encontrado
 *               partidaNaoEncontrada:
 *                 summary: Partida inexistente
 *                 value:
 *                   message: Partida não encontrada
 *       500:
 *         description: Erro ao deletar punição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               erroDeletarPunicao:
 *                 summary: Erro ao remover do banco
 *                 value:
 *                   message: Erro ao deletar punição do banco de dados
 *               erroDeletarSumula:
 *                 summary: Erro ao remover súmula
 *                 value:
 *                   message: Erro ao deletar súmula associada
 *               erroServidor:
 *                 summary: Erro genérico
 *                 value:
 *                   message: Erro ao deletar punição
 */
punishmentRoutes.delete('/championships/:idCampeonato/match/:match_championship_id', authenticateToken, deletarPunicaoCampeonato);

export default punishmentRoutes;
