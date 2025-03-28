import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';

// Carrega as variáveis de ambiente usando caminho absoluto
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('Caminho do .env:', path.resolve(__dirname, '.env'));
console.log('Arquivo .env carregado:', !result.error);
console.log('Variáveis de ambiente:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT
});

const sequelize = new Sequelize(
  process.env.DB_NAME || 'varzealeague_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '914914',
  {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    logging: console.log
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar:', error);
  } finally {
    process.exit();
  }
}

testConnection(); 