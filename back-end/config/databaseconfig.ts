import * as dotenv from 'dotenv';
import * as dotenv from 'dotenv';
dotenv.config();

module.exports = {
  development: {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: '-03:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    define: {
      timestamps: false,
    }
  }
};
