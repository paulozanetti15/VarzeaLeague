require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabaseTables() {
  // Configuração da conexão do banco de dados
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'varzealeague',
  });

  try {
    console.log('Conectado ao banco de dados. Verificando tabelas...');

    // Verificar estrutura da tabela teams
    console.log('\n--- Estrutura da tabela teams ---');
    const [teamsFields] = await connection.query('DESCRIBE teams');
    teamsFields.forEach(field => {
      console.log(`${field.Field}: ${field.Type}, ${field.Null}, ${field.Key}, ${field.Default}`);
    });

    // Verificar índices na tabela teams
    console.log('\n--- Índices da tabela teams ---');
    const [teamsIndices] = await connection.query('SHOW INDEX FROM teams');
    teamsIndices.forEach(index => {
      console.log(`${index.Key_name}, Column: ${index.Column_name}, Non_unique: ${index.Non_unique}`);
    });

    // Verificar relação entre times e jogadores
    console.log('\n--- Estrutura da tabela de relação time-jogador ---');
    const [joinTables] = await connection.query("SHOW TABLES LIKE '%team%player%'");
    if (joinTables.length > 0) {
      const tableName = Object.values(joinTables[0])[0];
      console.log(`Tabela de junção encontrada: ${tableName}`);
      
      const [joinTableFields] = await connection.query(`DESCRIBE ${tableName}`);
      joinTableFields.forEach(field => {
        console.log(`${field.Field}: ${field.Type}, ${field.Null}, ${field.Key}, ${field.Default}`);
      });
    } else {
      console.log('Nenhuma tabela de junção time-jogador encontrada');
    }

  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  } finally {
    await connection.end();
    console.log('\nVerificação concluída. Conexão fechada.');
  }
}

checkDatabaseTables(); 