import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface TeamPlayerAttributes {
  id: number;
  teamId: number;
  userId: number;
  playerId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamPlayerCreationAttributes extends Omit<TeamPlayerAttributes, 'id'> {}

class TeamPlayer extends Model<TeamPlayerAttributes, TeamPlayerCreationAttributes> {
  public id!: number;
  public teamId!: number;
  public userId!: number;
  public playerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamPlayer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    tableName: 'team_players',
    timestamps: true,
    underscored: true,
    modelName: 'TeamPlayer',
    freezeTableName: true
  }
);

export default TeamPlayer; 