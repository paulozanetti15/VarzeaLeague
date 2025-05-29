import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
const Rules = sequelize.define('Rules', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partidaid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'matches',
            key: 'id',
        },
    },
    categoria:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantidade_times: {
        type: DataTypes.INTEGER,    
        allowNull: false,
    },
    datalimiteinscricao: {
        type: DataTypes.DATE,    
        allowNull: false,
    },
    empate:{
        type: DataTypes.STRING,    
        allowNull: false,
    },
    sexo:{
        type: DataTypes.STRING,    
        allowNull: false,
    }
}, {
    modelName: 'Rules',
    tableName: 'rules',
    timestamps: false,
});
export default Rules;