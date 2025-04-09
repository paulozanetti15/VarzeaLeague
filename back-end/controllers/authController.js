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
exports.verify = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || 'varzealeague_secret';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existingUser = yield User_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Email já cadastrado' });
            return;
        }
        // Criptografar a senha
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield User_1.default.create({
            name,
            email,
            password: hashedPassword
        });
        const userJson = user.toJSON();
        // Gerar token
        const token = jsonwebtoken_1.default.sign({ userId: userJson.id }, JWT_SECRET, {
            expiresIn: '24h',
        });
        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            token,
            user: {
                id: userJson.id,
                name: userJson.name,
                email: userJson.email,
            },
        });
    }
    catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Buscar usuário
        const user = yield User_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Email ou senha inválidos' });
            return;
        }
        const userJson = user.toJSON();
        // Verificar senha
        const isValidPassword = yield bcryptjs_1.default.compare(password, userJson.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Email ou senha inválidos' });
            return;
        }
        // Gerar token
        const token = jsonwebtoken_1.default.sign({ userId: userJson.id }, JWT_SECRET, {
            expiresIn: '24h',
        });
        res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: userJson.id,
                name: userJson.name,
                email: userJson.email,
            },
        });
    }
    catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});
exports.login = login;
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authReq = req;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        const userJson = user.toJSON();
        res.json({
            user: {
                id: userJson.id,
                name: userJson.name,
                email: userJson.email
            },
            authenticated: true
        });
    }
    catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({ error: 'Erro ao verificar autenticação' });
    }
});
exports.verify = verify;
exports.default = { register: exports.register, login: exports.login, verify: exports.verify };
