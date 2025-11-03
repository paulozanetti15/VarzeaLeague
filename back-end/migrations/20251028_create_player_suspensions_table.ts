import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('player_suspensions', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      championship_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'championships',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reason: {
        type: DataTypes.ENUM('yellow_cards', 'red_card', 'manual'),
        allowNull: false,
      },
      yellow_cards_accumulated: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      games_to_suspend: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      games_suspended: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('player_suspensions', ['player_id']);
    await queryInterface.addIndex('player_suspensions', ['championship_id']);
    await queryInterface.addIndex('player_suspensions', ['is_active']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('player_suspensions');
  },
};
