"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TeamController_1 = require("../controllers/TeamController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/teams';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Apenas JPG, PNG e GIF são aceitos.'));
        }
    }
});
// Todas as rotas precisam de autenticação
router.get('/', auth_1.authenticateToken, TeamController_1.TeamController.listTeams);
router.get('/:id', auth_1.authenticateToken, TeamController_1.TeamController.getTeam);
router.post('/', auth_1.authenticateToken, TeamController_1.TeamController.create);
router.put('/:id', auth_1.authenticateToken, TeamController_1.TeamController.updateTeam);
router.post('/:id/banner', auth_1.authenticateToken, upload.single('banner'), TeamController_1.TeamController.uploadBanner);
router.delete('/:id', auth_1.authenticateToken, TeamController_1.TeamController.deleteTeam);
exports.default = router;
