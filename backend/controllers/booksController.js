const { Book, Author, Category, BookAuthor, BookCategory } = require('../models');
const { Op } = require('sequelize');

// Контроллер для работы с книгами

// Получить все книги
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [
        {
          model: Author,
          through: BookAuthor,
          attributes: ['Имя', 'Фамилия']
        },
        {
          model: Category,
          through: BookCategory,
          attributes: ['КодКатегории', 'Название']
        }
      ]
    });

    const formattedBooks = books.map(book => {
      const author = book.Authors && book.Authors[0];
      
      // Форматируем год: если год отрицательный, добавляем "до н.э."
      const formatYear = (year) => {
        if (year < 0) {
          return `${Math.abs(year)} до н.э.`;
        }
        return year.toString();
      };

      return {
        id: book.КодКниги,
        title: book.Название,
        description: book.Описание,
        year: book.ГодИздания,
        formattedYear: book.ГодИздания !== null ? formatYear(book.ГодИздания) : null,
        isbn: book.ISBN,
        status: book.Статус,
        categories: book.Categories.map(category => ({
          id: category.КодКатегории,
          name: category.Название
        })),
        author: author ? `${author.Имя} ${author.Фамилия}` : 'Неизвестный автор',
        originalYear: book.ГодИздания // Сохраняем исходное значение года для сортировки
      };
    });

    res.json(formattedBooks);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: error.message });
  }
};

// Получить книгу по ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    
    const formattedBook = {
      id: book.КодКниги,
      title: book.Название,
      author: book.Автор,
      year: book.Год,
      genre: book.Жанр,
      description: book.Описание,
      available: book.Доступна
    };
    
    res.json(formattedBook);
  } catch (error) {
    console.error('Ошибка при получении книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать новую книгу
const createBook = async (req, res) => {
  try {
    const { title, author, year, genre, description } = req.body;
    const book = await Book.create({
      Название: title,
      Автор: author,
      Год: year,
      Жанр: genre,
      Описание: description,
      Доступна: true
    });
    
    const formattedBook = {
      id: book.КодКниги,
      title: book.Название,
      author: book.Автор,
      year: book.Год,
      genre: book.Жанр,
      description: book.Описание,
      available: book.Доступна
    };
    
    res.status(201).json(formattedBook);
  } catch (error) {
    console.error('Ошибка при создании книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить книгу
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    
    const { title, author, year, genre, description } = req.body;
    await book.update({
      Название: title,
      Автор: author,
      Год: year,
      Жанр: genre,
      Описание: description
    });
    
    const formattedBook = {
      id: book.КодКниги,
      title: book.Название,
      author: book.Автор,
      year: book.Год,
      genre: book.Жанр,
      description: book.Описание,
      available: book.Доступна
    };
    
    res.json(formattedBook);
  } catch (error) {
    console.error('Ошибка при обновлении книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить книгу
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    await book.destroy();
    res.json({ message: 'Книга успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Забронировать книгу
const reserveBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    if (!book.Доступна) {
      return res.status(400).json({ message: 'Книга уже забронирована' });
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Определяем время возврата
    let returnDate = new Date(now);
    
    // Если текущее время после рабочего дня (после 17:00),
    // бронь начинается со следующего рабочего дня
    if (currentHour >= 17) {
      returnDate.setDate(returnDate.getDate() + 1);
      returnDate.setHours(13, 0, 0, 0); // Бронь до 13:00 следующего дня
    } else {
      returnDate.setHours(currentHour + 4, 0, 0, 0); // Бронь на 4 часа
    }

    // Создаем бронирование
    const reservation = await Reservation.create({
      КодКниги: book.КодКниги,
      КодПользователя: req.user.КодПользователя,
      ДатаНачала: now,
      ДатаОкончания: returnDate,
      Статус: 'активна'
    });

    // Обновляем статус книги
    await book.update({ Доступна: false });

    res.json({
      message: 'Книга успешно забронирована',
      returnDate: returnDate,
      book: {
        id: book.КодКниги,
        title: book.Название,
        author: book.Автор
      }
    });
  } catch (error) {
    console.error('Ошибка при бронировании книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить текущие брони пользователя
exports.getCurrentReservations = async (req, res) => {
  try {
    const userId = req.user.КодПользователя;
    const currentDate = new Date();

    const reservations = await Reservation.findAll({
      where: {
        КодПользователя: userId,
        ДатаОкончания: {
          [Op.gte]: currentDate
        }
      },
      include: [{
        model: Book,
        attributes: ['Название', 'Автор']
      }],
      order: [['ДатаНачала', 'DESC']]
    });

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.КодБронирования,
      title: reservation.Книга.Название,
      author: reservation.Книга.Автор,
      reservationDate: reservation.ДатаНачала,
      returnDate: reservation.ДатаОкончания,
      status: reservation.Статус
    }));

    res.json(formattedReservations);
  } catch (error) {
    console.error('Ошибка при получении текущих броней:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить историю броней пользователя
exports.getReservationHistory = async (req, res) => {
  try {
    const userId = req.user.КодПользователя;
    const currentDate = new Date();

    const reservations = await Reservation.findAll({
      where: {
        КодПользователя: userId,
        ДатаОкончания: {
          [Op.lt]: currentDate
        }
      },
      include: [{
        model: Book,
        attributes: ['Название', 'Автор']
      }],
      order: [['ДатаОкончания', 'DESC']]
    });

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.КодБронирования,
      title: reservation.Книга.Название,
      author: reservation.Книга.Автор,
      reservationDate: reservation.ДатаНачала,
      returnDate: reservation.ДатаОкончания,
      status: 'Возвращена'
    }));

    res.json(formattedReservations);
  } catch (error) {
    console.error('Ошибка при получении истории броней:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить все категории
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['КодКатегории', 'Название'],
      order: [['КодКатегории', 'ASC']]
    });

    const formattedCategories = categories.map(category => ({
      id: category.КодКатегории,
      name: category.Название,
      icon: `/ic_${category.КодКатегории}.png`
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  reserveBook,
  getAllCategories
};
