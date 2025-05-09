const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const MultimediaResource = sequelize.define('MultimediaResource', {
  КодРесурса: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодРесурса',
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
  Тип: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Тип',
  },
  Ссылка: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Ссылка',
  },
}, {
  tableName: 'МультимедийныеРесурсы',
  timestamps: false,
});

module.exports = MultimediaResource; 