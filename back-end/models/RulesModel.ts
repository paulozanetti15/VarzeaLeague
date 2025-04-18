import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
const Rules = sequelize.define('Athlete', {
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
    idademinima: {
        type: DataTypes.INTEGER,    
        allowNull: false,
    },
    idademaxima: {
        type: DataTypes.INTEGER,    
        allowNull: false,
    },   
    minparticipantes: {
        type: DataTypes.INTEGER,    
        allowNull: false,
    },
    maxparticipantes: {
        type: DataTypes.INTEGER,    
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
}, {
    modelName: 'Rules',
    tableName: 'rules',
    timestamps: false,
});
export default Rules;