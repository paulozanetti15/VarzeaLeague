import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MatchEvaluation extends Model {}

MatchEvaluation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  evaluator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'match_evaluations',
  modelName: 'MatchEvaluation',
  underscored: true,
  timestamps: true,
});

export default MatchEvaluation;
