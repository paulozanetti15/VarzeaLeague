import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './UserModel';
import Match from './MatchModel';

class Attendance extends Model {
  public id!: number;
  public userId!: number;
  public matchId!: number;
  public status!: 'CONFIRMED' | 'DECLINED' | 'PENDING';
  public confirmationDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
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
        model: 'Users',
        key: 'id',
      },
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Matches',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('CONFIRMED', 'DECLINED', 'PENDING'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    confirmationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Attendance',
    tableName: 'attendances',
  }
);

// Relacionamentos
Attendance.belongsTo(User, { foreignKey: 'userId' });
Attendance.belongsTo(Match, { foreignKey: 'matchId' });
User.hasMany(Attendance, { foreignKey: 'userId' });
Match.hasMany(Attendance, { foreignKey: 'matchId' });

export default Attendance; 