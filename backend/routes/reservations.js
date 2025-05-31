const express = require('express');
const router = express.Router();
const { Reservation, User, Book, ReservationItem, Author } = require('../models');
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
      include: [{
        model: ReservationItem,
        as: 'ReservationItems',
        where: {
          КодКниги: bookId
        }
      }],
      where: {
        Статус: 'активна'
      }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'Книга уже забронирована' });
    }

    const reservation = await Reservation.create({
      КодПользователя: userId,
      ДатаБронирования: dateFrom,
      Статус: 'активна'
    });

    await ReservationItem.create({
      КодБронирования: reservation.КодБронирования,
      КодКниги: bookId
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
router.put('/:id/cancel', auth.adminAuth, async (req, res) => {
  try {
    const reservationId = req.params.id;

    // Находим бронирование
    const reservation = await Reservation.findOne({
      where: { КодБронирования: reservationId },
      include: [{
        model: ReservationItem,
        as: 'ReservationItems',
        include: [{ model: Book }]
      }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Обновляем статус бронирования
    reservation.Статус = 'отменена';
    await reservation.save();

    // Обновляем статус книг
    for (const item of reservation.ReservationItems) {
      item.Book.Доступна = true;
      await item.Book.save();
    }

    res.json({ message: 'Бронирование успешно отменено' });
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
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
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['КодПользователя', 'Имя', 'Фамилия', 'ЭлектроннаяПочта']
        },
        {
          model: Book,
          as: 'Books',
          through: { attributes: [] },
          attributes: ['КодКниги', 'Название', 'ГодИздания', 'Статус'],
          include: [{
            model: Author,
            as: 'Authors',
            attributes: ['КодАвтора', 'Имя', 'Фамилия'],
            through: { attributes: [] }
          }]
        }
      ],
      order: [['ДатаБронирования', 'DESC']]
    });

    const formattedReservations = reservations.map(reservation => ({
      КодБронирования: reservation.КодБронирования,
      ДатаБронирования: reservation.ДатаБронирования,
      Статус: reservation.Статус,
      User: reservation.User,
      Books: reservation.Books || [],
    }));

    res.json({
      success: true,
      reservations: formattedReservations
    });
  } catch (error) {
    console.error('Ошибка при получении всех бронирований:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера',
      error: error.message 
    });
  }
});

module.exports = router;
