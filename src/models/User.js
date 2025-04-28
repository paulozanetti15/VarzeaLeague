const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserType = require('./UserType');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserType,
      key: 'id'
    }
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sexo: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  data_nasc: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.belongsTo(UserType, { foreignKey: 'user_type_id' });

module.exports = User; 