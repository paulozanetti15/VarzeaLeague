import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Rules = sequelize.define('Rules', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    partidaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'partidaid',
        references: {
            model: 'matches',
            key: 'id',
        },
    },
    dataLimite: {
        type: DataTypes.DATE,    
        allowNull: false,
        field: 'datalimiteinscricao'
    },
    idadeMinima: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'idade_minima',
        validate: {
            min: 0,
            max: 100
        }
    },
    idadeMaxima: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'idade_maxima',
        validate: {
            min: 0,
            max: 100
        }
    },
    genero: {
        type: DataTypes.STRING,    
        allowNull: false,
        field: 'sexo',
        validate: {
            isIn: [['Masculino', 'Feminino', 'Ambos']]
        }
    }
}, {
    modelName: 'FriendlyMatchRules',
    tableName: 'FriendlyMatchRules',
    timestamps: false,
    underscored: true
});

export default Rules;