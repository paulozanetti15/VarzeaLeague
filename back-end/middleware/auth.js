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
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        console.log(`Middleware de autenticação: Rota acessada: ${req.method} ${req.originalUrl}`);
        console.log(`Middleware de autenticação: Cabeçalho recebido: ${authHeader ? 'Sim' : 'Não'}`);
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            console.log('Middleware de autenticação: Token não fornecido');
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'varzealeague_secret';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log(`Middleware de autenticação: Token verificado para usuário ${decoded.userId}`);
        req.user = { id: decoded.userId };
        next();
    }
    catch (error) {
        console.error('Erro ao verificar token:', error);
        console.log(`Middleware de autenticação: Erro de verificação - Token inválido ou expirado`);
        res.status(403).json({ error: 'Token inválido' });
    }
});
exports.authenticateToken = authenticateToken;
