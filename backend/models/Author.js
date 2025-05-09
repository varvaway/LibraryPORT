const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Author = sequelize.define('Author', {
  КодАвтора: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодАвтора',
  },
  Имя: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Имя',
  },
  Фамилия: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Фамилия',
  },
  Биография: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'Биография',
  },
}, {
  tableName: 'Авторы',
  timestamps: false,
});

module.exports = Author; 