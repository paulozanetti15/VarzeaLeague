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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const passwordReset_1 = __importDefault(require("./routes/passwordReset"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const dbRoutes_1 = __importDefault(require("./routes/dbRoutes"));
const match_players_1 = __importDefault(require("./models/match_players"));
require("./models/associations");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Rotas
app.use('/api/auth', authRoutes_1.default);
app.use('/api/matches', matchRoutes_1.default);
app.use('/api/password-reset', passwordReset_1.default);
app.use('/api/teams', teamRoutes_1.default);
app.use('/api/db', dbRoutes_1.default);
// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API está funcionando!' });
});
// Rota de health check aprimorada
app.get('/api/health', (req, res) => {
    try {
        // Verificar se o banco de dados está conectado
        const dbStatus = database_1.default.authenticate()
            .then(() => true)
            .catch(() => false);
        // Responder imediatamente sem esperar a verificação do banco
        res.status(200).json({
            status: 'ok',
            timestamp: Date.now(),
            features: {
                api: true,
                auth: true
            },
            server: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                nodeVersion: process.version
            }
        });
        // Log para depuração
        console.log(`Health check realizado em ${new Date().toISOString()}`);
    }
    catch (error) {
        console.error('Erro no health check:', error);
        res.status(500).json({
            status: 'error',
            timestamp: Date.now(),
            message: 'Erro interno no servidor durante health check'
        });
    }
});
// Conexão com o banco de dados
const PORT = process.env.PORT || 3001;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        // Sincronizar especificamente o modelo MatchPlayer primeiro
        yield match_players_1.default.sync();
        console.log('Modelo MatchPlayer sincronizado.');
        // Sincronizar modelos sem forçar recriação
        yield database_1.default.sync();
        console.log('Modelos sincronizados com o banco de dados.');
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log('Rotas disponíveis:');
            console.log('- POST /api/auth/register');
            console.log('- POST /api/auth/login');
            console.log('- GET /api/matches');
            console.log('- POST /api/matches');
            console.log('- GET /api/teams');
            console.log('- POST /api/teams');
            console.log('- PUT /api/teams/:id');
            console.log('- POST /api/teams/:id/banner');
        });
    }
    catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
});
startServer();
