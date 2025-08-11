import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const TeamChampionship = sequelize.define('TeamChampionship', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  championshipId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'team_championships',
  timestamps: false
});

export default TeamChampionship;
