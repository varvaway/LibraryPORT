const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Category = sequelize.define('Category', {
  КодКатегории: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодКатегории',
  },
  Название: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Название',
  },
  Описание: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'Описание',
  },
}, {
  tableName: 'Категории',
  timestamps: false,
});

module.exports = Category; 