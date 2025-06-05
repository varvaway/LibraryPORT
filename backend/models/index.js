const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Определение моделей
const User = require('./User');
const Author = require('./Author');
const Book = require('./Book');
const Category = require('./Category');
const BookAuthor = require('./BookAuthor');
const BookCategory = require('./BookCategory');
const Reservation = require('./Reservation');
const ReservationItem = require('./ReservationItem');

// Книга <-> Автор
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'КодКниги', otherKey: 'КодАвтора' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'КодАвтора', otherKey: 'КодКниги' });

// Книга <-> Категория
Book.belongsToMany(Category, { through: BookCategory, foreignKey: 'КодКниги', otherKey: 'КодКатегории' });
Category.belongsToMany(Book, { through: BookCategory, foreignKey: 'КодКатегории', otherKey: 'КодКниги' });

// Бронирование <-> Элементы бронирования
Reservation.hasMany(ReservationItem, {
  foreignKey: 'КодБронирования',
  sourceKey: 'КодБронирования',
  as: 'Items'
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

// Пользователь <-> Бронирование
User.hasMany(Reservation, {
  foreignKey: 'КодПользователя',
  sourceKey: 'КодПользователя',
  as: 'Reservations'
});
Reservation.belongsTo(User, {
  foreignKey: 'КодПользователя',
  targetKey: 'КодПользователя',
  as: 'User'
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
};