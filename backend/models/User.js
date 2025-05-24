const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  КодПользователя: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'КодПользователя'
  },
  Имя: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Имя'
  },
  Фамилия: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Фамилия'
  },
  ХэшПароля: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'ХэшПароля'
  }
}, {
  tableName: 'Пользователи',
  timestamps: false,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('ХэшПароля')) {
        user.ХэшПароля = await bcrypt.hash(user.ХэшПароля, 10);
      }
    }
  }
});

User.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.ХэшПароля);
};

module.exports = User;