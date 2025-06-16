import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import UserType from './UserTypeModel';

interface UserAttributes {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  sexo: string;
  userTypeId: number;
  resetPasswordExpires?: Date;
  resetPasswordToken?: string;
}

class UserModel extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public cpf!: string;
  public phone!: string;
  public email!: string;
  public password!: string;
  public sexo!: string;
  public userTypeId!: number;
  public resetPasswordExpires?: Date;
  public resetPasswordToken?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
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
  sexo: {
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
    onDelete: 'CASCADE',
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

export default UserModel;