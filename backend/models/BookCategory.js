const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookCategory = sequelize.define('BookCategory', {
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодКниги',
  },
  КодКатегории: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодКатегории',
  },
}, {
  tableName: 'КнигиКатегории',
  timestamps: false,
  schema: 'dbo',
  freezeTableName: true
});

module.exports = BookCategory;