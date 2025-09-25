import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MatchReport extends Model {}

MatchReport.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'match_id',
    references: {
      model: 'matches',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  team_home:{
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'team_home',
    references: {
      model: 'teams',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  team_away:{
     type: DataTypes.INTEGER,
    allowNull: false,
    field: 'team_away',
    references: {
      model: 'teams',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  teamHome_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamAway_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'match_reports',
  modelName: 'MatchReport',
  underscored: true,
  timestamps: true,
});

export default MatchReport;
