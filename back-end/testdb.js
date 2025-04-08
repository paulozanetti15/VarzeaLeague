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
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
// Carrega as variáveis de ambiente usando caminho absoluto
const result = dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
console.log('Caminho do .env:', path_1.default.resolve(__dirname, '.env'));
console.log('Arquivo .env carregado:', !result.error);
console.log('Variáveis de ambiente:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT
});
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'varzealeague_db', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '914914', {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    logging: console.log
});
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            console.log('Conexão estabelecida com sucesso!');
        }
        catch (error) {
            console.error('Erro ao conectar:', error);
        }
        finally {
            process.exit();
        }
    });
}
testConnection();
