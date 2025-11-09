import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ChampionshipMatchGoal extends Model {}

ChampionshipMatchGoal.init({
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
    allowNull: true,
  },
  player_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'ChampionshipMatchGoals',
  modelName: 'ChampionshipMatchGoal',
  underscored: true,
  timestamps: true,
});

export default ChampionshipMatchGoal;
