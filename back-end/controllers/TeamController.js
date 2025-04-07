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
exports.TeamController = void 0;
const Team_1 = __importDefault(require("../models/Team"));
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/teams';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Apenas JPG, PNG e GIF são aceitos.'));
        }
    }
});
class TeamController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, description, playerEmails } = req.body;
                const captainId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!captainId) {
                    res.status(401).json({ error: 'Usuário não autenticado' });
                    return;
                }
                console.log("Dados recebidos para criação de time:", { name, description, captainId });
                // Verificar apenas pelo nome do time e que não esteja marcado como excluído
                if (name) {
                    const existingActiveTeam = yield Team_1.default.findOne({
                        where: {
                            name: name.trim(),
                            isDeleted: false
                        }
                    });
                    if (existingActiveTeam) {
                        res.status(400).json({ error: 'Este nome de time já está em uso. Escolha outro nome.' });
                        return;
                    }
                    // Verificar se existe um time excluído com o mesmo nome
                    const existingDeletedTeam = yield Team_1.default.findOne({
                        where: {
                            name: name.trim(),
                            isDeleted: true
                        }
                    });
                    if (existingDeletedTeam) {
                        // Criar data atual no formato brasileiro
                        const agora = new Date();
                        // Convertendo para o fuso horário de Brasília (GMT-3)
                        agora.setHours(agora.getHours() - 3);
                        // Atualizar o time excluído, marcando-o como não excluído e atualizando seus dados
                        yield existingDeletedTeam.update({
                            description,
                            captainId,
                            isDeleted: false,
                            updatedAt: agora
                        });
                        // Log para depuração
                        console.log(`Time excluído ${existingDeletedTeam.id} reutilizado em: ${agora.toISOString()}`);
                        // Atualizar jogadores do time se necessário
                        if (playerEmails && Array.isArray(playerEmails)) {
                            // Filtra emails vazios ou inválidos
                            const validEmails = playerEmails.filter(email => email && typeof email === 'string' && email.trim() !== '');
                            console.log("Processando emails válidos de jogadores para time reutilizado:", validEmails.length);
                            if (validEmails.length > 0) {
                                // Remove todos os jogadores atuais
                                yield existingDeletedTeam.setPlayers([]);
                                // Encontra os usuários que já existem no banco de dados
                                const existingPlayers = yield User_1.default.findAll({
                                    where: {
                                        email: { [sequelize_1.Op.in]: validEmails }
                                    }
                                });
                                console.log(`Encontrados ${existingPlayers.length} jogadores para os ${validEmails.length} emails fornecidos`);
                                // Identifica os emails que não foram encontrados
                                const existingEmails = existingPlayers.map(player => player.get('email'));
                                const missingEmails = validEmails.filter(email => !existingEmails.includes(email));
                                if (missingEmails.length > 0) {
                                    console.log('Emails não encontrados no banco de dados (precisam ser criados):', missingEmails);
                                    // Busca todos os usuários uma única vez para comparar
                                    const allUsers = yield User_1.default.findAll();
                                    console.log(`Buscados ${allUsers.length} usuários para verificação case insensitive`);
                                    // Para cada email não encontrado, verifica na lista completa
                                    for (const email of missingEmails) {
                                        console.log(`Verificando email: ${email} com busca case insensitive`);
                                        // Converte o email para minúsculas e remove espaços
                                        const normalizedEmail = email.trim().toLowerCase();
                                        // Procura o usuário na lista já buscada
                                        const userWithDifferentCase = allUsers.find(user => user.get('email').toLowerCase() === normalizedEmail);
                                        if (userWithDifferentCase) {
                                            console.log(`Encontrado usuário com email em case diferente: ${userWithDifferentCase.get('email')}`);
                                            existingPlayers.push(userWithDifferentCase);
                                        }
                                        else {
                                            console.log(`Usuário com email ${email} não existe. Não é possível adicioná-lo.`);
                                        }
                                    }
                                }
                                // Atualiza a associação de jogadores com o time
                                console.log(`Definindo ${existingPlayers.length} jogadores para o time reutilizado ${existingDeletedTeam.id}`);
                                yield existingDeletedTeam.setPlayers(existingPlayers);
                            }
                            else {
                                // Remove todos os jogadores se não houver emails válidos
                                yield existingDeletedTeam.setPlayers([]);
                            }
                        }
                        const teamWithAssociations = yield Team_1.default.findByPk(existingDeletedTeam.id, {
                            include: [
                                {
                                    model: User_1.default,
                                    as: 'captain',
                                    attributes: ['id', 'name', 'email']
                                },
                                {
                                    model: User_1.default,
                                    as: 'players',
                                    attributes: ['id', 'name', 'email']
                                }
                            ]
                        });
                        const plainTeam = teamWithAssociations.get({ plain: true });
                        // Log dos jogadores associados ao time reutilizado
                        if (plainTeam.players && Array.isArray(plainTeam.players)) {
                            console.log(`Time reutilizado tem ${plainTeam.players.length} jogadores associados:`);
                            plainTeam.players.forEach((player) => {
                                console.log(`- Jogador associado: ID=${player.id}, Email=${player.email}`);
                            });
                        }
                        else {
                            console.log('Time reutilizado não tem jogadores associados');
                        }
                        res.status(201).json(plainTeam);
                        return;
                    }
                }
                // Criar um novo time se não existir um com o mesmo nome (nem mesmo excluído)
                console.log("Criando novo time com:", { name: name ? name.trim() : '', description, captainId });
                const team = yield Team_1.default.create({
                    name: name.trim(),
                    description,
                    captainId,
                    isDeleted: false
                });
                console.log("Time criado com sucesso:", team.id);
                if (playerEmails && Array.isArray(playerEmails)) {
                    // Filtra emails vazios ou inválidos
                    const validEmails = playerEmails.filter(email => email && typeof email === 'string' && email.trim() !== '');
                    console.log("Processando emails válidos de jogadores:", validEmails.length);
                    if (validEmails.length > 0) {
                        // Primeiro, encontra os usuários que já existem no banco de dados
                        const existingPlayers = yield User_1.default.findAll({
                            where: {
                                email: { [sequelize_1.Op.in]: validEmails }
                            }
                        });
                        console.log(`Encontrados ${existingPlayers.length} jogadores para os ${validEmails.length} emails fornecidos`);
                        // Identifica os emails que não foram encontrados
                        const existingEmails = existingPlayers.map(player => player.get('email'));
                        const missingEmails = validEmails.filter(email => !existingEmails.includes(email));
                        if (missingEmails.length > 0) {
                            console.log('Emails não encontrados no banco de dados (precisam ser criados):', missingEmails);
                            // Busca todos os usuários uma única vez para comparar
                            const allUsers = yield User_1.default.findAll();
                            console.log(`Buscados ${allUsers.length} usuários para verificação case insensitive`);
                            // Para cada email não encontrado, verifica na lista completa
                            for (const email of missingEmails) {
                                console.log(`Verificando email: ${email} com busca case insensitive`);
                                // Converte o email para minúsculas e remove espaços
                                const normalizedEmail = email.trim().toLowerCase();
                                // Procura o usuário na lista já buscada
                                const userWithDifferentCase = allUsers.find(user => user.get('email').toLowerCase() === normalizedEmail);
                                if (userWithDifferentCase) {
                                    console.log(`Encontrado usuário com email em case diferente: ${userWithDifferentCase.get('email')}`);
                                    existingPlayers.push(userWithDifferentCase);
                                }
                                else {
                                    console.log(`Usuário com email ${email} não existe. Não é possível adicioná-lo.`);
                                }
                            }
                        }
                        // Atualiza a associação de jogadores com o time
                        console.log(`Definindo ${existingPlayers.length} jogadores para o novo time ${team.id}`);
                        yield team.setPlayers(existingPlayers);
                    }
                }
                const teamWithAssociations = yield Team_1.default.findByPk(team.id, {
                    include: [
                        {
                            model: User_1.default,
                            as: 'captain',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: User_1.default,
                            as: 'players',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                });
                if (!teamWithAssociations) {
                    res.status(500).json({ error: 'Erro ao criar time' });
                    return;
                }
                const plainTeam = teamWithAssociations.get({ plain: true });
                // Log dos jogadores associados ao time após a criação
                if (plainTeam.players && Array.isArray(plainTeam.players)) {
                    console.log(`Time criado tem ${plainTeam.players.length} jogadores associados:`);
                    plainTeam.players.forEach((player) => {
                        console.log(`- Jogador associado: ID=${player.id}, Email=${player.email}`);
                    });
                }
                else {
                    console.log('Time criado não tem jogadores associados');
                }
                res.status(201).json(plainTeam);
            }
            catch (error) {
                console.error('Erro ao criar time:', error);
                res.status(500).json({ error: 'Erro ao criar time' });
            }
        });
    }
    static listTeams(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ error: 'Usuário não autenticado' });
                    return;
                }
                console.log(`Listando times visíveis para o usuário ${userId}`);
                // Busca todos os times não excluídos
                const allTeams = yield Team_1.default.findAll({
                    where: {
                        isDeleted: false
                    },
                    include: [
                        {
                            model: User_1.default,
                            as: 'captain',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: User_1.default,
                            as: 'players',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                });
                // Filtra os times onde o usuário é capitão ou jogador
                const visibleTeams = allTeams.filter(team => {
                    // Time onde o usuário é capitão
                    if (team.captainId === userId) {
                        return true;
                    }
                    // Time onde o usuário é jogador
                    const isPlayer = team.players.some(player => player.id === userId);
                    return isPlayer;
                });
                const formattedTeams = visibleTeams.map(team => {
                    const plainTeam = team.get({ plain: true });
                    const isCaptain = team.captainId === userId;
                    const isPlayer = team.players.some(player => player.id === userId);
                    return Object.assign(Object.assign({}, plainTeam), { banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null, isCurrentUserCaptain: isCaptain, isCurrentUserPlayer: isPlayer });
                });
                console.log(`Encontrados ${visibleTeams.length} times visíveis para o usuário ${userId} de um total de ${allTeams.length} times`);
                res.json(formattedTeams);
            }
            catch (error) {
                console.error('Erro ao listar times:', error);
                res.status(500).json({ error: 'Erro ao listar times' });
            }
        });
    }
    static getTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ error: 'Usuário não autenticado' });
                    return;
                }
                console.log(`Buscando time com ID: ${id} para usuário ${userId}`);
                const team = yield Team_1.default.findOne({
                    where: {
                        id,
                        isDeleted: false
                    },
                    include: [
                        {
                            model: User_1.default,
                            as: 'captain',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: User_1.default,
                            as: 'players',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                });
                if (!team) {
                    console.log(`Time com ID ${id} não encontrado ou está marcado como excluído.`);
                    res.status(404).json({ error: 'Time não encontrado' });
                    return;
                }
                // Verifica se o usuário é o capitão ou um jogador do time
                const isCaptain = team.captainId === userId;
                const isPlayer = team.players.some(player => player.id === userId);
                if (!isCaptain && !isPlayer) {
                    console.log(`Acesso negado: Usuário ${userId} não é capitão nem jogador do time ${id}`);
                    res.status(403).json({ error: 'Você não tem permissão para ver este time' });
                    return;
                }
                const plainTeam = team.get({ plain: true });
                // Verifica se há jogadores associados ao time
                if (plainTeam.players && Array.isArray(plainTeam.players)) {
                    console.log(`Time encontrado com ${plainTeam.players.length} jogadores associados`);
                    plainTeam.players.forEach((player) => {
                        console.log(`- Jogador: ID=${player.id}, Email=${player.email}`);
                    });
                }
                else {
                    console.log('Time encontrado sem jogadores associados');
                    plainTeam.players = [];
                }
                const formattedTeam = Object.assign(Object.assign({}, plainTeam), { banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null, isCurrentUserCaptain: isCaptain, isCurrentUserPlayer: isPlayer });
                res.json(formattedTeam);
            }
            catch (error) {
                console.error('Erro ao buscar time:', error);
                res.status(500).json({ error: 'Erro ao buscar time' });
            }
        });
    }
    static updateTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { name, description, playerEmails } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const team = yield Team_1.default.findOne({
                    where: {
                        id,
                        isDeleted: false
                    }
                });
                if (!team) {
                    res.status(404).json({ error: 'Time não encontrado' });
                    return;
                }
                if (team.captainId !== userId) {
                    res.status(403).json({ error: 'Apenas o capitão pode atualizar o time' });
                    return;
                }
                // Verificar se outro time ativo (não excluído) está usando o mesmo nome
                const existingTeam = yield Team_1.default.findOne({
                    where: {
                        name,
                        id: { [sequelize_1.Op.ne]: id },
                        isDeleted: false
                    }
                });
                if (existingTeam) {
                    res.status(400).json({ error: 'Este nome de time já está em uso' });
                    return;
                }
                // Criar data atual no formato brasileiro
                const agora = new Date();
                // Convertendo para o fuso horário de Brasília (GMT-3)
                agora.setHours(agora.getHours() - 3);
                // Forçar a atualização do campo updated_at definindo uma nova data
                yield team.update({
                    name,
                    description,
                    updatedAt: agora
                });
                // Log para depuração
                console.log(`Time ${id} atualizado em: ${agora.toISOString()}`);
                if (playerEmails && Array.isArray(playerEmails)) {
                    console.log('Emails recebidos para atualização:', playerEmails);
                    // Limpa emails vazios ou inválidos
                    const validEmails = playerEmails.filter(email => email && typeof email === 'string' && email.trim() !== '');
                    console.log('Emails válidos após filtragem:', validEmails);
                    if (validEmails.length === 0) {
                        console.log('Nenhum email válido fornecido. Removendo todas as associações de jogadores.');
                        yield team.setPlayers([]);
                    }
                    else {
                        // Primeiro, encontra os usuários que já existem no banco de dados
                        const existingPlayers = yield User_1.default.findAll({
                            where: {
                                email: { [sequelize_1.Op.in]: validEmails }
                            }
                        });
                        console.log(`Encontrados ${existingPlayers.length} jogadores existentes para os ${validEmails.length} emails válidos fornecidos`);
                        // Log dos jogadores que foram encontrados
                        existingPlayers.forEach(player => {
                            console.log(`Jogador encontrado: ${player.get('email')}`);
                        });
                        // Identifica os emails que não foram encontrados
                        const existingEmails = existingPlayers.map(player => player.get('email'));
                        const missingEmails = validEmails.filter(email => !existingEmails.includes(email));
                        if (missingEmails.length > 0) {
                            console.log('Emails não encontrados no banco de dados (precisam ser criados):', missingEmails);
                            // Busca todos os usuários uma única vez para comparar
                            const allUsers = yield User_1.default.findAll();
                            console.log(`Buscados ${allUsers.length} usuários para verificação case insensitive`);
                            // Para cada email não encontrado, verifica na lista completa
                            for (const email of missingEmails) {
                                console.log(`Verificando email: ${email} com busca case insensitive`);
                                // Converte o email para minúsculas e remove espaços
                                const normalizedEmail = email.trim().toLowerCase();
                                // Procura o usuário na lista já buscada
                                const userWithDifferentCase = allUsers.find(user => user.get('email').toLowerCase() === normalizedEmail);
                                if (userWithDifferentCase) {
                                    console.log(`Encontrado usuário com email em case diferente: ${userWithDifferentCase.get('email')}`);
                                    existingPlayers.push(userWithDifferentCase);
                                }
                                else {
                                    console.log(`Usuário com email ${email} não existe. Não é possível adicioná-lo.`);
                                }
                            }
                        }
                        // Atualiza a associação de jogadores com o time
                        console.log(`Definindo ${existingPlayers.length} jogadores para o time ${id}`);
                        yield team.setPlayers(existingPlayers);
                        console.log('Associação de jogadores atualizada com sucesso');
                    }
                }
                else {
                    console.log('Nenhum email de jogador fornecido ou formato inválido. Mantendo jogadores existentes.');
                }
                const updatedTeam = yield Team_1.default.findOne({
                    where: {
                        id,
                        isDeleted: false
                    },
                    include: [
                        {
                            model: User_1.default,
                            as: 'captain',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: User_1.default,
                            as: 'players',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                });
                if (!updatedTeam) {
                    res.status(500).json({ error: 'Erro ao atualizar time' });
                    return;
                }
                const plainTeam = updatedTeam.get({ plain: true });
                // Log dos jogadores associados ao time após a atualização
                if (plainTeam.players && Array.isArray(plainTeam.players)) {
                    console.log(`Time atualizado tem ${plainTeam.players.length} jogadores associados:`);
                    plainTeam.players.forEach((player) => {
                        console.log(`- Jogador associado: ID=${player.id}, Email=${player.email}`);
                    });
                }
                else {
                    console.log('Time atualizado não tem jogadores associados');
                }
                const formattedTeam = Object.assign(Object.assign({}, plainTeam), { banner: plainTeam.banner ? `/uploads/teams/${plainTeam.banner}` : null, 
                    // Formatando a data para o cliente
                    updatedAt: plainTeam.updatedAt ? new Date(plainTeam.updatedAt).toLocaleString('pt-BR') : null, createdAt: plainTeam.createdAt ? new Date(plainTeam.createdAt).toLocaleString('pt-BR') : null });
                res.json(formattedTeam);
            }
            catch (error) {
                console.error('Erro ao atualizar time:', error);
                res.status(500).json({ error: 'Erro ao atualizar time' });
            }
        });
    }
    static uploadBanner(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const team = yield Team_1.default.findOne({
                    where: {
                        id,
                        isDeleted: false
                    }
                });
                if (!team) {
                    res.status(404).json({ error: 'Time não encontrado' });
                    return;
                }
                if (team.captainId !== userId) {
                    res.status(403).json({ error: 'Apenas o capitão pode atualizar o banner' });
                    return;
                }
                if (!req.file) {
                    res.status(400).json({ error: 'Nenhum arquivo enviado' });
                    return;
                }
                if (team.banner) {
                    const oldBannerPath = path_1.default.join('uploads/teams', team.banner);
                    if (fs_1.default.existsSync(oldBannerPath)) {
                        fs_1.default.unlinkSync(oldBannerPath);
                    }
                }
                // Criar data atual no formato brasileiro
                const agora = new Date();
                // Convertendo para o fuso horário de Brasília (GMT-3)
                agora.setHours(agora.getHours() - 3);
                yield team.update({
                    banner: req.file.filename,
                    updatedAt: agora
                });
                // Log para depuração
                console.log(`Banner do time ${id} atualizado em: ${agora.toISOString()}`);
                const updatedTeam = yield Team_1.default.findOne({
                    where: {
                        id,
                        isDeleted: false
                    },
                    include: [
                        {
                            model: User_1.default,
                            as: 'captain',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: User_1.default,
                            as: 'players',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                });
                if (!updatedTeam) {
                    res.status(500).json({ error: 'Erro ao atualizar banner' });
                    return;
                }
                const plainTeam = updatedTeam.get({ plain: true });
                const formattedTeam = Object.assign(Object.assign({}, plainTeam), { banner: `/uploads/teams/${plainTeam.banner}` });
                res.json(formattedTeam);
            }
            catch (error) {
                console.error('Erro ao fazer upload do banner:', error);
                res.status(500).json({ error: 'Erro ao fazer upload do banner' });
            }
        });
    }
    static deleteTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { confirm } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!confirm) {
                    res.status(400).json({
                        error: 'Confirmação necessária',
                        message: 'Para deletar o time, envie confirm: true no corpo da requisição'
                    });
                    return;
                }
                const team = yield Team_1.default.findOne({
                    where: {
                        id,
                        isDeleted: false
                    }
                });
                if (!team) {
                    res.status(404).json({ error: 'Time não encontrado' });
                    return;
                }
                if (team.captainId !== userId) {
                    res.status(403).json({ error: 'Apenas o capitão pode deletar o time' });
                    return;
                }
                // Criar data atual no formato brasileiro
                const agora = new Date();
                // Convertendo para o fuso horário de Brasília (GMT-3)
                agora.setHours(agora.getHours() - 3);
                yield team.update({
                    isDeleted: true,
                    updatedAt: agora
                });
                // Log para depuração
                console.log(`Time ${id} marcado como excluído em: ${agora.toISOString()}`);
                res.status(200).json({
                    message: 'Time deletado com sucesso',
                    team: {
                        id: team.id,
                        name: team.name
                    }
                });
            }
            catch (error) {
                console.error('Erro ao deletar time:', error);
                res.status(500).json({ error: 'Erro ao deletar time' });
            }
        });
    }
}
exports.TeamController = TeamController;
