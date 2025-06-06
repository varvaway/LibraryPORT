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
        model: ReservationItem,
        include: [{
          model: Book,
        include: [{
          model: Author,
          through: { attributes: [] },
          attributes: ['Имя', 'Фамилия']
          }]
        }]
      }],
      order: [['ДатаБронирования', 'DESC']]
    });

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        _id: booking.КодБронирования,
        books: booking.ReservationItems.map(item => ({
          id: item.Book.КодКниги,
          title: item.Book.Название,
          author: item.Book.Authors && item.Book.Authors.length > 0 
            ? `${item.Book.Authors[0].Имя} ${item.Book.Authors[0].Фамилия}`
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
