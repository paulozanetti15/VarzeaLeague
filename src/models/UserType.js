const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserType = sequelize.define('UserType', {
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
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'usertype',
  timestamps: false
});

module.exports = UserType; 