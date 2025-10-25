import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Altera colunas user_id para permitir NULL
    await queryInterface.changeColumn('match_goals', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('match_cards', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverte para NOT NULL (pode falhar se houver registros nulos)
    await queryInterface.changeColumn('match_goals', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('match_cards', 'user_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
    });
  }
};
