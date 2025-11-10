import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

// Debug: Verificar variáveis antes de criar conexão
console.log('🔍 [database.ts] Verificando variáveis de ambiente:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? `***(${process.env.DB_PASSWORD.length} chars)***` : 'UNDEFINED');
console.log('  DB_PORT:', process.env.DB_PORT);

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'varzealeague_db',
  dialectOptions: {
    dateStrings: true,
    typeCast: true
  },
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  logging: (msg) => {
    // Log apenas queries de CREATE TABLE e ALTER TABLE para ver criação de tabelas
    if (msg.includes('CREATE TABLE') || msg.includes('CREATE DATABASE') || msg.includes('ALTER TABLE')) {
      console.log('📊 SQL:', msg);
    }
  }
});

export default sequelize;
