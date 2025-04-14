import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
const Athlete = sequelize.define('Athlete', {
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
    idade: {
        type: DataTypes.INTEGER,    
        allowNull: false,
    },
    altura: {
        type: DataTypes.FLOAT,    
        allowNull: false,
    },   
    peso: {
        type: DataTypes.FLOAT,    
        allowNull: false,
    }
}, {
    modelName: 'Athlete',
    tableName: 'athletes',
    timestamps: false,
});
export default Athlete;