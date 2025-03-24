import express from 'express';
import passwordRoutes from './routes/passwordRoutes';

const app = express();

// Registrar as rotas de recuperação de senha
app.use('/api/password', passwordRoutes);

// ... resto do código ... 