import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/databaseconfig';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public resetPasswordExpires?: Date;
  public resetPasswordToken?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    User.hasMany(models.Team, { foreignKey: 'captainId', as: 'captainedTeams' });
    User.hasMany(models.Match, { foreignKey: 'organizerId' });
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  underscored: true,
  modelName: 'User',
  freezeTableName: true
});

export default User;