"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const userTypeController_1 = require("../controllers/userTypeController");
const userTypeRouter = express_1.default.Router();
userTypeRouter.get("/", auth_1.authenticateToken, userTypeController_1.getAllUserTypes);
userTypeRouter.post("/", auth_1.authenticateToken, userTypeController_1.createUserType);
userTypeRouter.put("/:id", auth_1.authenticateToken, userTypeController_1.updateUserType);
userTypeRouter.delete("/:id", auth_1.authenticateToken, userTypeController_1.deleteUserType);
exports.default = userTypeRouter;
