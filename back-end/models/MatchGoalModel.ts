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
  player_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // novo campo para vincular ao Player (team_players)
  },
  minuteGoal :{
    type: DataTypes.INTEGER,
    allowNull: true, //
  },
  team_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'match_goals',
  modelName: 'MatchGoal',
  underscored: true,
  timestamps: true,
});

export default MatchGoal;
