"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Match_1 = __importDefault(require("./Match"));
class Attendance extends sequelize_1.Model {
}
Attendance.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    matchId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Matches',
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('CONFIRMED', 'DECLINED', 'PENDING'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    confirmationDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Attendance',
    tableName: 'attendances',
});
// Relacionamentos
Attendance.belongsTo(User_1.default, { foreignKey: 'userId' });
Attendance.belongsTo(Match_1.default, { foreignKey: 'matchId' });
User_1.default.hasMany(Attendance, { foreignKey: 'userId' });
Match_1.default.hasMany(Attendance, { foreignKey: 'matchId' });
exports.default = Attendance;
