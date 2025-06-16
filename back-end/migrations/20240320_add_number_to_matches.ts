import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('matches', 'number', {
      type: DataTypes.STRING,
      allowNull: true,
      after: 'location'
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('matches', 'number');
  }
}; 