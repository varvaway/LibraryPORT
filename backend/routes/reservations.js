const express = require('express');
const router = express.Router();
const { Reservation, User, Book, ReservationItem, Author, BookAuthor } = require('../models');
const auth = require('../middleware/auth');

// Получение списка бронирований
router.get('/', auth.adminAuth, async (req, res) => {
  try {
    // Проверяем наличие данных в каждой таблице
    const [users, books, reservations, reservationItems] = await Promise.all([
      User.count(),
      Book.count(),
      Reservation.count(),
      ReservationItem.count()
    ]);

    console.log('Количество записей в таблицах:');
    console.log('Пользователи:', users);
    console.log('Книги:', books);
    console.log('Бронирования:', reservations);
    console.log('ЭлементыБронирования:', reservationItems);

    // Если нет бронирований, создаем тестовое бронирование
    if (reservations === 0) {
      const testUser = await User.findOne();
      const testBook = await Book.findOne();
      
      if (testUser && testBook) {
        const newReservation = await Reservation.create({
          КодПользователя: testUser.КодПользователя,
          ДатаБронирования: new Date(),
          Статус: 'Активно',
          ДатаОкончания: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // через неделю
        });

        await ReservationItem.create({
          КодБронирования: newReservation.КодБронирования,
          КодКниги: testBook.КодКниги
        });
      }
    }

    // Получаем все бронирования с вложенными данными
    const allReservations = await Reservation.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Фамилия', 'Имя']
        },
        {
          model: ReservationItem,
          as: 'Items',
          include: [
            {
              model: Book,
              attributes: ['Название', 'ISBN', 'ГодИздания'],
              include: [
                {
                  model: Author,
                  through: BookAuthor,
                  attributes: ['Имя', 'Фамилия']
                }
              ]
            }
          ]
        }
      ],
      order: [['ДатаБронирования', 'DESC']]
    });
    
    console.log('Отправленные данные бронирований:', JSON.stringify(allReservations, null, 2));
    
    res.json({ success: true, reservations: allReservations });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение всех бронирований

// Получение всех бронирований
router.get('/all', auth.adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['Фамилия', 'Имя']
        },
        {
          model: ReservationItem,
          as: 'ReservationItems',
          include: [{
            model: Book,
            as: 'Book',
            attributes: ['Название', 'ISBN', 'ГодИздания'],
            include: [{
              model: Author,
              as: 'Authors',
              attributes: ['Автор']
            }]
          }]
        }
      ]
    });
    res.json({ success: true, reservations });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Редактирование бронирования
router.put('/:id', auth.adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { КодПользователя, КодКниги, ДатаБронирования } = req.body;

    // Проверяем, существует ли бронирование
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Бронирование не найдено' });
    }

    // Обновляем данные бронирования
    reservation.КодПользователя = КодПользователя;
    reservation.ДатаБронирования = ДатаБронирования;
    await reservation.save();

    // Обновляем книгу в ReservationItem
    const reservationItem = await ReservationItem.findOne({
      where: { КодБронирования: id }
    });

    if (reservationItem) {
      reservationItem.КодКниги = КодКниги;
      await reservationItem.save();
    }

    res.json({ success: true, reservation });
  } catch (error) {
    console.error('Ошибка при редактировании бронирования:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение списка пользователей для выпадающего списка
router.get('/users', auth.adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['КодПользователя', 'Фамилия', 'Имя']
    });
    const formattedUsers = users.map(user => ({
      value: user.КодПользователя,
      label: `${user.Фамилия} ${user.Имя}`
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение списка книг для выпадающего списка
router.get('/books', auth.adminAuth, async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: ['КодКниги', 'Название'],
      include: [{
        model: Author,
        as: 'Authors',
        attributes: ['Имя', 'Фамилия']
      }]
    });
    const formattedBooks = books.map(book => ({
      value: book.КодКниги,
      label: `${book.Название} (${book.Authors.map(author => `${author.Фамилия} ${author.Имя}`).join(', ')})`
    }));
    res.json(formattedBooks);
  } catch (error) {
    console.error('Ошибка при получении книг:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание бронирования
router.post('/', auth.userAuth, async (req, res) => {
  try {
    const { bookId, dateFrom, dateTo } = req.body;
    const userId = req.user.КодПользователя;

    // Проверяем, доступна ли книга
    const book = await Book.findByPk(bookId);
    if (!book || book.Доступна !== true) {
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

    // Обновляем статус бронирования
    reservation.Статус = 'активна';
    await reservation.save();

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
    console.log('Запрос на получение всех бронирований');
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

    if (!reservations) {
      console.error('Ошибка: не удалось получить бронирования');
      return res.status(500).json({ success: false, message: 'Ошибка при получении бронирований' });
    }

    console.log('Найдено бронирований:', reservations.length);
    console.log('Первое бронирование:', reservations[0]?.ДатаБронирования);
    console.log('Первое бронирование статус:', reservations[0]?.Статус);

    // Обновляем статус бронирований
    const now = new Date();
    const updatedReservations = reservations.map(reservation => {
      // Обновляем статус бронирования, если он уже истек
      if (reservation.Статус === 'активна') {
        const endDate = new Date(reservation.ДатаБронирования);
        endDate.setDate(endDate.getDate() + 14);
        
        if (now > endDate) {
          console.log(`Обновляем бронирование ${reservation.КодБронирования} на статус "завершено"`);
          reservation.Статус = 'завершена';
          
          // Обновляем статус книг
          reservation.Books.forEach(book => {
            book.Доступна = true;
          });
        }
      }

      return {
        КодБронирования: reservation.КодБронирования,
        ДатаБронирования: reservation.ДатаБронирования,
        Статус: reservation.Статус,
        User: reservation.User,
        Books: reservation.Books || []
      };
    });

    res.json({ success: true, reservations: updatedReservations });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
