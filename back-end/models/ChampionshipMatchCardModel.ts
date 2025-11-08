import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ChampionshipMatchCard extends Model {}

ChampionshipMatchCard.init({
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
  card_type: {
    type: DataTypes.ENUM('yellow', 'red'),
    allowNull: false,
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'ChampionshipMatchCards',
  modelName: 'ChampionshipMatchCard',
  underscored: true,
  timestamps: true,
});

export default ChampionshipMatchCard;
