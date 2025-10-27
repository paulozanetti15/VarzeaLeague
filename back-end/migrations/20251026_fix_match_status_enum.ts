import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE matches 
    MODIFY COLUMN status ENUM('aberta', 'sem_vagas', 'em_andamento', 'confirmada', 'cancelada', 'finalizada') 
    NOT NULL DEFAULT 'aberta'
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE matches 
    MODIFY COLUMN status ENUM('aberta', 'sem_vagas', 'em_andamento', 'cancelada', 'finalizada') 
    NOT NULL DEFAULT 'aberta'
  `);
}
