import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/databaseconfig';
import UserType from './UserType';

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
  userTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usertype', // Alterado de 'usertypes' para 'usertype'
      key: 'id',
    },
    onUpdate: 'CASCADE',
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
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
User.belongsTo(UserType, { 
  foreignKey: 'userTypeId', 
  as: 'usertype' 
});

UserType.hasMany(User, {
  foreignKey: 'userTypeId',
  as: 'users'
});


export default User;