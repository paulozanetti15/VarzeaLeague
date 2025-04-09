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
exports.resetPassword = exports.requestPasswordReset = void 0;
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = require("../services/emailService");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ where: { email } });
        user.toJSON();
        if (!user) {
            console.log("Usuário não encontrado");
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        // Gera um token aleatório
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hash = yield bcrypt_1.default.hash(resetToken, 10);
        // Salva o token e a data de expiração
        const passwordToken = user.toJSON().resetPasswordToken = hash;
        const resetPasswordExpires = user.toJSON().resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
        yield user.update({ resetPasswordToken: passwordToken, resetPasswordExpires: resetPasswordExpires });
        const emailSent = yield (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        if (!emailSent) {
            return res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
        }
        res.json({ message: 'Email de recuperação enviado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        const user = yield User_1.default.findOne({
            where: {
                resetPasswordExpires: {
                    [sequelize_1.Op.gt]: new Date() // Token ainda não expirou
                }
            }
        });
        if (!user) {
            console.log("Token inválido ou expirado");
            return res.status(400).json({ message: 'Token inválido ou expirado' });
        }
        const hashToken = yield bcrypt_1.default.hash(token, 10);
        const isValid = user && (yield bcrypt_1.default.compare(hashToken, user.toJSON().resetPasswordToken));
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const password = user.toJSON().password = hashedPassword;
        const resetPasswordToken = user.toJSON().resetPasswordToken = null;
        const resetPasswordTokenExpires = user.toJSON().resetPasswordExpires = null;
        yield user.update({ password: password, resetPasswordToken: resetPasswordToken, resetPasswordExpires: resetPasswordTokenExpires });
        console.log('Senha atualizada com sucesso');
        res.status(200).json({ message: 'Senha atualizada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.resetPassword = resetPassword;
module.exports = { requestPasswordReset: exports.requestPasswordReset, resetPassword: exports.resetPassword };
