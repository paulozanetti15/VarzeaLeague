import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface TeamPlayerAttributes {
  id: number;
  teamId: number;
  userId?: number | null;
  playerId?: number | null;
  Playername: string;
  Playerdatebirth: Date;
  PlayerGender: string;
  Playerposition: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamPlayerCreationAttributes extends Omit<TeamPlayerAttributes, 'id'> {}

class TeamPlayer extends Model<TeamPlayerAttributes, TeamPlayerCreationAttributes> {
  public id!: number;
  public teamId!: number;
  public userId!: number | null;
  public playerId!: number | null;
  public Playername!: string;
  public Playerdatebirth!: Date;
  public PlayerGender!: string;
  public Playerposition!: string;
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
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    Playername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Playerdatebirth: {
      type: DataTypes.DATE,
      allowNull: false, 
    },
    PlayerGender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Playerposition: {
      type: DataTypes.STRING,
      allowNull: false,
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