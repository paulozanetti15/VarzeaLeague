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
        references: {
            model: 'FriendlyMatches',
            key: 'id',
        },
    },
    registrationDeadline: {
        type: DataTypes.DATE,    
        allowNull: false,
    },
    registrationDeadlineTime: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: '23:59:59'
    },
    minimumAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    maximumAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    gender: {
        type: DataTypes.STRING,    
        allowNull: false,
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