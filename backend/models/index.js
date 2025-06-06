const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Определение моделей
const User = require('./User')(sequelize);
const Author = require('./Author')(sequelize);
const Book = require('./Book')(sequelize);
const Category = require('./Category')(sequelize);
const BookAuthor = require('./BookAuthor')(sequelize);
const BookCategory = require('./BookCategory')(sequelize);
const Reservation = require('./Reservation')(sequelize);
const ReservationItem = require('./ReservationItem')(sequelize);
const MultimediaResource = require('./MultimediaResource')(sequelize);

// Книга <-> Автор
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'КодКниги', otherKey: 'КодАвтора' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'КодАвтора', otherKey: 'КодКниги' });

// Книга <-> Категория
Book.belongsToMany(Category, { through: BookCategory, foreignKey: 'КодКниги', otherKey: 'КодКатегории' });
Category.belongsToMany(Book, { through: BookCategory, foreignKey: 'КодКатегории', otherKey: 'КодКниги' });

// Бронирование <-> Элементы бронирования
Reservation.hasMany(ReservationItem, {
  foreignKey: 'КодБронирования',
  sourceKey: 'КодБронирования'
});
ReservationItem.belongsTo(Reservation, {
  foreignKey: 'КодБронирования',
  targetKey: 'КодБронирования'
});

// Книга <-> Элементы бронирования
ReservationItem.belongsTo(Book, {
  foreignKey: 'КодКниги',
  targetKey: 'КодКниги'
});
Book.hasMany(ReservationItem, {
  foreignKey: 'КодКниги',
  sourceKey: 'КодКниги'
});

// Пользователь <-> Бронирование
User.hasMany(Reservation, {
  foreignKey: 'КодПользователя',
  sourceKey: 'КодПользователя'
});
Reservation.belongsTo(User, {
  foreignKey: 'КодПользователя',
  targetKey: 'КодПользователя'
});

module.exports = {
  sequelize,
  User,
  Author,
  Book,
  Category,
  BookAuthor,
  BookCategory,
  Reservation,
  ReservationItem,
  MultimediaResource
};