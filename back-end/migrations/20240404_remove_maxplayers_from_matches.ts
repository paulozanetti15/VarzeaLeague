import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('matches', 'max_players');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('matches', 'max_players', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 14 
    });
  }
}; 