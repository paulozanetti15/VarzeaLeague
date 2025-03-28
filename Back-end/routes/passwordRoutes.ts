import express, { Request, Response } from 'express';
import { sendPasswordResetEmail } from '../services/emailService';
import User from '../models/User';
import crypto from 'crypto';

const router = express.Router();

router.post('/request-reset', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Recebendo requisição de reset de senha');
    const { email } = req.body;
    console.log('Email recebido:', email);

    const user = await User.findOne({ where: { email } });
    console.log('Usuário encontrado:', user ? 'Sim' : 'Não');

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hora

    console.log('Token gerado:', resetToken);

    // Salvar token no usuário
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: tokenExpiration
    });
    console.log('Token salvo no usuário');

    // Enviar email
    console.log('Tentando enviar email...');
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    console.log('Resultado do envio:', emailSent ? 'Sucesso' : 'Falha');

    if (emailSent) {
      res.json({ message: 'Email de recuperação enviado com sucesso' });
    } else {
      res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
    }
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
  }
});

export default router; 