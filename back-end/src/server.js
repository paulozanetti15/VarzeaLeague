const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Teste de conexão com o banco
const connection = require('../config/database');

// Rotas
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Várzea League está funcionando!' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 