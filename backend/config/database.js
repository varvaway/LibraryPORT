require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Настройки подключения к базе данных:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  instance: process.env.DB_INSTANCE,
  user: process.env.DB_USER
});

const connectionString = `Server=${process.env.DB_HOST}\\${process.env.DB_INSTANCE};Database=${process.env.DB_NAME};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=true;`;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'mssql',
  dialectOptions: {
    connectionString: connectionString
  }
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;