import { Request, Response } from 'express';
import UserModel from '../models/User';
import { sendPasswordResetEmail } from '../services/emailService';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
export const requestPasswordReset = async (req,res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ where: { email } });
    user.toJSON();

    if (!user) {
      console.log("Usuário não encontrado");
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    // Gera um token aleatório
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    // Salva o token e a data de expiração
    const passwordToken=user.toJSON().resetPasswordToken = hash;
    const resetPasswordExpires=user.toJSON().resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.update({resetPasswordToken:passwordToken,resetPasswordExpires:resetPasswordExpires});
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

export const resetPassword = async (req,res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await UserModel.findOne({
      where: {
        resetPasswordExpires:
        {
          [Op.gt]: new Date() // Token ainda não expirou
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Verifica se o token corresponde
    const isValid = await bcrypt.compare(token, user.toJSON().resetPasswordToken);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Token inválido' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const password=user.toJSON().password = hashedPassword;
    const resetPasswordToken=user.toJSON().resetPasswordToken = null;
    const resetPasswordTokenExpires=user.toJSON().resetPasswordExpires = null;
    await user.update({password:password,resetPasswordToken:resetPasswordToken,resetPasswordExpires:resetPasswordTokenExpires});
    console.log('Senha atualizada com sucesso');
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 
module.exports = { requestPasswordReset, resetPassword };