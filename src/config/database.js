const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('varzealeague_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize; 