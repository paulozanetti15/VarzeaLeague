"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Rotas de autenticação
router.post('/register', (req, res) => {
    // TODO: Implementar registro
});
router.post('/login', (req, res) => {
    // TODO: Implementar login
});
// Rotas protegidas
router.get('/profile', auth_1.authenticateToken, (req, res) => {
    // TODO: Implementar perfil
});
exports.default = router;
