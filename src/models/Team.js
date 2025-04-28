const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  banner: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  captain_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'teams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Team.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });

module.exports = Team; 