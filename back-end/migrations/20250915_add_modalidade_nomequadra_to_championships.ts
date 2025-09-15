import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('championships', 'modalidade', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Futsal', // Valor padrão temporário para registros existentes
    });

    await queryInterface.addColumn('championships', 'nomequadra', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Quadra Principal', // Valor padrão temporário para registros existentes
    });

    // Remover o valor padrão após adicionar as colunas
    await queryInterface.changeColumn('championships', 'modalidade', {
      type: DataTypes.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('championships', 'nomequadra', {
      type: DataTypes.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('championships', 'modalidade');
    await queryInterface.removeColumn('championships', 'nomequadra');
  },
};