import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Remove o índice único do campo name
  await queryInterface.removeConstraint('teams', 'teams_name_key');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Restaura o índice único do campo name
  await queryInterface.addConstraint('teams', {
    fields: ['name'],
    type: 'unique',
    name: 'teams_name_key'
  });
} 