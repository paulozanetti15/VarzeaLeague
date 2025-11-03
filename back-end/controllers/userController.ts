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
import { AuthRequest } from '../middleware/auth';

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
    const { name, email, cpf, phone, sexo, userTypeId, password } = req.body;

    const userExists = await User.findOne({
      where: { email }
    });

    if (userExists) {
      res.status(400).json({ message: 'Email já cadastrado' });
      return;
    }

    const cpfExists = await User.findOne({
      where: { cpf }
    });

    if (cpfExists) {
      res.status(400).json({ message: 'CPF já cadastrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      cpf,
      phone,
      gender: sexo,
      userTypeId,
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

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await User.findOne({
        where: { email: updateData.email }
      });

      if (emailExists) {
        res.status(400).json({ message: 'Email já cadastrado' });
        return;
      }
    }

    delete updateData.cpf;
    delete updateData.userTypeId;

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

    const [captainedTeams, teamMemberships, organizedMatches, createdChampionships, goals, cards, reports] = await Promise.all([
      Team.count({ where: { captainId: id } }),
      TeamUser.count({ where: { userId: id } }),
      FriendlyMatchesModel.count({ where: { organizerId: id } }),
      Championship.count({ where: { created_by: id } }),
      FriendlyMatchGoal.count({ where: { user_id: id } }),
      FriendlyMatchCard.count({ where: { user_id: id } }),
      FriendlyMatchReport.count({ where: { created_by: id } }),
    ]);

    const reasons: string[] = [];
    if (captainedTeams) reasons.push(`${captainedTeams} time(s) como capitão`);
    if (teamMemberships) reasons.push(`${teamMemberships} associação(ões) a time(s)`);
    if (organizedMatches) reasons.push(`${organizedMatches} partida(s) organizadas`);
    if (createdChampionships) reasons.push(`${createdChampionships} campeonato(s) criados`);
    if (goals) reasons.push(`${goals} gol(s) registrados`);
    if (cards) reasons.push(`${cards} cartão(ões) registrados`);
    if (reports) reasons.push(`${reports} relatório(s) de partida`);

    if (reasons.length > 0) {
      res.status(400).json({ message: `Impossível excluir usuário. Existem registros relacionados: ${reasons.join(', ')}. Remova ou reatribua-os antes de tentar excluir.` });
      return;
    }

    await user.destroy();

    res.status(200).json({ message: 'Usuário excluído com sucesso' });
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