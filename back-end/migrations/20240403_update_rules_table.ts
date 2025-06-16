import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Primeiro, remover as colunas antigas
    await queryInterface.removeColumn('rules', 'categoria');
    await queryInterface.removeColumn('rules', 'quantidade_times');
    await queryInterface.removeColumn('rules', 'empate');

    // Adicionar as novas colunas
    await queryInterface.addColumn('rules', 'idade_minima', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    });

    await queryInterface.addColumn('rules', 'idade_maxima', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      validate: {
        min: 0,
        max: 100
      }
    });

    // Renomear a coluna datalimiteinscricao para data_limite
    await queryInterface.renameColumn('rules', 'datalimiteinscricao', 'data_limite');

    // Atualizar a coluna sexo para incluir validação
    await queryInterface.changeColumn('rules', 'sexo', {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Masculino', 'Feminino', 'Ambos']]
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter as alterações
    await queryInterface.removeColumn('rules', 'idade_minima');
    await queryInterface.removeColumn('rules', 'idade_maxima');
    
    // Renomear de volta a coluna data_limite para datalimiteinscricao
    await queryInterface.renameColumn('rules', 'data_limite', 'datalimiteinscricao');

    await queryInterface.addColumn('rules', 'categoria', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('rules', 'quantidade_times', {
      type: DataTypes.INTEGER,
      allowNull: false
    });

    await queryInterface.addColumn('rules', 'empate', {
      type: DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('rules', 'sexo', {
      type: DataTypes.STRING,
      allowNull: false
    });
  }
}; 