'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('teams', 'maxparticipantes');
    await queryInterface.removeColumn('teams', 'sexo');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('teams', 'maxparticipantes', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('teams', 'sexo', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 