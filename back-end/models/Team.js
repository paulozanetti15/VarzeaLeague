"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class Team extends sequelize_1.Model {
}
Team.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    banner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    captainId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
        unique: false
    },
    isDeleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: database_1.default,
    modelName: 'Team',
    tableName: 'teams',
    timestamps: true,
    underscored: true,
});
// Método para adicionar um jogador ao time
Team.prototype.addPlayer = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        yield this.addPlayer(user);
    });
};
// Método para contar o número de jogadores no time
Team.prototype.countPlayers = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const players = yield this.getPlayers();
        return players.length;
    });
};
exports.default = Team;
