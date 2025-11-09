import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import friendlyMatchRoutes from './routes/friendlyMatchRoutes';
import userRoutes from './routes/userRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import teamRoutes from './routes/teamRoutes';
import playerRoutes from './routes/playerRoutes';
import UserModel from './models/UserModel';
import MatchModel from './models/FriendlyMatchesModel';
import TeamModel from './models/TeamModel';
import PlayerModel from './models/PlayerModel';
import UserTypeModel from './models/UserTypeModel';
import MatchTeams from './models/FriendlyMatchTeamsModel';
import TeamPlayer from './models/TeamPlayerModel';
import RulesModel from './models/FriendlyMatchesRulesModel';
import AttendanceModel from './models/FriendlyMatchEvaluationModel';
import RulesRoutes from './routes/matchRulesRoutes'; 
import TeamPlayerRoutes from './routes/teamPlayerRoutes';
import friendlyMatchReportRoutes from './routes/friendlyMatchReportRoutes';
import championshipReportRoutes from './routes/championshipReportRoutes';
import punishmentRoutes from './routes/punishmentRoutes';
import { seedUserTypes } from './seeds/userTypes';
import { associateModels } from './models/associations'; 
import FriendlyMatchPenalty from './models/FriendlyMatchPenaltyModel';
import ChampionshipPenalty from './models/ChampionshipPenaltyModel';
import ChampionshipMatchGoal from './models/ChampionshipMatchGoalModel';
import ChampionshipMatchCard from './models/ChampionshipMatchCardModel';
import fs from 'fs';
import championshipRoutes from './routes/championshipRoutes';
import userTypeRoutes from './routes/userTypeRoutes';
import overviewRoutes from './routes/overviewRoutes';
import rankingRoutes from './routes/rankingRoutes';
import MatchChampionship from './models/MatchChampionshipModel';
import MatchChampionshpReport from './models/MatchReportChampionshipModel';
import MatchChampionshipTeams from './models/MatchChampionshipTeamsModel';
dotenv.config();

import {
  checkAndSetMatchesInProgress,
  checkAndConfirmFullMatches,
  checkAndStartConfirmedMatches
} from './services/FriendlyMatchStatusService';

const app = express();

const uploadDir = path.join(__dirname, 'uploads/teams');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório criado: ${uploadDir}`);
}
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VarzeaLeague API Documentation',
  customfavIcon: '/assets/favicon.ico'
}));

app.use('/api/auth', authRoutes);
app.use('/api/friendly-matches', friendlyMatchRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/team-players', TeamPlayerRoutes);
app.use('/api/teams',teamRoutes);
app.use('/api/user', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/match-rules', RulesRoutes);
app.use('/api/championships', championshipRoutes);
app.use('/api/usertypes', userTypeRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/friendly-match-reports', friendlyMatchReportRoutes);
app.use('/api/championship-reports', championshipReportRoutes);
app.use('/api/punishments', punishmentRoutes);

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

    const { default: ChampionshipModel } = await import('./models/ChampionshipModel');
    await ChampionshipModel.sync();
    console.log('Modelo Championship sincronizado.');
    
    const { default: ChampionshipApplicationModel } = await import('./models/ChampionshipApplicationModel');
    await ChampionshipApplicationModel.sync();
    console.log('Modelo ChampionshipApplication sincronizado.');
    
    const { default: ChampionshipGroupModel } = await import('./models/ChampionshipGroupModel');
    await ChampionshipGroupModel.sync();
    console.log('Modelo ChampionshipGroup sincronizado.');
    
    const { default: TeamChampionshipModel } = await import('./models/TeamChampionshipModel');
    await TeamChampionshipModel.sync();
    console.log('Modelo TeamChampionship sincronizado.');
    
    const { default: FriendlyMatchReportModel } = await import('./models/FriendlyMatchReportModel');
    await FriendlyMatchReportModel.sync();
    console.log('Modelo FriendlyMatchReport sincronizado.');
    
    const { default: FriendlyMatchGoalModel } = await import('./models/FriendlyMatchGoalModel');
    await FriendlyMatchGoalModel.sync({ alter: true });
    console.log('Modelo FriendlyMatchGoal sincronizado.');
    
    const { default: FriendlyMatchCardModel } = await import('./models/FriendlyMatchCardModel');
    await FriendlyMatchCardModel.sync({ alter: true });
    console.log('Modelo FriendlyMatchCard sincronizado.');
    
    const { default: FriendlyMatchEvaluationModel } = await import('./models/FriendlyMatchEvaluationModel');
    await FriendlyMatchEvaluationModel.sync();
    console.log('Modelo FriendlyMatchEvaluation sincronizado.');
    
    await MatchChampionship.sync();
    console.log('Modelo MatchChampionship sincronizado.');
    
    await MatchChampionshpReport.sync();
    console.log('Modelo MatchChampionshipReport sincronizado.');
    
    await ChampionshipPenalty.sync();
    console.log('Modelo ChampionshipPenalty sincronizado.');
    
    await ChampionshipMatchGoal.sync();
    console.log('Modelo ChampionshipMatchGoal sincronizado.');
    
    await ChampionshipMatchCard.sync();
    console.log('Modelo ChampionshipMatchCard sincronizado.');
    
    await seedUserTypes();
    await MatchChampionshipTeams.sync();
    console.log('Modelo MatchChampionshipTeams sincronizado.');
    
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(`📚 Documentação Swagger disponível em: http://localhost:${port}/api-docs`);
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
