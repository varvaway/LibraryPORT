const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  КодПользователя: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодПользователя',
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
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    //unique: true,
    field: 'ЭлектроннаяПочта',
  },
  Пароль: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'ХэшПароля',
  },
  Телефон: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'Телефон',
  },
  Роль: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Пользователь',
    field: 'Роль',
  },
}, {
  tableName: 'Пользователи',
  timestamps: false,
});

module.exports = User;