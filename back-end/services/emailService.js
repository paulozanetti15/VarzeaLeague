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
exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
        user: "apikey", // No SendGrid, o usuário é sempre "apikey"
        pass: process.env.SENDGRID_API_KEY, // Sua chave de API do SendGrid
    },
});
const sendPasswordResetEmail = (email, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Iniciando envio de email para:', email);
    console.log('Usando remetente:', process.env.EMAIL_USER);
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperação de Senha - Várzea League',
        html: `
      <div style="font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <h2 style="color: #2c3e50;">Recuperação de Senha</h2>
  <p>Você solicitou a recuperação de senha da sua conta na Várzea League.</p>
  <p>Clique no botão abaixo para redefinir sua senha:</p>
  <div style="text-align: center; display: flex; justify-content: center;">
    <a href="${resetLink}"
       style="background-color: #3498db;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;">
      Redefinir Senha
    </a>
  </div>
  <p style="color: #666;">Se você não solicitou a recuperação de senha, ignore este email.</p>
  <p style="color: #666;">Este link expirará em 1 hora.</p>
  <hr style="border: 1px solid #eee; margin: 30px 0;" />
  <p style="color: #666; font-size: 12px;">
    Este é um email automático, por favor não responda.
  </p>
</div>
    `
    };
    try {
        console.log('Tentando enviar email...');
        const result = yield transporter.sendMail(mailOptions);
        console.log('Email enviado com sucesso:', result);
        return true;
    }
    catch (error) {
        console.error('Erro detalhado ao enviar email:', {
            error,
            stack: error.stack,
            code: error.code,
            response: error.response
        });
        return false;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
