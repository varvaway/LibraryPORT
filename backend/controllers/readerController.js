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
    const readerId = parseInt(req.params.id);
    
    if (isNaN(readerId)) {
      return res.status(400).json({ success: false, message: 'Некорректный ID читателя' });
    }

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

    let reservations = [];
    try {
      const rawReservations = await Reservation.findAll({
        where: {
          КодПользователя: readerId
        },
        include: [{
          model: Book,
          attributes: ['Название', 'Автор']
        }],
        attributes: ['КодБронирования', 'ДатаБронирования', 'Статус']
      });

      // Преобразуем данные, добавляя дату окончания
      reservations = rawReservations.map(res => {
        const startDate = new Date(res.ДатаБронирования);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 14); // Добавляем 14 дней

        return {
          КодБронирования: res.КодБронирования,
          ДатаНачала: startDate,
          ДатаОкончания: endDate,
          Статус: res.Статус,
          Book: res.Book
        };
      });
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
      // Продолжаем с пустым массивом бронирований
    }

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

// Обновить информацию о читателе
const updateReader = async (req, res) => {
  try {
    const readerId = req.params.id;
    const { Имя, Фамилия, ЭлектроннаяПочта, Телефон } = req.body;

    const reader = await User.findOne({
      where: {
        КодПользователя: readerId,
        Роль: 'Читатель'
      }
    });

    if (!reader) {
      return res.status(404).json({ success: false, message: 'Читатель не найден' });
    }

    await reader.update({
      Имя,
      Фамилия,
      ЭлектроннаяПочта,
      Телефон
    });

    res.json({
      success: true,
      reader: {
        КодПользователя: reader.КодПользователя,
        Имя: reader.Имя,
        Фамилия: reader.Фамилия,
        ЭлектроннаяПочта: reader.ЭлектроннаяПочта,
        Телефон: reader.Телефон
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении читателя:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Удалить читателя
const deleteReader = async (req, res) => {
  try {
    const readerId = req.params.id;

    const reader = await User.findOne({
      where: {
        КодПользователя: readerId,
        Роль: 'Читатель'
      }
    });

    if (!reader) {
      return res.status(404).json({ success: false, message: 'Читатель не найден' });
    }

    // Удаляем все бронирования читателя
    await Reservation.destroy({
      where: {
        КодПользователя: readerId
      }
    });

    // Удаляем самого читателя
    await reader.destroy();

    res.json({ success: true, message: 'Читатель успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении читателя:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

// Создать нового читателя
const createReader = async (req, res) => {
  try {
    console.log('=== Создание нового читателя ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { Имя, Фамилия, ЭлектроннаяПочта, Телефон } = req.body;
    console.log('Данные после деструктуризации:', { Имя, Фамилия, ЭлектроннаяПочта, Телефон });

    // Проверяем обязательные поля
    if (!Имя || !Фамилия || !ЭлектроннаяПочта) {
      console.log('Отсутствуют обязательные поля');
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, заполните все обязательные поля'
      });
    }

    console.log('Проверяем существование пользователя с email:', ЭлектроннаяПочта);
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await User.findOne({
      where: {
        ЭлектроннаяПочта: ЭлектроннаяПочта
      }
    });

    if (existingUser) {
      console.log('Найден существующий пользователь с таким email');
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    console.log('Создаем нового читателя...');
    // Создаем нового читателя
    const userData = {
      Имя,
      Фамилия,
      ЭлектроннаяПочта,
      Телефон: Телефон || null,
      Роль: 'Читатель',
      ХэшПароля: 'temporary'
    };
    
    console.log('Данные для создания:', JSON.stringify(userData, null, 2));
    
    // Проверяем, что все обязательные поля заполнены
    if (!userData.Имя || !userData.Фамилия || !userData.ЭлектроннаяПочта || !userData.Роль || !userData.ХэшПароля) {
      console.error('Отсутствуют обязательные поля:', { Имя: !!userData.Имя, Фамилия: !!userData.Фамилия, ЭлектроннаяПочта: !!userData.ЭлектроннаяПочта, Роль: !!userData.Роль, ХэшПароля: !!userData.ХэшПароля });
      return res.status(400).json({ success: false, message: 'Отсутствуют обязательные поля' });
    }
    
    const reader = await User.create(userData);

    console.log('Читатель успешно создан:', reader.toJSON());
    res.status(201).json({
      success: true,
      message: 'Читатель успешно создан',
      reader
    });
  } catch (error) {
    console.error('Ошибка при создании читателя:', error);
    console.error('Детали ошибки:', error.message);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.errors.map(err => err.message)
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании читателя',
      error: error.message
    });
  }
};

module.exports = {
  getReaders,
  getReaderDetails,
  updateReader,
  deleteReader,
  createReader
};
