require('dotenv').config();
const mysql = require('mysql2/promise');

async function removeCaptainConstraint() {
  // Configuração da conexão do banco de dados
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'varzealeague',
  });

  try {
    console.log('Conectado ao banco de dados. Verificando índices...');

    // Verificar índices na tabela teams
    const [teamsIndices] = await connection.query('SHOW INDEX FROM teams');
    
    // Filtrar índices relacionados à coluna captain_id
    const captainIndices = teamsIndices.filter(index => 
      index.Column_name === 'captain_id' && index.Non_unique === 0
    );

    if (captainIndices.length > 0) {
      console.log('Índices únicos encontrados para captain_id:');
      captainIndices.forEach(index => {
        console.log(`- ${index.Key_name}`);
      });

      // Remover cada índice único encontrado
      for (const index of captainIndices) {
        console.log(`Removendo índice: ${index.Key_name}`);
        await connection.query(`ALTER TABLE teams DROP INDEX ${index.Key_name}`);
        console.log(`Índice ${index.Key_name} removido com sucesso.`);
      }
    } else {
      console.log('Nenhum índice único encontrado para captain_id.');
    }

    // Verificar alteração
    console.log('\nVerificando novamente os índices da tabela teams:');
    const [updatedIndices] = await connection.query('SHOW INDEX FROM teams');
    updatedIndices.forEach(index => {
      console.log(`${index.Key_name}, Column: ${index.Column_name}, Non_unique: ${index.Non_unique}`);
    });

  } catch (error) {
    console.error('Erro ao remover restrição de captain_id:', error);
  } finally {
    await connection.end();
    console.log('\nOperação concluída. Conexão fechada.');
  }
}

removeCaptainConstraint(); 