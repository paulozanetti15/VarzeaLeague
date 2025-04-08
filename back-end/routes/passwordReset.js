"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordResetController_1 = require("../controllers/passwordResetController");
const routerReset = (0, express_1.Router)();
routerReset.post('/request-reset', passwordResetController_1.requestPasswordReset);
routerReset.put('/reset', passwordResetController_1.resetPassword);
exports.default = routerReset;
