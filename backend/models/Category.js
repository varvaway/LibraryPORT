const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    КодКатегории: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Название: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Описание: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Категории',
    timestamps: false
  });

  return Category;
}; 