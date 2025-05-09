const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  КодБронирования: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодБронирования'
  },
  КодКниги: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'КодКниги',
    references: {
      model: 'Книги',
      key: 'КодКниги'
    }
  },
  КодПользователя: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'КодПользователя',
    references: {
      model: 'Пользователи',
      key: 'КодПользователя'
    }
  },
  ДатаНачала: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ДатаНачала'
  },
  ДатаОкончания: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ДатаОкончания'
  },
  Статус: {
    type: DataTypes.ENUM('активна', 'завершена', 'отменена'),
    allowNull: false,
    defaultValue: 'активна',
    field: 'Статус'
  }
}, {
  tableName: 'Бронирования',
  timestamps: false
});

module.exports = Reservation;