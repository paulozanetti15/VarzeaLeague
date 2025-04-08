"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class MatchPlayer extends sequelize_1.Model {
}
MatchPlayer.init({
    matchId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        field: 'match_id',
        references: {
            model: 'matches',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    sequelize: database_1.default,
    tableName: 'match_players',
    timestamps: false,
    underscored: true
});
exports.default = MatchPlayer;
