const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  КодКатегории: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодКатегории',
  },
  Название: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Название',
  },
  Описание: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Описание',
  },
}, {
  tableName: 'Категории',
  timestamps: false,
  schema: 'dbo',
  freezeTableName: true
});

module.exports = Category; 