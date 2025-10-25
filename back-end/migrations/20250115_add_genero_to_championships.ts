import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('championships', 'genero', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Misto'
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('championships', 'genero');
}
