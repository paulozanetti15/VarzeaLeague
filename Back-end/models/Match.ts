import { DataTypes } from 'sequelize';
import sequelize from '../config/databaseconfig';
import UserModel from './User';

const MatchModel = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  status: {
    type: DataTypes.ENUM('open', 'pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'open',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id',
    },
  }
}, {
  tableName: 'matches',
  timestamps: true,
  underscored: true,
  modelName: 'Match',
  freezeTableName: true
});

// Relacionamentos
MatchModel.belongsTo(UserModel, { as: 'organizer', foreignKey: 'organizerId' });

export default MatchModel; 