const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookAuthor = sequelize.define('BookAuthor', {
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодКниги',
  },
  КодАвтора: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодАвтора',
  },
}, {
  tableName: 'КнигиАвторы',
  timestamps: false,
  schema: 'dbo',
  freezeTableName: true
});

module.exports = BookAuthor;