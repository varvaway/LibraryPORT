const express = require('express');
const router = express.Router();
const { User, Book } = require('../models');
const auth = require('../middleware/auth');

// Получение списка всех пользователей (только для админов)
router.get('/users', auth.adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['КодПользователя', 'Email', 'Имя', 'Фамилия', 'Роль', 'Телефон']
    });
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Изменение роли пользователя (только для админов)
router.put('/users/:id/role', auth.adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.Роль = role;
    await user.save();

    res.json({ message: 'Роль пользователя обновлена', user });
  } catch (error) {
    console.error('Ошибка при обновлении роли:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление новой книги (только для админов)
router.post('/books', auth.adminAuth, async (req, res) => {
  try {
    const { название, автор, год, жанр, описание } = req.body;

    const book = await Book.create({
      Название: название,
      Автор: автор,
      Год: год,
      Жанр: жанр,
      Описание: описание,
      Доступна: true
    });

    res.status(201).json(book);
  } catch (error) {
    console.error('Ошибка при добавлении книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление книги (только для админов)
router.delete('/books/:id', auth.adminAuth, async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Книга не найдена' });
    }

    await book.destroy();

    res.json({ message: 'Книга удалена' });
  } catch (error) {
    console.error('Ошибка при удалении книги:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;