import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import friendlyMatchRoutes from './routes/friendlyMatchRoutes';
import userRoutes from './routes/userRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import teamRoutes from './routes/teamRoutes';
import playerRoutes from './routes/playerRoutes';
import UserModel from './models/UserModel';
import MatchModel from './models/MatchModel';
import TeamModel from './models/TeamModel';
import PlayerModel from './models/PlayerModel';
import UserTypeModel from './models/UserTypeModel';
import MatchTeams from './models/MatchTeamsModel';
import TeamPlayer from './models/TeamPlayerModel';
import RulesModel from './models/RulesModel';
import AttendanceModel from './models/AttendanceModel'; 
import RulesRoutes from './routes/matchRulesRoutes'; 
import TeamPlayerRoutes from './routes/teamPlayerRoutes';
import { seedUserTypes } from './seeds/userTypes';
import { associateModels } from './models/associations'; 
import FriendlyMatchPenalty from './models/FriendlyMatchPenaltyModel';
import ChampionshipPenalty from './models/ChampionshipPenaltyModel';
import fs from 'fs';
import championshipRoutes from './routes/championshipRoutes';
import userTypeRoutes from './routes/userTypeRoutes';
import overviewRoutes from './routes/overviewRoutes';
import rankingRoutes from './routes/rankingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import MatchChampionship from './models/MatchChampionshipModel';
import MatchChampionshpReport from './models/MatchReportChampionshipModel';
import { ErrorRequestHandler } from 'express-serve-static-core';
dotenv.config();
// Import status check helpers to run periodically
import {
  checkAndSetMatchesInProgress,
  checkAndConfirmFullMatches,
  checkAndStartConfirmedMatches
} from './controllers/matchController';

const app = express();

const uploadDir = path.join(__dirname, 'uploads/teams');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório criado: ${uploadDir}`);
}

const championshipUploadDir = path.join(__dirname, 'uploads/championships');
if (!fs.existsSync(championshipUploadDir)) {
  fs.mkdirSync(championshipUploadDir, { recursive: true });
  console.log(`Diretório criado: ${championshipUploadDir}`);
}
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/matches', friendlyMatchRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/teamplayers', TeamPlayerRoutes);
app.use('/api/teams',teamRoutes);
app.use('/api/user', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/rules', RulesRoutes);
app.use('/api/championships', championshipRoutes);
app.use('/api/usertypes', userTypeRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/notifications', notificationRoutes);

// Middleware de tratamento de erros global
// Deve ser o último middleware, após todas as rotas
const errorHandler: ErrorRequestHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('=== ERRO GLOBAL CAPTURADO ===');
  console.error('Erro:', err);
  console.error('Stack:', err?.stack);
  
  // Se a resposta já foi enviada, delegar para o handler padrão do Express
  if (res.headersSent) {
    next(err);
    return;
  }
  
  // Se for erro de validação do Sequelize
  if (err?.name === 'SequelizeValidationError') {
    const validationErrors = err.errors?.map((e: any) => `${e.path}: ${e.message}`).join(', ') || err.message;
    res.status(400).json({
      error: 'Erro de validação',
      message: validationErrors,
      details: err.errors
    });
    return;
  }
  
  // Se for erro de foreign key constraint
  if (err?.name === 'SequelizeForeignKeyConstraintError') {
    res.status(400).json({
      error: 'Erro de referência',
      message: 'Um ou mais dados referenciados não existem no banco de dados',
      details: err.message
    });
    return;
  }
  
  // Se for erro de database
  if (err?.name === 'SequelizeDatabaseError') {
    res.status(500).json({
      error: 'Erro no banco de dados',
      message: err.message
    });
    return;
  }
  
  // Erro genérico
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    associateModels(); // Execute a função de associação aqui
    console.log('Associações entre modelos definidas com sucesso.');
    await sequelize.sync();
    await UserTypeModel.sync();
    console.log('Modelo UserType sincronizado.');
    
    await UserModel.sync();
    console.log('Modelo User sincronizado.');
    
    await TeamModel.sync();
  
    console.log('Modelo Team sincronizado.');
    
    await PlayerModel.sync();
    console.log('Modelo Player sincronizado.');
    
    await MatchModel.sync();
    console.log('Modelo Match sincronizado.');
    
    await MatchTeams.sync(); 
    console.log('Modelo MatchTeams sincronizado.');
    
    await TeamPlayer.sync();
    console.log('Modelo TeamPlayer sincronizado.');
    
    await RulesModel.sync();
    console.log('Modelo Rules sincronizado.');
    
    await AttendanceModel.sync();
    console.log('Modelo Attendance sincronizado.');
     
  await FriendlyMatchPenalty.sync();
  console.log('Modelo Punicao Partida Amistosa sincronizado.');

    // Modelos adicionados na modelagem v2
    const { default: ChampionshipModel } = await import('./models/ChampionshipModel');
    await ChampionshipModel.sync();
    console.log('Modelo Championship sincronizado.');
    
  const { default: MatchReportModel } = await import('./models/MatchReportModel');
    await MatchReportModel.sync();
    console.log('Modelo MatchReport sincronizado.');
    
  const { default: MatchGoalModel } = await import('./models/MatchGoalModel');
  await MatchGoalModel.sync({ alter: true }); // garantir colunas novas (player_id)
    console.log('Modelo MatchGoal sincronizado.');
    
  const { default: MatchCardModel } = await import('./models/MatchCardModel');
  await MatchCardModel.sync({ alter: true }); // garantir colunas novas (player_id)
    console.log('Modelo MatchCard sincronizado.');
    
  const { default: MatchEvaluationModel } = await import('./models/MatchEvaluationModel');
    await MatchEvaluationModel.sync();
    console.log('Modelo MatchEvaluation sincronizado.');
    await MatchChampionship.sync();
    console.log('Modelo MatchChampionship sincronizado.');
    await MatchChampionshpReport.sync();
    console.log('Modelo MatchChampionshpReport sincronizado.');
  await ChampionshipPenalty.sync();
  console.log('Modelo Punicao Championship sincronizado.');
    
    const { default: NotificationModel } = await import('./models/NotificationModel');
    await NotificationModel.sync();
    console.log('Modelo Notification sincronizado.');
    
    await seedUserTypes();
    
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
      console.log('- POST /api/players');
      console.log('- GET /api/players/team/:teamId');
      console.log('- POST /api/players/add-to-team');
      console.log('- GET /api/overview');
    });

    // Run status checks on startup and every minute
    const runStatusChecks = async () => {
      try {
        await checkAndConfirmFullMatches();
        await checkAndSetMatchesInProgress();
        await checkAndStartConfirmedMatches();
      } catch (err) {
        console.error('Erro ao executar verificações de status agendadas:', err);
      }
    };

    runStatusChecks();
    setInterval(runStatusChecks, 60 * 1000);
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();
