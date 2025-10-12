import {RequestHandler, Response } from 'express';
import UserModel from '../models/UserModel';
import { sendPasswordResetEmail } from '../services/emailService';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Op, where } from 'sequelize';
import { AuthRequest } from 'middleware/auth';
import User from '../models/UserModel';

export const requestPasswordReset = async (req: AuthRequest, res: Response) : Promise<void> => {
  try {
    const { email } = req.body;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    // Gera um token aleatório
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    const passwordToken=user.toJSON().resetPasswordToken = hash;
    const resetPasswordExpires=user.toJSON().resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.update({resetPasswordToken:passwordToken,resetPasswordExpires:resetPasswordExpires});
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    if (!emailSent) {
      res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
      return;
    }
    res.json({ message: 'Email de recuperação enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const user = await UserModel.findOne({
      where: {
        resetPasswordExpires:
        {
          [Op.gt]: new Date() 
        }
      }
    }); 
    if (!user) {
      res.status(400).json({ message: 'Token inválido ou expirado' });
      return;
    }
    const hashToken = await bcrypt.hash(token, 10);
    const isValid = user && await bcrypt.compare(hashToken, user.toJSON().resetPasswordToken);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const password=user.toJSON().password = hashedPassword;
    const resetPasswordToken=user.toJSON().resetPasswordToken = null;
    const resetPasswordTokenExpires=user.toJSON().resetPasswordExpires = null;
    await user.update({password:password,resetPasswordToken:resetPasswordToken,resetPasswordExpires:resetPasswordTokenExpires});
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    
    const isSamePassword = await bcrypt.compare(password, currentUser.password);
    if (isSamePassword) {
      res.status(400).json({ message: 'A nova senha não pode ser igual à senha atual' });
      return;
    }
    const hashedNewPassword = await bcrypt.hash(password, 10);
    await User.update({
      password: hashedNewPassword
    }, {
      where: { id: req.user.id }
    })
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
module.exports = { requestPasswordReset, resetPassword,updatePassword };