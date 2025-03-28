import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';

const JWT_SECRET = 'varzealeague_secret'; // Em produção, isso deve vir de variáveis de ambiente

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUsers = await UserModel.findAll({ where: { email: email } });

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await UserModel.create({ name:name, email:email, password: hashedPassword })  as unknown as { id: number, name: string, email: string };
    const findUser = await UserModel.findOne({ where: { email: email } });
    const user = findUser[0];

    // Gerar token
    const token = jwt.sign({ userId: user }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: result.id,
        name,
        email,
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

    // Buscar usuário
    const users = await UserModel.findAll({ where: { email: email } });

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const user = users[0].toJSON();

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};
export default { register, login }; 