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
    allowNull: false,
    field: 'Название'
  },
  Автор: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Автор'
  },
  Год: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Год'
  },
  Жанр: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Жанр'
  },
  Описание: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Описание'
  },
  Доступна: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'Доступна'
  }
}, {
  tableName: 'Книги',
  timestamps: false
});

module.exports = Book;