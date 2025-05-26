require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, 'library_user', 'StrongPassword123!', {
  dialect: 'mssql',
  host: process.env.DB_HOST,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: process.env.DB_INSTANCE
    }
  }
});

module.exports = sequelize;