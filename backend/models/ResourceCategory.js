const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResourceCategory = sequelize.define('ResourceCategory', {
    КодРесурса: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    КодКатегории: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: 'РесурсыКатегории',
    timestamps: false
  });

  return ResourceCategory;
};