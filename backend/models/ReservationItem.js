const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReservationItem = sequelize.define('ReservationItem', {
  КодБронирования: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодБронирования',
  },
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодКниги',
  },
}, {
  tableName: 'ЭлементыБронирования',
  timestamps: false,
});

module.exports = ReservationItem;