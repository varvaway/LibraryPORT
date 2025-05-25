const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MultimediaResource = sequelize.define('MultimediaResource', {
  КодРесурса: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодРесурса',
  },
  Название: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'Название',
  },
  Описание: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Описание',
  },
  Тип: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Тип',
  },
  Ссылка: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Ссылка',
  },
}, {
  tableName: 'МультимедийныеРесурсы',
  timestamps: false,
});

module.exports = MultimediaResource; 