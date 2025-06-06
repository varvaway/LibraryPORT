const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookCategory = sequelize.define('BookCategory', {
    КодКниги: {
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
    tableName: 'КнигиКатегории',
    timestamps: false
  });

  return BookCategory;
};