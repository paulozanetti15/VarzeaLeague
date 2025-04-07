"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Match_1 = __importDefault(require("./Match"));
class MatchParticipant extends sequelize_1.Model {
}
MatchParticipant.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    matchId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Match_1.default,
            key: 'id',
        },
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    team: {
        type: sequelize_1.DataTypes.ENUM('A', 'B'),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'confirmed', 'rejected'),
        defaultValue: 'pending',
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'paid', 'refunded'),
        defaultValue: 'pending',
    },
    position: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize: database_1.default,
    tableName: 'match_participants',
    modelName: 'MatchParticipant',
});
// Relacionamentos
MatchParticipant.belongsTo(Match_1.default, { foreignKey: 'matchId' });
MatchParticipant.belongsTo(User_1.default, { foreignKey: 'userId' });
exports.default = MatchParticipant;
