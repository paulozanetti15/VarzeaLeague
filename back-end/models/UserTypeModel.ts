import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const userType = sequelize.define('usertype', {
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
    tableName: 'usertype',
    timestamps: false
});
export default userType;