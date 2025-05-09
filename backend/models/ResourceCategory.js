const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const ResourceCategory = sequelize.define('ResourceCategory', {
  КодРесурса: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодРесурса',
  },
  КодКатегории: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'КодКатегории',
  },
}, {
  tableName: 'РесурсыКатегории',
  timestamps: false,
});

module.exports = ResourceCategory; 