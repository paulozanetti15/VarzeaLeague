import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('teams', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jogadores: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      idademinima: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      idademaxima: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      maxparticipantes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sexo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      captainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('teams');
  },
}; 