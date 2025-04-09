"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AttendanceController_1 = require("../controllers/AttendanceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Middleware de autenticação para todas as rotas
router.use(auth_1.authenticateToken);
// Rotas de presença
router.get('/matches/:matchId/attendance', AttendanceController_1.AttendanceController.getMatchAttendance);
router.post('/matches/:matchId/attendance', AttendanceController_1.AttendanceController.updateAttendance);
router.get('/teams/:teamId/matches/:matchId/attendance', AttendanceController_1.AttendanceController.getTeamAttendanceStats);
router.post('/matches/:matchId/notify-pending', AttendanceController_1.AttendanceController.notifyPendingPlayers);
exports.default = router;
