import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';
import userRoutes from './routes/userRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import teamRoutes from './routes/teamRoutes';
import UserModel from './models/UserModel';
import MatchModel from './models/MatchModel';
import TeamModel from './models/TeamModel';
import UserTypeModel from './models/UserTypeModel';
import MatchPlayer from './models/MatchPlayersModel';
import TeamPlayer from './models/TeamPlayerModel';
import AthleteModel from './models/AthleteModel';
import AttendanceModel from './models/AttendanceModel'; 
import AthleteRoute from './routes/AthleteRoutes'; 
import './models/associations';
import authController from './controllers/authController';
import { seedUserTypes } from './seeds/userTypes';
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
app.use('/api/teams',teamRoutes);
app.use('/api/user', userRoutes);
app.use('/api/athlete', AthleteRoute);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rota de health check
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
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    try {
      // Abordagem alternativa: primeiro apagar todas as tabelas manualmente
      console.log('Apagando todas as tabelas...');
      await sequelize.query('DROP TABLE IF EXISTS attendances');
      await sequelize.query('DROP TABLE IF EXISTS athletes');
      await sequelize.query('DROP TABLE IF EXISTS team_players');
      await sequelize.query('DROP TABLE IF EXISTS match_players');
      await sequelize.query('DROP TABLE IF EXISTS match_participants');
      await sequelize.query('DROP TABLE IF EXISTS matches');
      await sequelize.query('DROP TABLE IF EXISTS teams');
      await sequelize.query('DROP TABLE IF EXISTS users');
      await sequelize.query('DROP TABLE IF EXISTS usertype');
      console.log('Todas as tabelas foram apagadas com sucesso!');
    } catch (dropError) {
      console.error('Erro ao apagar tabelas:', dropError);
    }
    
    // Recriar todas as tabelas de uma vez
    console.log('Recriando todas as tabelas...');
    await sequelize.sync({ force: true });
    console.log('Todas as tabelas foram recriadas com sucesso!');
    
    // Inserir os tipos de usuário
    await seedUserTypes();
    console.log('Tipos de usuário inseridos com sucesso!');
    
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
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