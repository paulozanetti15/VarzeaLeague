import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const FriendlyMatchesRules = sequelize.define('FriendlyMatchesRules', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    matchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'partidaid',
        references: {
            model: 'FriendlyMatches',
            key: 'id',
        },
    },
    registrationDeadline: {
        type: DataTypes.DATE,    
        allowNull: false,
        field: 'datalimiteinscricao'
    },
    minimumAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'idade_minima',
        validate: {
            min: 0,
            max: 100
        }
    },
    maximumAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'idade_maxima',
        validate: {
            min: 0,
            max: 100
        }
    },
    gender: {
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

export default FriendlyMatchesRules;