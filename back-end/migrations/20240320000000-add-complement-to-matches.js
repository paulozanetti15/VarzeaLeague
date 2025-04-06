'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se a coluna já existe
    const tableInfo = await queryInterface.describeTable('matches');
    if (!tableInfo.complement) {
      await queryInterface.addColumn('matches', 'complement', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('matches', 'complement');
  }
}; 