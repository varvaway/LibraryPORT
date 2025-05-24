require('dotenv').config();
const { Sequelize } = require('sequelize');

//  наличие переменных окружения
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_INSTANCE'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(', ')}`);
}

/*const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    port: 1433,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE,
        connectTimeout: 15000
      }
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
*/
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mssql',
  port: 1433,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: false
    }
  },
  logging: console.log
});

module.exports = sequelize;