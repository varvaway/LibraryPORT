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
  ХэшПароля: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'ХэшПароля'
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
  // Указываем схему и другие настройки
  schema: 'dbo',
  timestamps: false,
  schema: 'dbo',
  freezeTableName: true
});

module.exports = User;