const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Author = sequelize.define('Author', {
  КодАвтора: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодАвтора',
  },
  Имя: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Имя',
  },
  Фамилия: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Фамилия',
  },
  Биография: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Биография',
  },
}, {
  tableName: 'Авторы',
  timestamps: false,
  schema: 'dbo',
  freezeTableName: true
});

module.exports = Author; 