const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/database');

const JWT_SECRET = 'varzealeague_secret'; // Em produção, isso deve vir de variáveis de ambiente

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o email já existe
    const [existingUsers] = await connection.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserir usuário
    const [result] = await connection.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Gerar token
    const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const [users] = await connection.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const user = users[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
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

module.exports = {
  register,
  login,
}; 