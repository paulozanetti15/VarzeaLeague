import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/UserModel';
import { AuthRequest } from '../middleware/auth';

export const index = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      include: [{
        association: 'usertype',
        attributes: ['name']
      }]
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

export const store = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, cpf, phone, sexo, userTypeId, password } = req.body;

    const userExists = await User.findOne({
      where: { email }
    });

    if (userExists) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    const cpfExists = await User.findOne({
      where: { cpf }
    });

    if (cpfExists) {
      res.status(400).json({ error: 'CPF já cadastrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      cpf,
      phone,
      sexo,
      userTypeId,
      password: hashedPassword
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, cpf, phone, sexo, userTypeId, password } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    if (email !== user.email) {
      const emailExists = await User.findOne({
        where: { email }
      });

      if (emailExists) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }
    }

    if (cpf !== user.cpf) {
      const cpfExists = await User.findOne({
        where: { cpf }
      });

      if (cpfExists) {
        res.status(400).json({ error: 'CPF já cadastrado' });
        return;
      }
    }

    const updateData: any = {
      name,
      email,
      cpf,
      phone,
      sexo,
      userTypeId
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    await user.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
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
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};