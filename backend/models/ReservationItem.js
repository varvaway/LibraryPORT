const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReservationItem = sequelize.define('ReservationItem', {
    КодБронирования: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    КодКниги: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: 'ЭлементыБронирования',
    timestamps: false
  });

  return ReservationItem;
};