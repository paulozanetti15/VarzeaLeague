"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
const Match_1 = __importDefault(require("./Match"));
const Team_1 = __importDefault(require("./Team"));
const match_players_1 = __importDefault(require("./match_players"));
// Associações do modelo User
User_1.default.hasMany(Match_1.default, {
    foreignKey: 'organizerId',
    as: 'organizedMatches'
});
User_1.default.belongsToMany(Match_1.default, {
    through: match_players_1.default,
    as: 'matches',
    foreignKey: 'userId',
    otherKey: 'matchId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
User_1.default.hasMany(Team_1.default, {
    foreignKey: 'captainId',
    as: 'captainedTeams'
});
User_1.default.belongsToMany(Team_1.default, {
    through: 'team_players',
    as: 'teams',
    foreignKey: 'userId',
    otherKey: 'teamId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
// Associações do modelo Match
Match_1.default.belongsTo(User_1.default, {
    foreignKey: 'organizerId',
    as: 'organizer'
});
Match_1.default.belongsToMany(User_1.default, {
    through: match_players_1.default,
    as: 'players',
    foreignKey: 'matchId',
    otherKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
// Associações do modelo Team
Team_1.default.belongsTo(User_1.default, {
    foreignKey: 'captainId',
    as: 'captain',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Team_1.default.belongsToMany(User_1.default, {
    through: 'team_players',
    as: 'players',
    foreignKey: 'teamId',
    otherKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
