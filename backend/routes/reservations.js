const express = require('express');
const router = express.Router();
const { Reservation, Book, User } = require('../models');
const auth = require('../middleware/auth');

// Создание бронирования
router.post('/', auth.userAuth, async (req, res) => {
  try {
    const { bookId, dateFrom, dateTo } = req.body;
    const userId = req.user.КодПользователя;

    // Проверяем, доступна ли книга
    const book = await Book.findByPk(bookId);
    if (!book || !book.Доступна) {
      return res.status(400).json({ message: 'Книга недоступна для бронирования' });
    }

    // Проверяем, нет ли уже бронирования на эти даты
    const existingReservation = await Reservation.findOne({
      where: {
        КодКниги: bookId,
        Статус: 'активна'
      }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'Книга уже забронирована на эти даты' });
    }

    // Создаем бронирование
    const reservation = await Reservation.create({
      КодКниги: bookId,
      КодПользователя: userId,
      ДатаНачала: dateFrom,
      ДатаОкончания: dateTo,
      Статус: 'активна'
    });

    // Обновляем статус книги
    book.Доступна = false;
    await book.save();

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение бронирований пользователя
router.get('/my', auth.userAuth, async (req, res) => {
  try {
    const userId = req.user.КодПользователя;

    const reservations = await Reservation.findAll({
      where: {
        КодПользователя: userId
      },
      include: [{
        model: Book,
        attributes: ['Название', 'Автор']
      }]
    });

    res.json(reservations);
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отмена бронирования
router.delete('/:id', auth.userAuth, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.КодПользователя;

    const reservation = await Reservation.findOne({
      where: {
        КодБронирования: reservationId,
        КодПользователя: userId,
        Статус: 'активна'
      }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Обновляем статус бронирования
    reservation.Статус = 'отменена';
    await reservation.save();

    // Обновляем статус книги
    const book = await Book.findByPk(reservation.КодКниги);
    if (book) {
      book.Доступна = true;
      await book.save();
    }

    res.json({ message: 'Бронирование отменено' });
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение всех бронирований (для админов)
router.get('/all', auth.adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [{
        model: Book,
        attributes: ['Название', 'Автор']
      }, {
        model: User,
        attributes: ['Имя', 'Фамилия', 'Email']
      }]
    });

    res.json(reservations);
  } catch (error) {
    console.error('Ошибка при получении всех бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
