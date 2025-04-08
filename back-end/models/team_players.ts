import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/databaseconfig';

class TeamPlayer extends Model {
  public id!: number;
  public teamId!: number;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamPlayer.init({
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
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  }
}, {
  sequelize,
  tableName: 'team_players',
  timestamps: true,
  underscored: true,
  modelName: 'TeamPlayer',
  freezeTableName: true
});

export default TeamPlayer; 