const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('LibraryDB', 'library_user', 'StrongPassword123!', {
  host: 'localhost\\SQLEXPRESS03',
  dialect: 'mssql',
  port: 1433,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
      requestTimeout: 30000
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
