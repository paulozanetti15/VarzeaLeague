import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/UserModel';
import Team from '../models/TeamModel';
import TeamUser from '../models/TeamUserModel';
import FriendlyMatchesModel from '../models/FriendlyMatchesModel';
import Championship from '../models/ChampionshipModel';
import FriendlyMatchGoal from '../models/FriendlyMatchGoalModel';
import FriendlyMatchCard from '../models/FriendlyMatchCardModel';
import FriendlyMatchReport from '../models/FriendlyMatchReportModel';
import FriendlyMatchesRulesModel from '../models/FriendlyMatchesRulesModel';
import FriendlyMatchTeamsModel from '../models/FriendlyMatchTeamsModel';
import FriendlyMatchEvaluation from '../models/FriendlyMatchEvaluationModel';
import { AuthRequest } from '../middleware/auth';

const validatePhone = (phone: string): boolean => {
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length === 10 || phoneDigits.length === 11;
};

const validateGender = (gender: string): boolean => {
  return ['Masculino', 'Feminino'].includes(gender);
};

const validateUserType = (userTypeId: number): boolean => {
  return [1, 2, 3, 4].includes(userTypeId);
};

const validatePassword = (password: string): boolean => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

const validateCPF = (cpf: string): boolean => {
  const cpfDigits = cpf.replace(/\D/g, '');
  
  if (cpfDigits.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cpfDigits)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpfDigits.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfDigits.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpfDigits.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfDigits.substring(10, 11))) return false;
  
  return true;
};

export const index = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      include: [{
        association: 'usertype',
        attributes: ['name']
      }]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

export const store = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, cpf, phone, gender, userTypeId, password } = req.body;
    const errors: string[] = [];

    if (!name) errors.push('Nome é obrigatório');
    if (!email) errors.push('Email é obrigatório');
    if (!cpf) errors.push('CPF é obrigatório');
    if (!phone) errors.push('Telefone é obrigatório');
    if (!gender) errors.push('Gênero é obrigatório');
    if (!password) errors.push('Senha é obrigatória');

    if (cpf && !validateCPF(cpf)) {
      errors.push('CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos)');
    }

    if (gender && !validateGender(gender)) {
      errors.push('Gênero inválido (use Masculino ou Feminino)');
    }

    if (phone && !validatePhone(phone)) {
      errors.push('Telefone inválido (use formato (XX) XXXXX-XXXX)');
    }

    if (userTypeId && !validateUserType(userTypeId)) {
      errors.push('Tipo de usuário inválido (use 1, 2, 3 ou 4)');
    }

    if (password && !validatePassword(password)) {
      errors.push('Senha inválida (mínimo 6 caracteres com maiúsculas, minúsculas, números e caracteres especiais)');
    }

    if (errors.length > 0) {
      res.status(400).json({ message: errors.join(', ') });
      return;
    }

    const normalizedName = name.trim().toLowerCase();
    const nameExists = await User.findOne({
      where: { name: normalizedName }
    });

    if (nameExists) {
      res.status(409).json({ message: 'Nome já cadastrado' });
      return;
    }

    const userExists = await User.findOne({
      where: { email }
    });

    if (userExists) {
      res.status(409).json({ message: 'Email já cadastrado' });
      return;
    }

    const cpfExists = await User.findOne({
      where: { cpf }
    });

    if (cpfExists) {
      res.status(409).json({ message: 'CPF já cadastrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email,
      cpf,
      phone,
      gender,
      userTypeId: userTypeId || 4,
      password: hashedPassword
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const errors: string[] = [];

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    if (updateData.cpf && !validateCPF(updateData.cpf)) {
      errors.push('CPF inválido (use formato XXX.XXX.XXX-XX ou 11 dígitos)');
    }

    if (updateData.gender && !validateGender(updateData.gender)) {
      errors.push('Gênero inválido (use Masculino ou Feminino)');
    }

    if (updateData.phone && !validatePhone(updateData.phone)) {
      errors.push('Telefone inválido (use formato (XX) XXXXX-XXXX)');
    }

    if (updateData.userTypeId && !validateUserType(updateData.userTypeId)) {
      errors.push('Tipo de usuário inválido (use 1, 2, 3 ou 4)');
    }

    if (updateData.password && !validatePassword(updateData.password)) {
      errors.push('Senha inválida (mínimo 6 caracteres com maiúsculas, minúsculas, números e caracteres especiais)');
    }

    if (errors.length > 0) {
      res.status(400).json({ message: errors.join(', ') });
      return;
    }

    if (updateData.name && updateData.name.trim().toLowerCase() !== user.name) {
      const normalizedName = updateData.name.trim().toLowerCase();
      const nameExists = await User.findOne({
        where: { name: normalizedName }
      });

      if (nameExists) {
        res.status(409).json({ message: 'Nome já cadastrado' });
        return;
      }
      
      updateData.name = normalizedName;
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await User.findOne({
        where: { email: updateData.email }
      });

      if (emailExists) {
        res.status(409).json({ message: 'Email já cadastrado' });
        return;
      }
    }

    if (updateData.cpf && updateData.cpf !== user.cpf) {
      const cpfExists = await User.findOne({
        where: { cpf: updateData.cpf }
      });

      if (cpfExists) {
        res.status(409).json({ message: 'CPF já cadastrado' });
        return;
      }
    }

    delete updateData.cpf;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await user.update(updateData);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    const captainedTeams = await Team.count({ where: { captainId: id } });

    if (captainedTeams > 0) {
      res.status(400).json({ 
        message: `Impossível excluir usuário. Existem ${captainedTeams} time(s) como capitão. Transfira a capitania antes de excluir.` 
      });
      return;
    }

    const organizedMatches = await FriendlyMatchesModel.findAll({ 
      where: { organizerId: id },
      attributes: ['id']
    });

    if (organizedMatches.length > 0) {
      const matchIds = organizedMatches.map(m => m.id);

      await FriendlyMatchEvaluation.destroy({ where: { match_id: matchIds } });
      await FriendlyMatchGoal.destroy({ where: { match_id: matchIds } });
      await FriendlyMatchCard.destroy({ where: { match_id: matchIds } });
      await FriendlyMatchReport.destroy({ where: { match_id: matchIds } });
      await FriendlyMatchesRulesModel.destroy({ where: { matchId: matchIds } });
      await FriendlyMatchTeamsModel.destroy({ where: { matchId: matchIds } });
      await FriendlyMatchesModel.destroy({ where: { id: matchIds } });
    }

    const createdChampionships = await Championship.findAll({ 
      where: { created_by: id },
      attributes: ['id']
    });

    if (createdChampionships.length > 0) {
      const champIds = createdChampionships.map(c => c.id);
      await Championship.destroy({ where: { id: champIds } });
    }

    await TeamUser.destroy({ where: { userId: id } });

    await user.destroy();

    const deletedCount = {
      partidas: organizedMatches.length,
      campeonatos: createdChampionships.length
    };

    res.status(200).json({ 
      message: 'Usuário excluído com sucesso',
      deletedResources: deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [{
        association: 'usertype',
        attributes: ['name']
      }]
    });
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};