const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    КодКниги: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Название: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Описание: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ГодИздания: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ISBN: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Статус: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    tableName: 'Книги',
    timestamps: false
  });

  return Book;
};