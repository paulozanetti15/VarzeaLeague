import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('match_mvp_votes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      match_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'matches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      voter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex('match_mvp_votes', ['match_id', 'voter_id'], {
      unique: true,
      name: 'uq_match_voter',
    });
    await queryInterface.addIndex('match_mvp_votes', ['match_id', 'player_id'], {
      name: 'ix_match_player',
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('match_mvp_votes');
  },
};
