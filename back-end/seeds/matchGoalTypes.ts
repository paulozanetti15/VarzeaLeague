module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('match_goal_types', [
      { name: 'goal' }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('match_goal_types', null, {});
  }
};
