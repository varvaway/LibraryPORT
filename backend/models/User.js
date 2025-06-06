const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    КодПользователя: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Имя: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Фамилия: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ЭлектроннаяПочта: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    ХэшПароля: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Роль: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Телефон: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Пользователи',
    timestamps: false
  });

  return User;
};