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

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, cpf, phone, email, password, gender, userTypeId } = req.body;
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
    const nameExists = await UserModel.findOne({ where: { name: normalizedName } });
    if (nameExists) {
      res.status(409).json({ message: 'Este nome de usuário já está em uso. Por favor, escolha outro nome.' });
      return;
    }

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.' });
      return;
    }

    const existingCpf = await UserModel.findOne({ where: { cpf } });
    if (existingCpf) {
      res.status(409).json({ message: 'Este CPF já está cadastrado no sistema.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name: normalizedName,
      cpf,
      phone,
      email,
      password: hashedPassword,
      gender,
      userTypeId: userTypeId || 4,
    });

    const userJson = user.toJSON() as UserAttributes;

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
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string;
    
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
        return;
      }
      
      const userId = decoded.id || decoded.userId;
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