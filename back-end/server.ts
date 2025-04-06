import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/databaseconfig';
import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';
import passwordResetRoutes from './routes/passwordReset';
import teamRoutes from './routes/teamRoutes';
import dbRoutes from './routes/dbRoutes';
import MatchPlayer from './models/match_players';
import './models/associations';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/db', dbRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rota de health check aprimorada
app.get('/api/health', (req, res) => {
  try {
    // Verificar se o banco de dados está conectado
    const dbStatus = sequelize.authenticate()
      .then(() => true)
      .catch(() => false);
    
    // Responder imediatamente sem esperar a verificação do banco
    res.status(200).json({ 
      status: 'ok', 
      timestamp: Date.now(),
      features: {
        api: true,
        auth: true
      },
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        nodeVersion: process.version
      }
    });
    
    // Log para depuração
    console.log(`Health check realizado em ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({ 
      status: 'error', 
      timestamp: Date.now(),
      message: 'Erro interno no servidor durante health check'
    });
  }
});

// Conexão com o banco de dados
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Sincronizar especificamente o modelo MatchPlayer primeiro
    await MatchPlayer.sync();
    console.log('Modelo MatchPlayer sincronizado.');
    
    // Sincronizar modelos sem forçar recriação
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log('Rotas disponíveis:');
      console.log('- POST /api/auth/register');
      console.log('- POST /api/auth/login');
      console.log('- GET /api/matches');
      console.log('- POST /api/matches');
      console.log('- GET /api/teams');
      console.log('- POST /api/teams');
      console.log('- PUT /api/teams/:id');
      console.log('- POST /api/teams/:id/banner');
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();
