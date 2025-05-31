const { Reservation, Book } = require('../models');

exports.getReaderBookings = async (req, res) => {
  try {
    const bookings = await Reservation.findAll({
      where: { КодПользователя: req.user.КодПользователя },
      include: [{
        model: Book,
        attributes: ['Название', 'Автор']
      }],
      order: [['ДатаБронирования', 'DESC']]
    });

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        _id: booking.КодБронирования,
        book: {
          title: booking.Book.Название,
          author: booking.Book.Автор
        },
        date: booking.ДатаБронирования,
        status: booking.Статус
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении бронирований'
    });
  }
};
