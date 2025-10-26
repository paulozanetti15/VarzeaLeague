require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixMatchStatus() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'varzealeague'
    });

    console.log('Conexão com o banco estabelecida');

    // Verificar valores atuais
    const [rows] = await connection.query('SELECT DISTINCT status FROM matches');
    console.log('Valores atuais de status:', rows);

    // Primeiro, modificar a coluna para VARCHAR temporariamente
    await connection.query('ALTER TABLE matches MODIFY COLUMN status VARCHAR(50)');
    console.log('Coluna temporariamente convertida para VARCHAR');

    // Corrigir valores inválidos se necessário
    await connection.query(`
      UPDATE matches 
      SET status = 'aberta' 
      WHERE status NOT IN ('aberta', 'sem_vagas', 'em_andamento', 'confirmada', 'cancelada', 'finalizada')
    `);
    console.log('Valores inválidos corrigidos');

    // Agora converter de volta para ENUM
    await connection.query(`
      ALTER TABLE matches 
      MODIFY COLUMN status ENUM('aberta', 'sem_vagas', 'em_andamento', 'confirmada', 'cancelada', 'finalizada') 
      NOT NULL DEFAULT 'aberta'
    `);

    console.log('Coluna status corrigida com sucesso!');

    connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao corrigir coluna status:', error);
    process.exit(1);
  }
}

fixMatchStatus();
