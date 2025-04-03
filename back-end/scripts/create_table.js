const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Conectado ao banco de dados.');

    // Ler o script SQL
    const sqlScript = fs.readFileSync(
      path.resolve(__dirname, './create_match_players_table.sql'),
      'utf8'
    );

    // Executar o script SQL
    await connection.query(sqlScript);
    console.log('Tabela match_players verificada/criada com sucesso!');

    await connection.end();
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    process.exit(1);
  }
}

createTable(); 