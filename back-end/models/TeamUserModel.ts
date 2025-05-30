import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './UserModel';
import Team from './TeamModel';

interface TeamUserAttributes {
  id: number;
  teamId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamUserCreationAttributes extends Omit<TeamUserAttributes, 'id'> {}

class TeamUser extends Model<TeamUserAttributes, TeamUserCreationAttributes> {
  public id!: number;
  public teamId!: number;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamUser.init(
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    tableName: 'team_users',
    timestamps: true,
    underscored: true,
    modelName: 'TeamUser',
    freezeTableName: true
  }
);

// Definir associações
TeamUser.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

TeamUser.belongsTo(Team, {
  foreignKey: 'teamId',
  as: 'team'
});

export default TeamUser; 