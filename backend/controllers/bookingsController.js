const { Reservation, Book, Author, ReservationItem } = require('../models');

exports.getReaderBookings = async (req, res) => {
  try {
    // Гарантируем, что используем правильный идентификатор пользователя
    const userId = req.user.КодПользователя || req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Не удалось определить пользователя (нет id)'
      });
    }

    const bookings = await Reservation.findAll({
      where: { КодПользователя: userId },
      include: [{
        model: Book,
        as: 'Books',
        through: { attributes: [] },
        include: [{
          model: Author,
          through: { attributes: [] },
          attributes: ['Имя', 'Фамилия']
        }]
      }],
      order: [['ДатаБронирования', 'DESC']]
    });

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        _id: booking.КодБронирования,
        books: booking.Books.map(book => ({
          id: book.КодКниги,
          title: book.Название,
          author: book.Authors && book.Authors.length > 0 
            ? `${book.Authors[0].Имя} ${book.Authors[0].Фамилия}`
            : 'Неизвестный автор'
        })),
        date: booking.ДатаБронирования,
        status: booking.Статус
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении бронирований',
      error: error.message 
    });
  }
};
