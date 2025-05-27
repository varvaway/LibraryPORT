const { User, Reservation, Book } = require('../models');
const { Op } = require('sequelize');

// Получить список всех читателей
const getReaders = async (req, res) => {
  try {
    const readers = await User.findAll({
      where: {
        Роль: 'Читатель'
      },
      attributes: ['КодПользователя', 'Имя', 'Фамилия', 'ЭлектроннаяПочта', 'Телефон', 'Роль']
    });

    console.log('Найдены читатели:', readers);
    res.json({ success: true, readers });
  } catch (error) {
    console.error('Ошибка при получении списка читателей:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Получить информацию о конкретном читателе и его бронированиях
const getReaderDetails = async (req, res) => {
  try {
    const readerId = req.params.id;
    
    const reader = await User.findOne({
      where: {
        КодПользователя: readerId,
        Роль: 'Читатель'
      },
      attributes: ['КодПользователя', 'Имя', 'Фамилия', 'ЭлектроннаяПочта', 'Телефон']
    });

    if (!reader) {
      return res.status(404).json({ success: false, message: 'Читатель не найден' });
    }

    const reservations = await Reservation.findAll({
      where: {
        КодПользователя: readerId
      },
      include: [{
        model: Book,
        attributes: ['Название', 'Автор']
      }],
      attributes: ['КодБронирования', 'ДатаНачала', 'ДатаОкончания', 'Статус']
    });

    res.json({
      success: true,
      reader,
      reservations
    });
  } catch (error) {
    console.error('Ошибка при получении информации о читателе:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

module.exports = {
  getReaders,
  getReaderDetails
};
