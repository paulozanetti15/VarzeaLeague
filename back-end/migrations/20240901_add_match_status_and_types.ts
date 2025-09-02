module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Status da partida
    await queryInterface.bulkInsert('match_statuses', [
      { name: 'open' },
      { name: 'in_progress' },
      { name: 'completed' }
    ]);
    // Tipos de gols
    await queryInterface.bulkInsert('match_goal_types', [
      { name: 'goal' }
    ]);
    // Tipos de cartões
    await queryInterface.bulkInsert('match_card_types', [
      { name: 'yellow' },
      { name: 'red' }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('match_statuses', null, {});
    await queryInterface.bulkDelete('match_goal_types', null, {});
    await queryInterface.bulkDelete('match_card_types', null, {});
  }
};
