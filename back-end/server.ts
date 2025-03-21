// Carrega as variáveis de ambiente ANTES de qualquer importação
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Resto das importações
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import sequelize from './config/databaseconfig';
import './models/User'; // Importando o modelo User

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Teste de conexão com o banco


// Rotas
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Várzea League está funcionando!' });
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
    await sequelize.sync(); // Sincroniza com o banco (force: true recria as tabelas)
    console.log('Banco de dados sincronizado com sucesso!');
    
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
    process.exit(1);
  }
})();