module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('match_card_types', [
      { name: 'yellow' },
      { name: 'red' }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('match_card_types', null, {});
  }
};
