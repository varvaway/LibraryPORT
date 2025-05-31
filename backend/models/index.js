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
const MultimediaResource = require('./MultimediaResource');
const ResourceCategory = require('./ResourceCategory');

// Книга <-> Автор
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'КодКниги', otherKey: 'КодАвтора' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'КодАвтора', otherKey: 'КодКниги' });

// Книга <-> Категория
Book.belongsToMany(Category, { through: BookCategory, foreignKey: 'КодКниги', otherKey: 'КодКатегории' });
Category.belongsToMany(Book, { through: BookCategory, foreignKey: 'КодКатегории', otherKey: 'КодКниги' });

// Книга <-> Бронирование (через ЭлементыБронирования)
Book.belongsToMany(Reservation, { 
  through: ReservationItem, 
  foreignKey: 'КодКниги', 
  otherKey: 'КодБронирования',
  as: 'Reservations'
});
Reservation.belongsToMany(Book, { 
  through: ReservationItem, 
  foreignKey: 'КодБронирования', 
  otherKey: 'КодКниги',
  as: 'Books'
});

// Пользователь <-> Бронирование
User.hasMany(Reservation, { 
  foreignKey: 'КодПользователя',
  as: 'Reservations'
});
Reservation.belongsTo(User, { 
  foreignKey: 'КодПользователя',
  as: 'User'
});

// МультимедийныйРесурс <-> Категория
MultimediaResource.belongsToMany(Category, { through: 'РесурсыКатегории', foreignKey: 'КодРесурса', otherKey: 'КодКатегории' });
Category.belongsToMany(MultimediaResource, { through: 'РесурсыКатегории', foreignKey: 'КодКатегории', otherKey: 'КодРесурса' });

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
  MultimediaResource,
  ResourceCategory,
};