import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

 

const TeamPlayer = sequelize.define('TeamPlayer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'team_players',
  timestamps: true,
  underscored: true,
  modelName: 'TeamPlayer',
  freezeTableName: true
});

export default TeamPlayer; 