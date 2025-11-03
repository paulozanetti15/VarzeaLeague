import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'varzealeague_secret';

interface UserAttributes {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  gender: string;
  userTypeId: number;
}

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, cpf, phone, email, password, sexo, userTypeId } = req.body;
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'E-mail já cadastrado' });
      return;
    }
    const existingCpf = await UserModel.findOne({ where: { cpf } });
    if (existingCpf) {
      res.status(400).json({ message: 'CPF já cadastrado' });
      return;
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name,
      cpf,
      phone,
      email,
      password: hashedPassword,
      gender: sexo,
      userTypeId: userTypeId || 4, // Usa o userTypeId enviado ou 4 como padrão
    });

    const userJson = user.toJSON() as UserAttributes;

    // Gerar token
    const token = jwt.sign({ userId: userJson.id }, JWT_SECRET, {
      expiresIn: '24h',
    });
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: userJson.id,
        name: userJson.name,
        email: userJson.email,
        userTypeId: userJson.userTypeId
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    // Buscar usuário
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      // Não revela se o email existe ou não (segurança)
      res.status(401).json({ message: 'Email ou senha incorretos' });
      return;
    }

    const userJson = user.toJSON() as UserAttributes;

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, userJson.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Email ou senha incorretos' });
      return;
    }

    // Gerar token
    const token = jwt.sign({ id: userJson.id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    const findIduserType = await UserModel.findOne({ where: { id: userJson.id } });
    const userWithType = findIduserType?.toJSON() as UserAttributes;

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: userJson.id,
        name: userJson.name,
        email: userJson.email,
        userTypeId: userWithType.userTypeId
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

export const verify: RequestHandler = async (req, res) => {
  try {
    const token = req.query.token as string;
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
        return;
      }
      const userId = decoded.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      const user = await UserModel.findByPk(userId);
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const userJson = user.toJSON() as UserAttributes;
      res.json({
        user: {
          id: userJson.id,
          name: userJson.name,
          email: userJson.email,
          userTypeId: userJson.userTypeId
        },
        authenticated: true
      });
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ message: 'Erro ao verificar token' });
  }
};

export default { register, login, verify }; 