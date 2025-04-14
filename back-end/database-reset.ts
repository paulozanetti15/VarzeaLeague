require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetDatabase() {
  try {
    // Criar conexão direta com MySQL sem usar Sequelize
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'varzealeague'
    });

    console.log('Conexão com o banco de dados estabelecida com sucesso!');

    // Desativar verificação de chaves estrangeiras
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Verificação de chaves estrangeiras desativada');

    // Obter lista de todas as tabelas
    const [tables] = await connection.query('SHOW TABLES');
    
    // Excluir todas as tabelas
    for (const tableObj of tables) {
      const tableName = Object.values(tableObj)[0];
      await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`Tabela ${tableName} excluída`);
    }

    // Reativar verificação de chaves estrangeiras
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Verificação de chaves estrangeiras reativada');

    console.log('Banco de dados resetado com sucesso!');
    console.log('Agora você pode iniciar o servidor normalmente e as tabelas serão recriadas.');

    connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Erro ao resetar o banco de dados:', error);
    process.exit(1);
  }
}

resetDatabase(); 