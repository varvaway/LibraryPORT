const { Reservation, ReservationItem, Book, User } = require('../models');
const { Op } = require('sequelize');

// Создать бронирование
exports.createReservation = async (req, res) => {
  const { books, returnDate } = req.body;
  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ message: 'Не выбраны книги для бронирования' });
  }
  if (!returnDate) {
    return res.status(400).json({ message: 'Не указана дата возврата' });
  }

  try {
    // Проверяем доступность книг (Статус = 'Доступна')
    const availableBooks = await Book.findAll({
      where: {
        КодКниги: { [Op.in]: books },
        Статус: 'Доступна',
      },
    });
    if (availableBooks.length !== books.length) {
      return res.status(400).json({ message: 'Одна или несколько книг недоступны для бронирования' });
    }

    // Создаём бронирование
    const reservation = await Reservation.create({
      КодПользователя: req.user.id,
      ДатаБронирования: new Date(),
      ДатаВозврата: new Date(returnDate),
      Статус: 'Активно',
    });

    // Добавляем книги в элементы бронирования
    await Promise.all(books.map(КодКниги => ReservationItem.create({
      КодБронирования: reservation.КодБронирования,
      КодКниги,
    })));

    // Меняем статус книг на "Забронирована"
    await Book.update({ Статус: 'Забронирована' }, { where: { КодКниги: { [Op.in]: books } } });

    const fullReservation = await Reservation.findByPk(reservation.КодБронирования, {
      include: [
        {
          model: Book,
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ['id', 'Имя', 'Фамилия', 'Email']
        }
      ]
    });

    res.status(201).json(fullReservation);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить свои бронирования
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { КодПользователя: req.user.id },
      include: [
        {
          model: Book,
          through: { attributes: [] },
        },
      ],
      order: [['ДатаБронирования', 'DESC']],
    });
    res.json(reservations);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить все бронирования (только для администратора)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Book,
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ['id', 'Имя', 'Фамилия', 'Email']
        }
      ],
      order: [['ДатаБронирования', 'DESC']],
    });
    res.json(reservations);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отменить бронирование
exports.cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByPk(id, {
      include: [{ model: Book }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Проверяем права (только владелец или администратор может отменить)
    if (reservation.КодПользователя !== req.user.id && req.user.role !== 'Администратор') {
      return res.status(403).json({ message: 'Нет прав для отмены бронирования' });
    }

    // Получаем коды книг для обновления их статуса
    const bookIds = reservation.Books.map(book => book.КодКниги);

    // Обновляем статус книг на "Доступна"
    await Book.update(
      { Статус: 'Доступна' },
      { where: { КодКниги: { [Op.in]: bookIds } } }
    );

    // Обновляем статус бронирования
    await reservation.update({ Статус: 'Отменено' });

    res.json({ message: 'Бронирование успешно отменено' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Завершить бронирование (возврат книг)
exports.completeReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByPk(id, {
      include: [{ model: Book }]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    // Только администратор может завершить бронирование
    if (req.user.role !== 'Администратор') {
      return res.status(403).json({ message: 'Только администратор может завершить бронирование' });
    }

    // Получаем коды книг для обновления их статуса
    const bookIds = reservation.Books.map(book => book.КодКниги);

    // Обновляем статус книг на "Доступна"
    await Book.update(
      { Статус: 'Доступна' },
      { where: { КодКниги: { [Op.in]: bookIds } } }
    );

    // Обновляем статус бронирования
    await reservation.update({ 
      Статус: 'Завершено',
      ДатаВозврата: new Date()
    });

    res.json({ message: 'Бронирование успешно завершено' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};