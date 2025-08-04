module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('team_championships', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'teams', key: 'id' },
        onDelete: 'CASCADE'
      },
      championshipId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'championships', key: 'id' },
        onDelete: 'CASCADE'
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('team_championships');
  }
};
