const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResourceCategory = sequelize.define('ResourceCategory', {
  КодРесурса: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодРесурса',
  },
  КодКатегории: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'КодКатегории',
  },
}, {
  tableName: 'РесурсыКатегории',
  timestamps: false,
});

module.exports = ResourceCategory;