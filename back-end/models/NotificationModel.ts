import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationAttributes {
  id: number;
  userId: number;
  type: 'team_linked_to_match' | 'match_cancelled' | 'match_updated' | 'championship_match_scheduled';
  title: string;
  message: string;
  relatedMatchId?: number;
  relatedTeamId?: number;
  relatedChampionshipId?: number;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead' | 'createdAt' | 'updatedAt'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'team_linked_to_match' | 'match_cancelled' | 'match_updated' | 'championship_match_scheduled';
  public title!: string;
  public message!: string;
  public relatedMatchId?: number;
  public relatedTeamId?: number;
  public relatedChampionshipId?: number;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('team_linked_to_match', 'match_cancelled', 'match_updated', 'championship_match_scheduled'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    relatedMatchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'matches',
        key: 'id',
      },
    },
    relatedTeamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    relatedChampionshipId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'championships',
        key: 'id',
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
  }
);

export default Notification;

