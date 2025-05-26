import { DataTypes } from 'sequelize';
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
  Playername: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Playerdatebirth: {
    type: DataTypes.DATE,
    allowNull: false, 
  },
  PlayerGender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Playerposition: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'team_players',
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

export default TeamPlayer; 