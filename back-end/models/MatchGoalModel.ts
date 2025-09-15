import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MatchGoal extends Model {}

MatchGoal.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // agora opcional para permitir registro sem jogador
  },
}, {
  sequelize,
  tableName: 'match_goals',
  modelName: 'MatchGoal',
  underscored: true,
  timestamps: true,
});

export default MatchGoal;
