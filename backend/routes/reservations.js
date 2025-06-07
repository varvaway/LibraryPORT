const express = require('express');
const router = express.Router();
const { Reservation, User, Book, ReservationItem, Author, BookAuthor } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Константы для статусов
const RESERVATION_STATUS = {
  ACTIVE: 'Активно',
  CANCELLED: 'Отменено',
  COMPLETED: 'Завершено'
};

const BOOK_STATUS = {
  AVAILABLE: 'Доступна',
  RESERVED: 'Забронирована'
};

// Получение всех бронирований (для админов)
router.get('/', auth.adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          attributes: ['КодПользователя', 'Имя', 'Фамилия', 'ЭлектроннаяПочта']
        },
        {
          model: ReservationItem,
          include: [{
              model: Book,
            attributes: ['КодКниги', 'Название', 'ГодИздания', 'Статус'],
            include: [{
                  model: Author,
              attributes: ['КодАвтора', 'Имя', 'Фамилия']
            }]
          }]
        }
      ],
      order: [['ДатаБронирования', 'DESC']]
    });
    
    res.json({ 
      success: true, 
      reservations: reservations.map(reservation => ({
        id: reservation.КодБронирования,
        user: {
          id: reservation.User.КодПользователя,
          firstName: reservation.User.Имя,
          lastName: reservation.User.Фамилия,
          email: reservation.User.ЭлектроннаяПочта
        },
        books: reservation.ReservationItems.map(item => ({
          id: item.Book.КодКниги,
          title: item.Book.Название,
          year: item.Book.ГодИздания,
          status: item.Book.Статус,
          authors: item.Book.Authors.map(author => ({
            id: author.КодАвтора,
            firstName: author.Имя,
            lastName: author.Фамилия
          }))
        })),
        dateFrom: reservation.ДатаБронирования,
        dateTo: reservation.ДатаОкончания,
        status: reservation.Статус
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение бронирований текущего пользователя
router.get('/my', auth.userAuth, async (req, res) => {
  try {
    const userId = req.user.КодПользователя;
    const reservations = await Reservation.findAll({
      where: { КодПользователя: userId },
      include: [{
          model: ReservationItem,
          include: [{
            model: Book,
          attributes: ['КодКниги', 'Название', 'Статус'],
            include: [{
              model: Author,
            attributes: ['Имя', 'Фамилия']
            }]
          }]
      }],
      order: [['ДатаБронирования', 'DESC']]
    });

    res.json({
      success: true,
      bookings: reservations.map(reservation => ({
        _id: reservation.КодБронирования,
        books: reservation.ReservationItems.map(item => ({
          id: item.Book.КодКниги,
          title: item.Book.Название,
          author: item.Book.Authors.map(a => `${a.Имя} ${a.Фамилия}`).join(', '),
          status: item.Book.Статус
        })),
        date: reservation.ДатаБронирования,
        dateTo: reservation.ДатаОкончания,
        status: reservation.Статус
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Создание бронирования
router.post('/', auth.userAuth, async (req, res) => {
  try {
    const { bookId, dateFrom, dateTo } = req.body;
    const userId = req.user.КодПользователя;

    // Validate dates
    if (!dateFrom || !dateTo) {
      return res.status(400).json({ message: 'Необходимо указать даты бронирования' });
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Неверный формат даты' });
    }

    if (startDate > endDate) {
      return res.status(400).json({ message: 'Дата начала не может быть позже даты окончания' });
    }

    // Проверяем, доступна ли книга
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    if (book.Статус !== BOOK_STATUS.AVAILABLE) {
      return res.status(400).json({ message: 'Книга недоступна для бронирования' });
    }

    // Проверяем, нет ли уже бронирования на эти даты
    const existingReservation = await Reservation.findOne({
      include: [{
        model: ReservationItem,
        where: {
          КодКниги: bookId
        }
      }],
      where: {
        Статус: RESERVATION_STATUS.ACTIVE,
        [Op.or]: [
          {
            [Op.and]: [
              { ДатаБронирования: { [Op.lte]: endDate } },
              { ДатаОкончания: { [Op.gte]: startDate } }
            ]
          }
        ]
      }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'Книга уже забронирована на указанные даты' });
    }

    // Создаем бронирование
    const reservation = await Reservation.create({
      КодПользователя: userId,
      ДатаБронирования: startDate,
      ДатаОкончания: endDate,
      Статус: RESERVATION_STATUS.ACTIVE
    });

    // Создаем элемент бронирования
    await ReservationItem.create({
      КодБронирования: reservation.КодБронирования,
      КодКниги: bookId
    });

    // Обновляем статус книги
    book.Статус = BOOK_STATUS.RESERVED;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Книга успешно забронирована',
      reservation: {
        id: reservation.КодБронирования,
        bookId: bookId,
        dateFrom: startDate,
        dateTo: endDate,
        status: reservation.Статус
      }
    });
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка при создании бронирования',
      error: error.message 
    });
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
        Статус: RESERVATION_STATUS.ACTIVE
      },
      include: [{
        model: ReservationItem,
        include: [{ model: Book }]
      }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Обновляем статус бронирования
    reservation.Статус = RESERVATION_STATUS.CANCELLED;
    await reservation.save();

    // Обновляем статус книг
    for (const item of reservation.ReservationItems) {
      item.Book.Статус = BOOK_STATUS.AVAILABLE;
      await item.Book.save();
    }

    res.json({ 
      success: true,
      message: 'Бронирование отменено' 
    });
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
