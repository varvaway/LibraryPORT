const { Book, Author, Category } = require('../models');
const { Op } = require('sequelize');

// Get books with filtering and pagination
exports.getBooks = async (req, res) => {
  const { title, author, category, page = 1, limit = 20 } = req.query;
  const where = {};
  if (title) {
    where.Название = { [Op.like]: `%${title}%` };
  }
  const include = [];
  if (author) {
    include.push({
      model: Author,
      where: {
        [Op.or]: [
          { Имя: { [Op.like]: `%${author}%` } },
          { Фамилия: { [Op.like]: `%${author}%` } }
        ]
      },
      through: { attributes: [] }
    });
  } else {
    include.push({ model: Author, through: { attributes: [] } });
  }
  if (category) {
    include.push({
      model: Category,
      where: { Название: { [Op.like]: `%${category}%` } },
      through: { attributes: [] }
    });
  } else {
    include.push({ model: Category, through: { attributes: [] } });
  }
  try {
    const books = await Book.findAndCountAll({
      where,
      include,
      offset: (page - 1) * limit,
      limit: +limit,
      order: [['Название', 'ASC']]
    });
    res.json({
      total: books.count,
      page: +page,
      limit: +limit,
      books: books.rows
    });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, through: { attributes: [] } },
        { model: Category, through: { attributes: [] } }
      ]
    });
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    res.json(book);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Create a new book (admin only)
exports.createBook = async (req, res) => {
  try {
    const { Название, Описание, ГодИздания, ISBN, authors, categories } = req.body;
    const book = await Book.create({
      Название,
      Описание,
      ГодИздания,
      ISBN,
      Статус: 'Доступна'
    });

    if (authors && authors.length > 0) {
      await book.setAuthors(authors);
    }
    if (categories && categories.length > 0) {
      await book.setCategories(categories);
    }

    const createdBook = await Book.findByPk(book.КодКниги, {
      include: [
        { model: Author, through: { attributes: [] } },
        { model: Category, through: { attributes: [] } }
      ]
    });

    res.status(201).json(createdBook);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка при создании книги' });
  }
};

// Update a book (admin only)
exports.updateBook = async (req, res) => {
  try {
    const { Название, Описание, ГодИздания, ISBN, Статус, authors, categories } = req.body;
    const book = await Book.findByPk(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    await book.update({
      Название,
      Описание,
      ГодИздания,
      ISBN,
      Статус
    });

    if (authors && authors.length > 0) {
      await book.setAuthors(authors);
    }
    if (categories && categories.length > 0) {
      await book.setCategories(categories);
    }

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
      ]
    });

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

    res.json(formattedBook);
  } catch (e) {
    console.error('Ошибка при обновлении книги:', e);
    res.status(500).json({ message: 'Ошибка при обновлении книги' });
  }
};

// Delete a book (admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }
    await book.destroy();
    res.json({ message: 'Книга успешно удалена' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка при удалении книги' });
  }
};