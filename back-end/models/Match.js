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
class Match extends sequelize_1.Model {
    static associate(models) {
        Match.belongsTo(models.User, { as: 'organizer', foreignKey: 'organizerId' });
        Match.belongsToMany(models.User, {
            as: 'players',
            through: 'match_players',
            foreignKey: 'matchId',
            otherKey: 'userId'
        });
    }
    addPlayer(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findByPk(userId);
            if (user) {
                yield this.addPlayers(user);
            }
        });
    }
    countPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            const players = yield this.getPlayers();
            return players.length;
        });
    }
}
Match.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    complement: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    maxPlayers: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('open', 'pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'open',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    organizerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    }
}, {
    sequelize: database_1.default,
    tableName: 'matches',
    timestamps: true,
    underscored: true,
    modelName: 'Match',
    freezeTableName: true
});
exports.default = Match;
