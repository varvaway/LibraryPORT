const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define('Reservation', {
    КодБронирования: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    КодПользователя: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ДатаБронирования: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Статус: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ДатаОкончания: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'Бронирования',
    timestamps: false
  });

  return Reservation;
};