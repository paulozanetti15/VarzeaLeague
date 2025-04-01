require('dotenv').config();
const mysql = require('mysql2/promise');

async function addIsDeletedColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Verifica se a coluna já existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'teams' 
      AND COLUMN_NAME = 'is_deleted'
    `);

    if (columns.length === 0) {
      // Adiciona a coluna se ela não existir
      await connection.execute(`
        ALTER TABLE teams 
        ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false
      `);
      console.log('Coluna is_deleted adicionada com sucesso!');
    } else {
      console.log('A coluna is_deleted já existe.');
    }
  } catch (error) {
    console.error('Erro ao adicionar coluna:', error);
  } finally {
    await connection.end();
  }
}

addIsDeletedColumn(); 