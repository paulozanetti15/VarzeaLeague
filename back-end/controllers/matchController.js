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
exports.cancelMatch = exports.updateMatch = exports.getMatch = exports.listMatches = exports.createMatch = void 0;
const Match_1 = __importDefault(require("../models/Match"));
const User_1 = __importDefault(require("../models/User"));
// Criar uma nova partida
const createMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, date, location, complement, maxPlayers, description, price } = req.body;
        const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!organizerId) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        const match = yield Match_1.default.create({
            title,
            date,
            location,
            complement,
            maxPlayers,
            description,
            price,
            organizerId
        });
        res.status(201).json(match);
    }
    catch (error) {
        console.error('Erro ao criar partida:', error);
        res.status(500).json({ message: 'Erro ao criar partida' });
    }
});
exports.createMatch = createMatch;
// Listar todas as partidas
const listMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matches = yield Match_1.default.findAll({
            include: [
                {
                    model: User_1.default,
                    as: 'organizer',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User_1.default,
                    as: 'players',
                    attributes: ['id', 'name', 'email'],
                    through: { attributes: [] }
                }
            ],
            attributes: [
                'id',
                'title',
                'date',
                'location',
                'complement',
                'maxPlayers',
                'status',
                'description',
                'price',
                'organizerId',
                'createdAt',
                'updatedAt'
            ],
            order: [['date', 'ASC']]
        });
        res.json(matches);
    }
    catch (error) {
        console.error('Erro ao listar partidas:', error);
        res.status(500).json({ message: 'Erro ao listar partidas' });
    }
});
exports.listMatches = listMatches;
// Obter detalhes de uma partida específica
const getMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const match = yield Match_1.default.findByPk(req.params.id);
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        res.json(match);
    }
    catch (error) {
        console.error('Erro ao obter partida:', error);
        res.status(500).json({ message: 'Erro ao obter partida' });
    }
});
exports.getMatch = getMatch;
// Atualizar uma partida
const updateMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const match = yield Match_1.default.findByPk(req.params.id);
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        yield match.update(req.body);
        res.json(match);
    }
    catch (error) {
        console.error('Erro ao atualizar partida:', error);
        res.status(500).json({ message: 'Erro ao atualizar partida' });
    }
});
exports.updateMatch = updateMatch;
// Cancelar uma partida
const cancelMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const match = yield Match_1.default.findByPk(req.params.id);
        if (!match) {
            res.status(404).json({ message: 'Partida não encontrada' });
            return;
        }
        yield match.update({ status: 'cancelled' });
        res.json({ message: 'Partida cancelada' });
    }
    catch (error) {
        console.error('Erro ao cancelar partida:', error);
        res.status(500).json({ message: 'Erro ao cancelar partida' });
    }
});
exports.cancelMatch = cancelMatch;
