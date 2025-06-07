const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const { Book, BookCategory } = require('../models');

// Получение всех категорий (для админов)
router.get('/', auth.adminAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['Название', 'ASC']]
    });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение категории по ID
router.get('/:id', auth.adminAuth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Категория не найдена' });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Создание новой категории
router.post('/', auth.adminAuth, async (req, res) => {
  try {
    const { Название, Описание } = req.body;
    if (!Название) {
      return res.status(400).json({ success: false, message: 'Название категории обязательно' });
    }

    const newCategory = await Category.create({ Название, Описание });
    res.status(201).json({ success: true, message: 'Категория успешно создана', category: newCategory });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Категория с таким названием уже существует' });
    }
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Обновление категории
router.put('/:id', auth.adminAuth, async (req, res) => {
  try {
    const { Название, Описание } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Категория не найдена' });
    }
    if (!Название) {
      return res.status(400).json({ success: false, message: 'Название категории обязательно' });
    }

    category.Название = Название;
    category.Описание = Описание;
    await category.save();

    res.json({ success: true, message: 'Категория успешно обновлена', category });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Категория с таким названием уже существует' });
    }
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Удаление категории
router.delete('/:id', auth.adminAuth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Категория не найдена' });
    }

    await category.destroy();
    res.json({ success: true, message: 'Категория успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение всех книг в категории
router.get('/:categoryId/books', auth.adminAuth, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findByPk(categoryId, {
      include: [{
        model: Book,
        through: { attributes: [] } // Exclude join table attributes
      }]
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Категория не найдена' });
    }

    res.json({ success: true, books: category.Books });
  } catch (error) {
    console.error('Ошибка при получении книг категории:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение всех доступных книг (которые не в этой категории)
router.get('/:categoryId/available-books', auth.adminAuth, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const booksInCategory = await BookCategory.findAll({
      where: { КодКатегории: categoryId },
      attributes: ['КодКниги']
    });
    const bookIdsInCategory = booksInCategory.map(bc => bc.КодКниги);

    const availableBooks = await Book.findAll({
      where: {
        КодКниги: { [Op.notIn]: bookIdsInCategory }
      },
      order: [['Название', 'ASC']]
    });

    res.json({ success: true, books: availableBooks });
  } catch (error) {
    console.error('Ошибка при получении доступных книг:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Добавление книги в категорию
router.post('/:categoryId/books', auth.adminAuth, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { bookId } = req.body;

    const category = await Category.findByPk(categoryId);
    const book = await Book.findByPk(bookId);

    if (!category || !book) {
      return res.status(404).json({ success: false, message: 'Категория или книга не найдены' });
    }

    await category.addBook(book);
    res.status(201).json({ success: true, message: 'Книга успешно добавлена в категорию' });
  } catch (error) {
    console.error('Ошибка при добавлении книги в категорию:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Книга уже находится в этой категории' });
    }
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Удаление книги из категории
router.delete('/:categoryId/books/:bookId', auth.adminAuth, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const bookId = req.params.bookId;

    const category = await Category.findByPk(categoryId);
    const book = await Book.findByPk(bookId);

    if (!category || !book) {
      return res.status(404).json({ success: false, message: 'Категория или книга не найдены' });
    }

    await category.removeBook(book);
    res.json({ success: true, message: 'Книга успешно удалена из категории' });
  } catch (error) {
    console.error('Ошибка при удалении книги из категории:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router; 