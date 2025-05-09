require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('LibraryDB', 'library_user', 'StrongPassword123!', {
  dialect: 'mssql',
  host: 'MISS\\SQLEXPRESS03',
  port: 1433,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    }
  },
  logging: false,
});

module.exports = sequelize; 