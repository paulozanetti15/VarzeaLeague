import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('matches', 'duration', {
      type: DataTypes.STRING,
      allowNull: true,
      after: 'date'
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('matches', 'duration');
  }
}; 