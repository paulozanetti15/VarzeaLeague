import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { Model } from 'sequelize';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'varzealeague_secret';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword
    }) as Model<UserAttributes>;

    const token = jwt.sign(
      { id: user.get('id'), email: user.get('email') },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user.get('id'),
        name: user.get('name'),
        email: user.get('email'),
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ where: { email } }) as Model<UserAttributes> | null;

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const isValidPassword = await bcrypt.compare(password, user.get('password') as string);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.get('id'), email: user.get('email') },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.get('id'),
        name: user.get('name'),
        email: user.get('email'),
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

export default { register, login }; 