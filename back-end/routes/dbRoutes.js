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
const match_players_1 = __importDefault(require("../models/match_players"));
const router = express_1.default.Router();
// Rota para verificar e criar a tabela match_players
router.post('/create-match-players-table', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Verificar se o usuário é administrador (exemplo)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || userId !== 1) {
            res.status(403).json({ message: 'Permissão negada' });
            return;
        }
        // Criar a tabela match_players
        try {
            yield match_players_1.default.sync({ force: false });
            // Executar consulta direta para garantir restrições
            yield ((_b = Match_1.default.sequelize) === null || _b === void 0 ? void 0 : _b.query(`
        CREATE TABLE IF NOT EXISTS match_players (
          match_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (match_id, user_id),
          FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `));
            res.status(201).json({ message: 'Tabela match_players criada/verificada com sucesso!' });
        }
        catch (error) {
            console.error('Erro ao criar tabela:', error);
            res.status(500).json({ message: 'Erro ao criar tabela match_players' });
        }
    }
    catch (error) {
        console.error('Erro na rota:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
exports.default = router;
