import { Response } from 'express';
import UserModel from '../models/UserModel';
import { sendPasswordResetEmail } from '../services/emailService';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { AuthRequest } from 'middleware/auth';

export const requestPasswordReset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const user = await UserModel.findOne({ where: { email } });
    
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    const resetPasswordExpires = new Date(Date.now() + 3600000);
    
    await user.update({
      resetPasswordToken: hash,
      resetPasswordExpires: resetPasswordExpires
    });
    
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
      return;
    }
    
    res.status(201).json({ message: 'Email de recuperação enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao solicitar recuperação de senha' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
      return;
    }
    
    const user = await UserModel.findOne({
      where: {
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });
    
    if (!user) {
      res.status(400).json({ message: 'Token inválido ou expirado' });
      return;
    }
    
    const userToken = user.get('resetPasswordToken') as string;
    
    if (!userToken) {
      res.status(400).json({ message: 'Token de recuperação não encontrado' });
      return;
    }
    
    const isValid = await bcrypt.compare(token, userToken);
    
    if (!isValid) {
      res.status(400).json({ message: 'Token inválido' });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao redefinir senha' });
  }
}; 
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password, newPassword, currentPassword } = req.body;
    
    const newPass = newPassword || password;
    
    if (!newPass) {
      res.status(400).json({ message: 'Nova senha é obrigatória' });
      return;
    }
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }
    
    const currentUser = await UserModel.findByPk(req.user.id);
    
    if (!currentUser) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    
    const userCurrentPassword = currentUser.get('password') as string;
    
    if (currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userCurrentPassword);
      
      if (!isCurrentPasswordValid) {
        res.status(400).json({ message: 'Senha atual incorreta' });
        return;
      }
    }
    
    const isSamePassword = await bcrypt.compare(newPass, userCurrentPassword);
    
    if (isSamePassword) {
      res.status(400).json({ message: 'A nova senha não pode ser igual à senha atual' });
      return;
    }
    
    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    
    await UserModel.update({
      password: hashedNewPassword
    }, {
      where: { id: req.user.id }
    });
    
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar senha' });
  }
};