import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';


interface MatchTeamsAttributes {
  matchId: number;
  teamId: number;
}

class FriendlyMatchTeams extends Model<MatchTeamsAttributes> implements MatchTeamsAttributes {
  public matchId!: number;
  public teamId!: number;

  // Example method to get a descriptive string for the match player
  public getDescription(): string {
    return `MatchPlayer: Match ID = ${this.matchId}, Team ID = ${this.teamId}`;
  }

  // Example static method to find all players for a specific match
  public static async findByMatchId(matchId: number): Promise<MatchTeamsAttributes[]> {
    return await FriendlyMatchTeams.findAll({ where: { matchId } });
  }
}
FriendlyMatchTeams.init({
  matchId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'match_id',
    references: {
      model: 'FriendlyMatches',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  teamId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'team_id',
    references: {
      model: 'teams',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  sequelize,
  tableName: 'FriendlyMatchTeams',
  timestamps: false,
  underscored: true
});

export default FriendlyMatchTeams; 