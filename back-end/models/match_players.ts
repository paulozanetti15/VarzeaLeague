import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/databaseconfig';

interface MatchPlayerAttributes {
  matchId: number;
  userId: number;
}

class MatchPlayer extends Model<MatchPlayerAttributes> implements MatchPlayerAttributes {
  public matchId!: number;
  public userId!: number;
}

MatchPlayer.init({
  matchId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'match_id',
    references: {
      model: 'matches',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  sequelize,
  tableName: 'match_players',
  timestamps: false,
  underscored: true
});

export default MatchPlayer; 