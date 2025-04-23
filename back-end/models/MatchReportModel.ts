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
  },
  team1_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team2_score: {
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
