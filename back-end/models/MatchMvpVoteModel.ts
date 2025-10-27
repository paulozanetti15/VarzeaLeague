import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MatchMvpVote extends Model {
  public id!: number;
  public match_id!: number;
  public player_id!: number;
  public voter_id!: number | null;
  public voter_token!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MatchMvpVote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'matches', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'players', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    voter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    voter_token: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'match_mvp_votes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['match_id', 'voter_id'],
        name: 'uq_match_voter_user',
      },
      {
        fields: ['match_id', 'player_id'],
        name: 'ix_match_player',
      },
    ],
  }
);

export default MatchMvpVote;
