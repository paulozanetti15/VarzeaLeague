import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDescription = await queryInterface.describeTable('team_championships');
    
    if (!tableDescription.created_at) {
      await queryInterface.addColumn('team_championships', 'created_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      });
    }
    
    if (!tableDescription.updated_at) {
      await queryInterface.addColumn('team_championships', 'updated_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      });
    }

    const indexes = await queryInterface.showIndex('team_championships');
    const hasUniqueIndex = indexes.some(idx => idx.name === 'unique_team_championship');
    
    if (!hasUniqueIndex) {
      await queryInterface.addIndex('team_championships', ['team_id', 'championship_id'], {
        unique: true,
        name: 'unique_team_championship'
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex('team_championships', 'unique_team_championship');
    await queryInterface.removeColumn('team_championships', 'created_at');
    await queryInterface.removeColumn('team_championships', 'updated_at');
  }
};
