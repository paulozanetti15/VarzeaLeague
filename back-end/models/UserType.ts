import { DataTypes } from 'sequelize';
import sequelize  from '../config/databaseconfig';
import User from '../models/User';

const userType = sequelize.define('userType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
 
},
{
    tableName: 'userTypes',
    timestamps: false
});
userType.hasMany(User, {
    foreignKey: 'userTypeId',
    as: 'users'
  });
export default userType;