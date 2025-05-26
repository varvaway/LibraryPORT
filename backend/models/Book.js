
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодКниги'
  },
  Название: {
    type: DataTypes.STRING,
    field: 'Название'
  },
  Описание: {
    type: DataTypes.TEXT,
    field: 'Описание'
  },
  ГодИздания: {
    type: DataTypes.INTEGER,
    field: 'ГодИздания'
  },
  ISBN: {
    type: DataTypes.STRING,
    field: 'ISBN'
  },
  Статус: {
    type: DataTypes.STRING,
    field: 'Статус'
  }
}, {
  tableName: 'Книги',
  timestamps: false,
  schema: 'dbo'
});

module.exports = Book;