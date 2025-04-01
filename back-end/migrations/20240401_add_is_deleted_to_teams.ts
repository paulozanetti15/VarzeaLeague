import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('teams', 'is_deleted', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('teams', 'is_deleted');
} 