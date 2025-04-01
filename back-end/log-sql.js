require('dotenv').config();
const { sequelize } = require('./config/databaseconfig');

// Habilitar logging de todas as queries SQL
sequelize.options.logging = true;

// Configurar sequelize para mostrar as queries completas
sequelize.options.benchmark = true;

console.log('Logging de SQL configurado. Reinicie o servidor para ver as queries SQL completas.'); 