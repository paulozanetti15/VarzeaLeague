import { Request, Response } from 'express';
import { User } from '../models/User';
import { sendPasswordResetEmail } from '../services/emailService';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Gera um token aleatório
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    // Salva o token e a data de expiração
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // Envia o email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
    }

    res.json({ message: 'Email de recuperação enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Encontra o usuário com o token válido
    const user = await User.findOne({
      where: {
        resetPasswordExpires: {
          [Op.gt]: new Date() // Token ainda não expirou
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Verifica se o token corresponde
    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    // Atualiza a senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 