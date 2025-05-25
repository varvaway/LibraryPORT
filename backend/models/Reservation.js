const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  КодБронирования: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  }
}, {
  tableName: 'Бронирования',
  timestamps: false
});

module.exports = Reservation;