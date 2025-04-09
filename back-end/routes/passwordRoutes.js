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
const emailService_1 = require("../services/emailService");
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
router.post('/request-reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Recebendo requisição de reset de senha');
        const { email } = req.body;
        console.log('Email recebido:', email);
        const user = yield User_1.default.findOne({ where: { email } });
        console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        // Gerar token de reset
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenExpiration = new Date(Date.now() + 3600000); // 1 hora
        console.log('Token gerado:', resetToken);
        // Salvar token no usuário
        yield user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: tokenExpiration
        });
        console.log('Token salvo no usuário');
        // Enviar email
        console.log('Tentando enviar email...');
        const emailSent = yield (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        console.log('Resultado do envio:', emailSent ? 'Sucesso' : 'Falha');
        if (emailSent) {
            res.json({ message: 'Email de recuperação enviado com sucesso' });
        }
        else {
            res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
        }
    }
    catch (error) {
        console.error('Erro ao processar recuperação de senha:', error);
        res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
    }
}));
exports.default = router;
