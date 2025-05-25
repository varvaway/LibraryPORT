const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  КодКниги: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'КодКниги'
  },
  Название: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'Название'
  },
  Описание: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Описание'
  },
  ГодИздания: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ГодИздания'
  },
  ISBN: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'ISBN'
  },
  Статус: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Статус'
  }
}, {
  tableName: 'Книги',
  timestamps: false
});

module.exports = Book;