import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MatchCard extends Model {}

MatchCard.init({
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
    allowNull: true, // opcional
  },
  card_type: {
    type: DataTypes.ENUM('yellow', 'red'),
    allowNull: false,
  },
  minute: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  player_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // novo campo para vincular ao Player
  },
}, {
  sequelize,
  tableName: 'FriendlyMatchCards',
  modelName: 'FriendlyMatchCards',
  underscored: true,
  timestamps: true,
});

export default MatchCard;
