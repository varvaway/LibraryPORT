const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const BookAuthor = sequelize.define('BookAuthor', {
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодКниги',
  },
  КодАвтора: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодАвтора',
  },
}, {
  tableName: 'КнигиАвторы',
  timestamps: false,
});

module.exports = BookAuthor; 