const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const BookCategory = sequelize.define('BookCategory', {
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодКниги',
  },
  КодКатегории: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодКатегории',
  },
}, {
  tableName: 'КнигиКатегории',
  timestamps: false,
});

module.exports = BookCategory; 