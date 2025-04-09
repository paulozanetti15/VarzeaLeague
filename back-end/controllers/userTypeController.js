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
exports.getAllUserTypes = getAllUserTypes;
exports.createUserType = createUserType;
exports.updateUserType = updateUserType;
exports.deleteUserType = deleteUserType;
const UserType_1 = __importDefault(require("../models/UserType"));
function getAllUserTypes(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userTypes = yield UserType_1.default.findAll();
            res.status(200).json({ data: userTypes });
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching user types", error });
        }
    });
}
function createUserType(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = [
            {
                name: 'admin_sistema',
                description: 'Responsável por gerenciar o sistema e conceder permissões.'
            },
            {
                name: 'admin_eventos',
                description: 'Gerencia os eventos e suas configurações no sistema.'
            },
            {
                name: 'admin_times',
                description: 'Responsável pela administração dos times e seus participantes.'
            }
        ];
        try {
            const newUserType = users.map(user => UserType_1.default.create(user));
            yield Promise.all(newUserType);
            res.status(201).json({ data: newUserType });
        }
        catch (error) {
            res.status(500).json({ message: "Error creating user type", error });
        }
    });
}
function updateUserType(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const userTypeToUpdate = yield UserType_1.default.findByPk(id);
            if (!userTypeToUpdate) {
                return res.status(404).json({ message: "User type not found" });
            }
            userTypeToUpdate.toJSON().name = name;
            userTypeToUpdate.toJSON().description = description;
            yield userTypeToUpdate.save();
            res.status(200).json(userTypeToUpdate);
        }
        catch (error) {
            res.status(500).json({ message: "Error updating user type", error });
        }
    });
}
function deleteUserType(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userTypeToDelete = yield UserType_1.default.findByPk(id);
            if (!userTypeToDelete) {
                return res.status(404).json({ message: "User type not found" });
            }
            yield userTypeToDelete.destroy();
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting user type", error });
        }
    });
}
