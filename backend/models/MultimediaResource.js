const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MultimediaResource = sequelize.define('MultimediaResource', {
    КодРесурса: {
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
    Тип: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Ссылка: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'МультимедийныеРесурсы',
    timestamps: false
  });

  return MultimediaResource;
}; 