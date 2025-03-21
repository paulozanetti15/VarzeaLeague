import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/databaseconfig';
import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';
import './models/User';
import './models/Match';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Várzea League está funcionando!' });
});

// Log de rotas não encontradas
app.use((req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Rota não encontrada' });
});

(async()=>{
  try {
    console.log('Tentando conectar ao banco de dados...');
    console.log('Configurações do banco:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida com sucesso!');
    
    console.log('Sincronizando modelos com o banco de dados...');
    await sequelize.sync(); // Sincroniza com o banco sem recriar as tabelas
    console.log('Banco de dados sincronizado com sucesso!');
    
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log('Rotas disponíveis:');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/register');
      console.log('- POST /api/matches');
      console.log('- GET /api/matches');
      console.log('- GET /api/matches/:id');
      console.log('- POST /api/matches/:id/join');
    });
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
    process.exit(1);
  }
})();

export default app;