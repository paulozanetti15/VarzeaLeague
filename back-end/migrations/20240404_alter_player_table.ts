import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Primeiro, adicionar a nova coluna
    await queryInterface.addColumn('players', 'ano', {
      type: DataTypes.INTEGER,
      allowNull: true, // temporariamente permitir null
    });

    // Atualizar os dados existentes
    await queryInterface.sequelize.query(`
      UPDATE players 
      SET ano = EXTRACT(YEAR FROM "dataNascimento")
      WHERE "dataNascimento" IS NOT NULL;
    `);

    // Tornar a coluna ano not null
    await queryInterface.changeColumn('players', 'ano', {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1925,
        max: 2019
      }
    });

    // Remover a coluna antiga
    await queryInterface.removeColumn('players', 'dataNascimento');
  },

  down: async (queryInterface: QueryInterface) => {
    // Primeiro, adicionar a coluna dataNascimento de volta
    await queryInterface.addColumn('players', 'dataNascimento', {
      type: DataTypes.DATE,
      allowNull: true, // temporariamente permitir null
    });

    // Atualizar os dados existentes
    await queryInterface.sequelize.query(`
      UPDATE players 
      SET "dataNascimento" = make_date(ano, 1, 1)
      WHERE ano IS NOT NULL;
    `);

    // Tornar a coluna dataNascimento not null
    await queryInterface.changeColumn('players', 'dataNascimento', {
      type: DataTypes.DATE,
      allowNull: false,
    });

    // Remover a coluna ano
    await queryInterface.removeColumn('players', 'ano');
  }
}; 