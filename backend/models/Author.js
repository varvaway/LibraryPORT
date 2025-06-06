const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Author = sequelize.define('Author', {
    КодАвтора: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Имя: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Фамилия: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Биография: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Авторы',
    timestamps: false
  });

  return Author;
}; 