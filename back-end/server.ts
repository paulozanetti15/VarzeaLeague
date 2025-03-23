import express from 'express';
import cors from 'cors';
import router  from './routes/authRoutes';
import routerReset from './routes/passwordReset';
import dotenv from 'dotenv';
import sequelize from './config/databaseconfig';
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', router);
app.use('/api/password', routerReset);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Várzea League está funcionando!' });
});

(async()=>{
  try {
    await sequelize.sync(); // Sincroniza com o banco (force: true recria as tabelas)
    sequelize.authenticate();
    console.log('Banco de dados sincronizado com sucesso!');
    app.listen(process.env.PORT, () => {
      console.log(`Servidor rodando na porta ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
})()