const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  КодПользователя: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодПользователя'
  },
  Имя: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Имя'
  },
  Фамилия: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Фамилия'
  },
  ЭлектроннаяПочта: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'ЭлектроннаяПочта'
  },
  Пароль: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Пароль'
  },
  Роль: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Роль'
  },
  Телефон: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Телефон'
  }
}, {
  tableName: 'Пользователи',
  timestamps: false
});

module.exports = User;