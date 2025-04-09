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
exports.AttendanceController = void 0;
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Match_1 = __importDefault(require("../models/Match"));
const User_1 = __importDefault(require("../models/User"));
const database_1 = __importDefault(require("../config/database"));
exports.AttendanceController = {
    getMatchAttendance: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { matchId } = req.params;
            const attendance = yield Attendance_1.default.findAll({
                where: { matchId },
                include: [{
                        model: User_1.default,
                        attributes: ['id', 'name']
                    }]
            });
            res.json(attendance);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao buscar presenças' });
        }
    }),
    updateAttendance: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { matchId } = req.params;
            const { userId, status } = req.body;
            // Verificar se a partida existe
            const match = yield Match_1.default.findByPk(matchId);
            if (!match) {
                res.status(404).json({ error: 'Partida não encontrada' });
                return;
            }
            // Verificar se o usuário existe
            const user = yield User_1.default.findByPk(userId);
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }
            // Atualizar ou criar registro de presença
            const [attendance] = yield Attendance_1.default.upsert({
                matchId: parseInt(matchId),
                userId,
                status,
                confirmationDate: new Date()
            });
            res.json(attendance);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar presença' });
        }
    }),
    getTeamAttendanceStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { teamId, matchId } = req.params;
            const stats = yield Attendance_1.default.findAll({
                where: { matchId },
                include: [{
                        model: User_1.default,
                        where: { teamId },
                        attributes: ['id', 'name']
                    }],
                attributes: [
                    'status',
                    [database_1.default.fn('COUNT', database_1.default.col('status')), 'count']
                ],
                group: ['status']
            });
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao buscar estatísticas de presença' });
        }
    }),
    notifyPendingPlayers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { matchId } = req.params;
            // Buscar jogadores com status pendente
            const pendingAttendances = yield Attendance_1.default.findAll({
                where: {
                    matchId,
                    status: 'PENDING'
                },
                include: [{
                        model: User_1.default,
                        attributes: ['id', 'name', 'email']
                    }]
            });
            // Aqui você implementaria a lógica de notificação
            // Por exemplo, enviar e-mails ou notificações push
            res.json({
                message: 'Notificações enviadas',
                pendingCount: pendingAttendances.length
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao notificar jogadores' });
        }
    })
};
