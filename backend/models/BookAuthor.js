const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookAuthor = sequelize.define('BookAuthor', {
    КодКниги: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    КодАвтора: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: 'КнигиАвторы',
    timestamps: false
  });

  return BookAuthor;
};