const { Book, Author, Category, BookAuthor, BookCategory, sequelize } = require('../models');
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
        categoryName: book.Categories && book.Categories.length > 0 ? book.Categories[0].Название : '—',
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
  const transaction = await sequelize.transaction();
  try {
    console.log('Received create book request:', req.body);
    const { title, description, year, isbn, status, authors, categories } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Название книги обязательно' });
    }

    const newBook = await Book.create({
      Название: title,
      Описание: description || '',
      ГодИздания: year || null,
      ISBN: isbn || '',
      Статус: status || 'Доступна'
    }, { transaction });

    console.log('Created book:', newBook.toJSON());

    if (authors && authors.length > 0) {
      console.log('Adding authors:', authors);
      await newBook.setAuthors(authors, { transaction });
    }

    if (categories && categories.length > 0) {
      console.log('Adding categories:', categories);
      await newBook.setCategories(categories, { transaction });
    }

    // Загружаем только что созданную книгу с авторами и категориями для ответа
    const createdBook = await Book.findByPk(newBook.КодКниги, {
      include: [
        {
          model: Author,
          through: { attributes: [] },
          attributes: ['КодАвтора', 'Имя', 'Фамилия']
        },
        {
          model: Category,
          through: { attributes: [] },
          attributes: ['КодКатегории', 'Название']
        }
      ],
      transaction,
    });

    await transaction.commit();

    // Форматируем ответ
    const formattedBook = {
      id: createdBook.КодКниги,
      title: createdBook.Название,
      description: createdBook.Описание,
      year: createdBook.ГодИздания,
      isbn: createdBook.ISBN,
      status: createdBook.Статус,
      author: createdBook.Authors && createdBook.Authors.length > 0 
        ? `${createdBook.Authors[0].Имя} ${createdBook.Authors[0].Фамилия}`
        : null,
      authors: createdBook.Authors.map(author => ({
        id: author.КодАвтора,
        firstName: author.Имя,
        lastName: author.Фамилия
      })),
      categories: createdBook.Categories.map(category => ({
        id: category.КодКатегории,
        name: category.Название
      })),
      categoryName: createdBook.Categories && createdBook.Categories.length > 0 
        ? createdBook.Categories[0].Название 
        : null
    };

    console.log('Sending response:', formattedBook);
    res.status(201).json(formattedBook);
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка при создании книги:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновить книгу
const updateBook = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('Received update request for book:', req.params.id);
    console.log('Request body:', req.body);
    
    const { title, description, year, isbn, status, authors, categories } = req.body;
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      console.log('Book not found:', req.params.id);
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    console.log('Found book:', book.toJSON());

    try {
      await book.update({
        Название: title,
        Описание: description || '',
        ГодИздания: year || null,
        ISBN: isbn || '',
        Статус: status || 'Доступна'
      }, { transaction });
      console.log('Book updated successfully');
    } catch (updateError) {
      console.error('Error updating book:', updateError);
      throw updateError;
    }

    try {
      if (authors && authors.length > 0) {
        console.log('Updating authors:', authors);
        await book.setAuthors(authors, { transaction });
      }
      if (categories && categories.length > 0) {
        console.log('Updating categories:', categories);
        await book.setCategories(categories, { transaction });
      }
    } catch (relationError) {
      console.error('Error updating relations:', relationError);
      throw relationError;
    }

    try {
      const updatedBook = await Book.findByPk(book.КодКниги, {
        include: [
          { 
            model: Author,
            through: { attributes: [] },
            attributes: ['КодАвтора', 'Имя', 'Фамилия']
          },
          { 
            model: Category,
            through: { attributes: [] },
            attributes: ['КодКатегории', 'Название']
          }
        ],
        transaction
      });
      console.log('Retrieved updated book with relations');

      // Форматируем ответ
      const formattedBook = {
        id: updatedBook.КодКниги,
        title: updatedBook.Название,
        description: updatedBook.Описание,
        year: updatedBook.ГодИздания,
        isbn: updatedBook.ISBN,
        status: updatedBook.Статус,
        author: updatedBook.Authors && updatedBook.Authors.length > 0 
          ? `${updatedBook.Authors[0].Имя} ${updatedBook.Authors[0].Фамилия}`
          : null,
        authors: updatedBook.Authors.map(author => ({
          id: author.КодАвтора,
          firstName: author.Имя,
          lastName: author.Фамилия
        })),
        categories: updatedBook.Categories.map(category => ({
          id: category.КодКатегории,
          name: category.Название
        })),
        categoryName: updatedBook.Categories && updatedBook.Categories.length > 0 
          ? updatedBook.Categories[0].Название 
          : null
      };

      await transaction.commit();
      console.log('Sending response:', formattedBook);
      res.json(formattedBook);
    } catch (retrieveError) {
      console.error('Error retrieving updated book:', retrieveError);
      throw retrieveError;
    }
  } catch (error) {
    await transaction.rollback();
    console.error('Error in updateBook:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Ошибка сервера',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Удалить книгу
const deleteBook = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const book = await Book.findByPk(req.params.id, { 
      include: [
        { model: Author, through: BookAuthor },
        { model: Category, through: BookCategory }
      ],
      transaction 
    });
    
    if (!book) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    
    // 1. Удаляем связи с авторами
    if (book.Authors && book.Authors.length > 0) {
      await book.removeAuthors(book.Authors, { transaction });
    }
    
    // 2. Удаляем связи с категориями
    if (book.Categories && book.Categories.length > 0) {
      await book.removeCategories(book.Categories, { transaction });
    }
    
    // 3. Удаляем связи из таблицы КнигиАвторы
    await BookAuthor.destroy({
      where: { КодКниги: req.params.id },
      transaction
    });
    
    // 4. Удаляем связи из таблицы КнигиКатегории
    await BookCategory.destroy({
      where: { КодКниги: req.params.id },
      transaction
    });
    
    // 5. Удаляем саму книгу
    await book.destroy({ transaction });
    
    // Если всё успешно, фиксируем транзакцию
    await transaction.commit();
    
    res.json({ message: 'Книга успешно удалена' });
  } catch (error) {
    // В случае ошибки откатываем транзакцию
    await transaction.rollback();
    console.error('Ошибка при удалении книги:', error);
    res.status(500).json({ 
      message: 'Ошибка при удалении книги',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
