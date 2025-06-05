const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  КодБронирования: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодБронирования'
  },
  КодПользователя: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'КодПользователя'
  },
  ДатаБронирования: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ДатаБронирования'
  },
  Статус: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Статус'
  },
  ДатаОкончания: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'ДатаОкончания'
  }
}, {
  tableName: 'Бронирования',
  timestamps: false,
  schema: 'dbo',
  freezeTableName: true
});

// Ассоциация уже определена через sequelize.models

module.exports = Reservation;