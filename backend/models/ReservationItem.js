const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const ReservationItem = sequelize.define('ReservationItem', {
  КодБронирования: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодБронирования',
  },
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодКниги',
  },
}, {
  tableName: 'ЭлементыБронирования',
  timestamps: false,
});

module.exports = ReservationItem; 