"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Match_1 = __importDefault(require("../models/Match"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Criar uma nova partida
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, date, location, complement, maxPlayers, price } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        // Concatenar endereço e complemento, se existir
        const fullLocation = complement ? `${location} - ${complement}` : location;
        const match = yield Match_1.default.create({
            title,
            description,
            date,
            location: fullLocation,
            maxPlayers,
            price,
            organizerId: userId,
            status: 'open'
        });
        res.status(201).json(match);
    }
    catch (error) {
        console.error('Erro ao criar partida:', error);
        res.status(500).json({ message: 'Erro ao criar partida' });
    }
}));
// Listar todas as partidas
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Listando partidas com SQL nativo...');
        // Usar SQL nativo para evitar problemas com associações
        const [matches] = yield (((_a = Match_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.query(`
      SELECT 
        m.id, m.title, m.date, m.location, m.max_players as maxPlayers,
        m.status, m.description, m.price, m.organizer_id as organizerId,
        m.created_at as createdAt, m.updated_at as updatedAt,
        u.id as organizerId, u.name as organizerName, u.email as organizerEmail,
        (SELECT COUNT(*) FROM match_players WHERE match_id = m.id) as playerCount
      FROM 
        matches m
      LEFT JOIN 
        users u ON m.organizer_id = u.id
      ORDER BY 
        m.date ASC
    `)) || []);
        console.log(`Encontradas ${matches.length} partidas no banco de dados`);
        // Obter jogadores para cada partida
        const matchesWithPlayers = yield Promise.all(matches.map((match) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                // Formatar o objeto organizer antes de trabalhar com jogadores
                const organizer = {
                    id: match.organizerId,
                    name: match.organizerName || 'Organizador desconhecido',
                    email: match.organizerEmail || ''
                };
                // Remover campos extras
                delete match.organizerName;
                delete match.organizerEmail;
                // Verificar se a partida tem jogadores com a contagem que já foi feita na consulta
                const actualPlayerCount = parseInt(match.playerCount || '0', 10);
                delete match.playerCount; // Remover do objeto final
                console.log(`Partida ${match.id} (${match.title}): ${actualPlayerCount} jogadores registrados diretamente`);
                // Se não há jogadores no banco, pular as consultas detalhadas
                if (actualPlayerCount === 0) {
                    console.log(`Partida ${match.id} não possui jogadores, pulando consultas detalhadas`);
                    return Object.assign(Object.assign({}, match), { organizer, players: [], playerStats: {
                            totalIndividualPlayers: 0,
                            totalTeams: 0,
                            totalTeamPlayers: 0,
                            totalPlayers: 0,
                            isEmpty: true
                        } });
                }
                // Obter jogadores regulares
                let [regularPlayers] = yield (((_a = Match_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.query(`
            SELECT 
              u.id, u.name, u.email, false as isTeam,
              null as teamId, null as teamName, null as playerCount
            FROM 
              users u
            JOIN 
              match_players mp ON u.id = mp.user_id
            WHERE 
              mp.match_id = ?
          `, {
                    replacements: [match.id]
                })) || [[], null]);
                console.log(`Partida ${match.id}: Encontrados ${regularPlayers.length} jogadores individuais`);
                // Obter times (Removido pois a coluna is_team não existe)
                let teamPlayers = [];
                // Combinar jogadores
                const allPlayers = [...regularPlayers];
                // Calcular estatísticas
                const totalRegularPlayers = regularPlayers.length || 0;
                const totalTeamPlayers = 0;
                const totalPlayers = totalRegularPlayers;
                return Object.assign(Object.assign({}, match), { organizer, players: allPlayers, playerStats: {
                        totalIndividualPlayers: totalRegularPlayers,
                        totalTeams: 0,
                        totalTeamPlayers: totalTeamPlayers,
                        totalPlayers: totalPlayers,
                        isEmpty: allPlayers.length === 0
                    } });
            }
            catch (playerError) {
                console.error(`Erro ao obter jogadores para partida ${match.id}:`, playerError);
                // Retornar a partida sem jogadores em caso de erro
                return Object.assign(Object.assign({}, match), { organizer: {
                        id: match.organizerId,
                        name: match.organizerName || 'Organizador desconhecido',
                        email: match.organizerEmail || ''
                    }, players: [], playerStats: {
                        totalIndividualPlayers: 0,
                        totalTeams: 0,
                        totalTeamPlayers: 0,
                        totalPlayers: 0,
                        hasPlayersInDB: parseInt(match.playerCount || '0', 10) > 0,
                        error: true,
                        errorMessage: String(playerError)
                    }, _error: "Não foi possível carregar os jogadores" });
            }
        })));
        console.log(`Processadas ${matchesWithPlayers.length} partidas com detalhes de jogadores`);
        res.json(matchesWithPlayers);
    }
    catch (error) {
        console.error('Erro ao listar partidas:', error);
        // Garantir que sempre retornamos algo válido para o frontend
        res.status(500).json({
            message: 'Erro ao listar partidas',
            matches: []
        });
    }
}));
// Obter detalhes de uma partida específica
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log(`Buscando partida com ID: ${req.params.id}`);
        // Validar ID da partida
        const matchId = parseInt(req.params.id, 10);
        if (isNaN(matchId)) {
            console.log(`ID de partida inválido: ${req.params.id}`);
            res.status(400).json({
                message: 'ID da partida deve ser um número válido'
            });
            return;
        }
        // Buscar partida pelo ID com SQL nativo para melhor controle
        const [matches] = yield (((_a = Match_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.query(`
      SELECT 
        m.id, m.title, m.date, m.location, m.max_players as maxPlayers,
        m.status, m.description, m.price, m.organizer_id as organizerId,
        m.created_at as createdAt, m.updated_at as updatedAt,
        u.id as organizerId, u.name as organizerName, u.email as organizerEmail
      FROM 
        matches m
      LEFT JOIN 
        users u ON m.organizer_id = u.id
      WHERE 
        m.id = ?
    `, {
            replacements: [matchId]
        })) || []);
        if (!matches || matches.length === 0) {
            console.log(`Partida ${matchId} não encontrada`);
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        // Extrair a partida encontrada
        const match = matches[0];
        // Montar objeto do organizador
        const organizer = {
            id: match.organizerId,
            name: match.organizerName || 'Organizador desconhecido',
            email: match.organizerEmail || ''
        };
        // Remover campos redundantes
        delete match.organizerName;
        delete match.organizerEmail;
        // Verificar diretamente a existência de jogadores
        const [matchPlayerCount] = yield (((_b = Match_1.default.sequelize) === null || _b === void 0 ? void 0 : _b.query(`
      SELECT COUNT(*) as count FROM match_players WHERE match_id = ?
    `, {
            replacements: [matchId]
        })) || []);
        const actualPlayerCount = parseInt(((_c = matchPlayerCount[0]) === null || _c === void 0 ? void 0 : _c.count) || '0', 10);
        console.log(`Partida ${matchId}: Verificação direta mostra ${actualPlayerCount} entradas na tabela match_players`);
        try {
            // Obter jogadores regulares
            let [regularPlayers] = yield (((_d = Match_1.default.sequelize) === null || _d === void 0 ? void 0 : _d.query(`
        SELECT 
          u.id, u.name, u.email, false as isTeam,
          null as teamId, null as teamName, null as playerCount
        FROM 
          users u
        JOIN 
          match_players mp ON u.id = mp.user_id
        WHERE 
          mp.match_id = ?
      `, {
                replacements: [matchId]
            })) || [[], null]);
            console.log(`Partida ${matchId}: Encontrados ${regularPlayers.length} jogadores individuais`);
            // Obter times (Removido pois a coluna is_team não existe)
            let teamPlayers = [];
            // Combinar jogadores
            const allPlayers = [...regularPlayers];
            // Calcular estatísticas de jogadores
            const totalRegularPlayers = regularPlayers.length || 0;
            const totalTeamPlayers = 0;
            const totalPlayers = totalRegularPlayers;
            // Montar resposta completa
            const matchWithPlayers = Object.assign(Object.assign({}, match), { organizer, players: allPlayers, playerStats: {
                    totalIndividualPlayers: totalRegularPlayers,
                    totalTeams: 0,
                    totalTeamPlayers: totalTeamPlayers,
                    totalPlayers: totalPlayers,
                    isEmpty: allPlayers.length === 0,
                    hasPlayersInDB: actualPlayerCount > 0
                } });
            res.json(matchWithPlayers);
        }
        catch (playersError) {
            console.error(`Erro ao obter jogadores para partida ${matchId}:`, playersError);
            // Retornar a partida sem jogadores em caso de erro
            res.json(Object.assign(Object.assign({}, match), { organizer, players: [], playerStats: {
                    totalIndividualPlayers: 0,
                    totalTeams: 0,
                    totalTeamPlayers: 0,
                    totalPlayers: 0,
                    isEmpty: true,
                    hasPlayersInDB: actualPlayerCount > 0,
                    error: true,
                    errorMessage: String(playersError)
                }, _error: "Não foi possível carregar os jogadores" }));
        }
    }
    catch (error) {
        console.error(`Erro ao buscar partida ${req.params.id}:`, error);
        res.status(500).json({
            message: 'Erro ao buscar detalhes da partida',
            error: String(error)
        });
    }
}));
// Endpoint detalhado para jogadores da partida específica
router.get('/:id/players', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        console.log('Buscando jogadores da partida com ID:', req.params.id);
        // Verificar se o ID é válido
        const matchId = parseInt(req.params.id, 10);
        if (isNaN(matchId)) {
            console.log(`ID de partida inválido: ${req.params.id}`);
            res.status(400).json({
                message: 'ID de partida inválido',
                players: [],
                meta: {
                    error: true,
                    errorType: 'INVALID_ID'
                }
            });
            return;
        }
        // Verificar se a partida existe
        const [matchExists] = yield (((_a = Match_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.query(`
      SELECT id FROM matches WHERE id = ?
    `, {
            replacements: [matchId]
        })) || []);
        if (!matchExists || matchExists.length === 0) {
            console.log(`Partida ${matchId} não encontrada no banco de dados`);
            res.json({
                message: 'Partida não encontrada',
                players: [],
                meta: {
                    totalIndividualPlayers: 0,
                    totalTeams: 0,
                    totalTeamPlayers: 0,
                    totalPlayers: 0,
                    isEmpty: true,
                    error: true,
                    errorType: 'MATCH_NOT_FOUND'
                }
            });
            return;
        }
        console.log(`Partida ${matchId} encontrada, buscando jogadores...`);
        // Verificar diretamente a existência de jogadores na tabela
        const [matchPlayerCount] = yield (((_b = Match_1.default.sequelize) === null || _b === void 0 ? void 0 : _b.query(`
      SELECT COUNT(*) as count FROM match_players WHERE match_id = ?
    `, {
            replacements: [matchId]
        })) || []);
        const actualPlayerCount = parseInt(((_c = matchPlayerCount[0]) === null || _c === void 0 ? void 0 : _c.count) || '0', 10);
        console.log(`Partida ${matchId}: Verificação direta mostra ${actualPlayerCount} entradas na tabela match_players`);
        try {
            // Inicializar arrays vazios para prevenir erros
            let regularPlayers = [];
            let teamPlayers = [];
            // Só buscar detalhes se realmente houver jogadores
            if (actualPlayerCount > 0) {
                // CORREÇÃO: Obter jogadores regulares para a partida - alterando o filtro para considerar NULL
                let [regularPlayers] = yield (((_d = Match_1.default.sequelize) === null || _d === void 0 ? void 0 : _d.query(`
          SELECT 
            u.id, u.name, u.email, false as isTeam,
            null as teamId, null as teamName, null as playerCount
          FROM 
            users u
          JOIN 
            match_players mp ON u.id = mp.user_id
          WHERE 
            mp.match_id = ?
        `, {
                    replacements: [matchId]
                })) || [[], null]);
                // Garantir que regularPlayers seja um array
                if (Array.isArray(regularPlayers)) {
                    regularPlayers = regularPlayers;
                    console.log(`Partida ${matchId}: Encontrados ${regularPlayers.length} jogadores individuais`);
                }
                else {
                    console.warn(`Partida ${matchId}: regularPlayers não é um array`, regularPlayers);
                }
                // CORREÇÃO: Obter participantes que são times - usando = 1 ou = true
                let [teamData] = yield (((_e = Match_1.default.sequelize) === null || _e === void 0 ? void 0 : _e.query(`
          SELECT 
            mp.user_id as id, 
            u.name, 
            u.email,
            true as isTeam,
            COALESCE(mp.team_id, 0) as teamId,
            COALESCE(t.name, 'Time sem nome') as teamName,
            COALESCE((
              SELECT COUNT(*) 
              FROM team_players tp 
              WHERE tp.team_id = mp.team_id
            ), 1) as playerCount
          FROM 
            match_players mp
          JOIN 
            users u ON mp.user_id = u.id
          LEFT JOIN
            teams t ON mp.team_id = t.id
          WHERE 
            mp.match_id = ? AND
            (mp.is_team = 1 OR mp.is_team = true)
        `, {
                    replacements: [matchId]
                })) || [[], null]);
                // Garantir que teamPlayers seja um array
                if (Array.isArray(teamData)) {
                    teamPlayers = teamData;
                    console.log(`Partida ${matchId}: Encontrados ${teamPlayers.length} times`);
                }
                else {
                    console.warn(`Partida ${matchId}: teamPlayers não é um array`, teamData);
                }
            }
            else {
                console.log(`Partida ${matchId} realmente não possui jogadores registrados`);
            }
            // Combinar jogadores regulares e times
            const allPlayers = [
                ...regularPlayers.map((player) => (Object.assign(Object.assign({}, player), { isTeam: false }))),
                ...teamPlayers.map((team) => (Object.assign(Object.assign({}, team), { isTeam: true, playerCount: parseInt(team === null || team === void 0 ? void 0 : team.playerCount, 10) || 1 // Garantir que sempre haja pelo menos 1 jogador
                 })))
            ];
            // Calcular o total de jogadores (incluindo os membros dos times)
            const totalRegularPlayers = regularPlayers.length || 0;
            const totalTeamPlayers = teamPlayers.reduce((acc, team) => acc + (parseInt(team === null || team === void 0 ? void 0 : team.playerCount, 10) || 1), 0);
            const totalPlayers = totalRegularPlayers + totalTeamPlayers;
            console.log(`Total de jogadores para partida ${matchId}: ${totalPlayers} (${totalRegularPlayers} individuais + ${totalTeamPlayers} em times)`);
            // Adicionar metadados à resposta
            const response = {
                players: allPlayers,
                meta: {
                    totalIndividualPlayers: totalRegularPlayers,
                    totalTeams: teamPlayers.length || 0,
                    totalTeamPlayers: totalTeamPlayers,
                    totalPlayers: totalPlayers,
                    isEmpty: allPlayers.length === 0,
                    hasPlayersInDB: actualPlayerCount > 0
                }
            };
            res.json(response);
        }
        catch (playersError) {
            console.error(`Erro ao buscar detalhes dos jogadores para partida ${matchId}:`, playersError);
            // Retornar um objeto vazio mas válido em caso de erro
            res.json({
                players: [],
                meta: {
                    totalIndividualPlayers: 0,
                    totalTeams: 0,
                    totalTeamPlayers: 0,
                    totalPlayers: 0,
                    isEmpty: true,
                    error: true,
                    errorMessage: String(playersError),
                    hasPlayersInDB: actualPlayerCount > 0
                }
            });
        }
    }
    catch (error) {
        console.error(`Erro ao buscar jogadores da partida ${req.params.id}:`, error);
        // Sempre retornar um objeto JSON válido com um array vazio no mínimo
        res.json({
            message: 'Erro ao buscar jogadores da partida',
            players: [],
            meta: {
                error: true,
                errorMessage: String(error),
                totalPlayers: 0,
                isEmpty: true
            }
        });
    }
}));
// Entrar em uma partida
router.post('/:id/join', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Tentando entrar na partida:', req.params.id);
        const match = yield Match_1.default.findByPk(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        if (match.status !== 'open') {
            res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
            return;
        }
        const playerCount = yield match.countPlayers();
        if (playerCount >= match.maxPlayers) {
            res.status(400).json({ message: 'Esta partida já está cheia' });
            return;
        }
        yield match.addPlayer(userId);
        console.log('Usuário', userId, 'entrou na partida', match.id);
        res.json({ message: 'Inscrição realizada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao entrar na partida:', error);
        res.status(500).json({ message: 'Erro ao entrar na partida' });
    }
}));
// Sair de uma partida
router.post('/:id/leave', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Tentando sair da partida:', req.params.id);
        const match = yield Match_1.default.findByPk(req.params.id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        // Remove o usuário da partida
        const user = yield User_1.default.findByPk(userId);
        if (user) {
            yield match.removePlayers(user);
            console.log('Usuário', userId, 'saiu da partida', match.id);
            res.json({ message: 'Você saiu da partida com sucesso' });
        }
        else {
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    }
    catch (error) {
        console.error('Erro ao sair da partida:', error);
        res.status(500).json({ message: 'Erro ao sair da partida' });
    }
}));
// Entrar em uma partida com um time
router.post('/:id/join-team', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log('Tentando entrar na partida com um time:', req.params.id);
        const matchId = parseInt(req.params.id, 10);
        if (isNaN(matchId)) {
            res.status(400).json({ message: 'ID de partida inválido' });
            return;
        }
        const { teamId } = req.body;
        if (!teamId || isNaN(parseInt(teamId, 10))) {
            res.status(400).json({ message: 'ID de time inválido' });
            return;
        }
        const match = yield Match_1.default.findByPk(matchId);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        if (match.status !== 'open') {
            res.status(400).json({ message: 'Esta partida não está aberta para inscrições' });
            return;
        }
        // Verificar se o time existe e se o usuário é capitão
        const [teamResult] = yield (((_b = Match_1.default.sequelize) === null || _b === void 0 ? void 0 : _b.query(`
      SELECT t.id, t.name, t.captain_id as captainId, 
             (SELECT COUNT(*) FROM team_players WHERE team_id = t.id) as playerCount
      FROM teams t
      WHERE t.id = ? AND t.is_deleted = false
    `, {
            replacements: [teamId]
        })) || []);
        if (!teamResult || teamResult.length === 0) {
            res.status(404).json({ message: 'Time não encontrado ou foi removido' });
            return;
        }
        const team = teamResult[0];
        if (team.captainId !== userId) {
            res.status(403).json({ message: 'Apenas o capitão do time pode inscrevê-lo em uma partida' });
            return;
        }
        // Verificar se o time já está inscrito na partida
        const [existingEntry] = yield (((_c = Match_1.default.sequelize) === null || _c === void 0 ? void 0 : _c.query(`
      SELECT * FROM match_players
      WHERE match_id = ? AND user_id = ? AND is_team = true AND team_id = ?
    `, {
            replacements: [matchId, userId, teamId]
        })) || []);
        if (existingEntry && existingEntry.length > 0) {
            res.status(400).json({ message: 'Este time já está inscrito nesta partida' });
            return;
        }
        // Verificar se há vagas suficientes na partida
        const currentPlayerCount = yield getMatchPlayerCount(matchId);
        const teamPlayerCount = team.playerCount || 1; // Considerar pelo menos 1 jogador
        if (currentPlayerCount + teamPlayerCount > match.maxPlayers) {
            res.status(400).json({
                message: 'Não há vagas suficientes para este time na partida',
                details: {
                    currentPlayers: currentPlayerCount,
                    teamSize: teamPlayerCount,
                    maxPlayers: match.maxPlayers,
                    remaining: match.maxPlayers - currentPlayerCount
                }
            });
            return;
        }
        // Adicionar o time à partida
        yield (((_d = Match_1.default.sequelize) === null || _d === void 0 ? void 0 : _d.query(`
      INSERT INTO match_players (match_id, user_id, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE updated_at = NOW()
    `, {
            replacements: [matchId, userId]
        })) || []);
        console.log(`Time ${team.name} (ID: ${teamId}) inscrito na partida ${matchId} pelo usuário ${userId}`);
        res.json({
            message: 'Time inscrito na partida com sucesso',
            details: {
                matchId,
                teamId,
                teamName: team.name,
                teamSize: teamPlayerCount
            }
        });
    }
    catch (error) {
        console.error('Erro ao entrar na partida com o time:', error);
        res.status(500).json({ message: 'Erro ao entrar na partida com o time' });
    }
}));
// Função auxiliar para obter contagem de jogadores em uma partida
function getMatchPlayerCount(matchId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Contar total de jogadores na tabela match_players
            const [allPlayers] = yield (((_a = Match_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.query(`
      SELECT COUNT(*) as count
      FROM match_players
      WHERE match_id = ?
    `, {
                replacements: [matchId]
            })) || []);
            return parseInt(((_b = allPlayers[0]) === null || _b === void 0 ? void 0 : _b.count) || '0', 10);
        }
        catch (error) {
            console.error('Erro ao calcular contagem de jogadores:', error);
            return 0;
        }
    });
}
// Endpoint de diagnóstico - verificar entradas diretas na tabela match_players
router.get('/:id/diagnostic', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log('Diagnóstico para partida com ID:', req.params.id);
        // Verificar se o ID é válido
        const matchId = parseInt(req.params.id, 10);
        if (isNaN(matchId)) {
            console.log(`ID de partida inválido: ${req.params.id}`);
            res.status(400).json({ message: 'ID de partida inválido' });
            return;
        }
        // Verificar diretamente na tabela match_players
        const [matchPlayerEntries] = yield (((_a = Match_1.default.sequelize) === null || _a === void 0 ? void 0 : _a.query(`
      SELECT 
        mp.id, mp.match_id, mp.user_id, mp.is_team, mp.team_id,
        u.name as userName, u.email as userEmail
      FROM 
        match_players mp
      JOIN 
        users u ON mp.user_id = u.id
      WHERE 
        mp.match_id = ?
    `, {
            replacements: [matchId]
        })) || []);
        console.log(`Partida ${matchId}: Encontradas ${(matchPlayerEntries === null || matchPlayerEntries === void 0 ? void 0 : matchPlayerEntries.length) || 0} entradas diretas na tabela match_players`);
        // Verificar na tabela de times
        const [teamEntries] = yield (((_b = Match_1.default.sequelize) === null || _b === void 0 ? void 0 : _b.query(`
      SELECT 
        mp.id, mp.match_id, mp.user_id, mp.team_id,
        t.name as teamName,
        u.name as captainName,
        (SELECT COUNT(*) FROM team_players WHERE team_id = mp.team_id) as playerCount
      FROM 
        match_players mp
      JOIN 
        teams t ON mp.team_id = t.id
      JOIN
        users u ON t.captain_id = u.id
      WHERE 
        mp.match_id = ? AND
        mp.is_team = true
    `, {
            replacements: [matchId]
        })) || []);
        console.log(`Partida ${matchId}: Encontradas ${(teamEntries === null || teamEntries === void 0 ? void 0 : teamEntries.length) || 0} entradas de times`);
        // Verificar problemas de consistência
        const diagnosticInfo = {
            matchId,
            directEntries: matchPlayerEntries || [],
            teamEntries: teamEntries || [],
            problems: []
        };
        // Verificar se há entradas sem usuário associado
        const entriesWithoutUser = matchPlayerEntries === null || matchPlayerEntries === void 0 ? void 0 : matchPlayerEntries.filter(entry => !entry.userName);
        if ((entriesWithoutUser === null || entriesWithoutUser === void 0 ? void 0 : entriesWithoutUser.length) > 0) {
            diagnosticInfo.problems.push(`Há ${entriesWithoutUser.length} entradas sem usuário associado`);
        }
        // Verificar se há entradas de time sem time associado
        const teamEntriesWithoutTeam = matchPlayerEntries === null || matchPlayerEntries === void 0 ? void 0 : matchPlayerEntries.filter(entry => entry.is_team && !entry.team_id);
        if ((teamEntriesWithoutTeam === null || teamEntriesWithoutTeam === void 0 ? void 0 : teamEntriesWithoutTeam.length) > 0) {
            diagnosticInfo.problems.push(`Há ${teamEntriesWithoutTeam.length} entradas de time sem time associado`);
        }
        res.json(diagnosticInfo);
    }
    catch (error) {
        console.error(`Erro ao realizar diagnóstico da partida ${req.params.id}:`, error);
        res.status(500).json({
            message: 'Erro ao realizar diagnóstico',
            error: String(error)
        });
    }
}));
exports.default = router;
