const { Author } = require('../models');
const { Op } = require('sequelize');

// Контроллер для работы с авторами

// Получить всех авторов
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll({
      attributes: ['КодАвтора', 'Имя', 'Фамилия', 'Биография'],
      order: [['Фамилия', 'ASC'], ['Имя', 'ASC']]
    });
    const formattedAuthors = authors.map(author => ({
      id: author.КодАвтора,
      firstName: author.Имя,
      lastName: author.Фамилия,
      fullName: `${author.Имя} ${author.Фамилия}`.trim(),
      biography: author.Биография
    }));
    res.json(formattedAuthors);
  } catch (error) {
    console.error('Ошибка при получении авторов:', error);
    res.status(500).json({ message: error.message });
  }
};

// Получить автора по ID
const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id, {
      attributes: ['КодАвтора', 'Имя', 'Фамилия', 'Биография']
    });
    if (!author) {
      return res.status(404).json({ message: 'Автор не найден' });
    }
    const formattedAuthor = {
      id: author.КодАвтора,
      firstName: author.Имя,
      lastName: author.Фамилия,
      fullName: `${author.Имя} ${author.Фамилия}`.trim(),
      biography: author.Биография
    };
    res.json(formattedAuthor);
  } catch (error) {
    console.error('Ошибка при получении автора по ID:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать нового автора
const createAuthor = async (req, res) => {
  try {
    const { firstName, lastName, biography } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Имя и фамилия автора обязательны' });
    }
    const newAuthor = await Author.create({
      Имя: firstName,
      Фамилия: lastName,
      Биография: biography || null
    });
    const formattedAuthor = {
      id: newAuthor.КодАвтора,
      firstName: newAuthor.Имя,
      lastName: newAuthor.Фамилия,
      fullName: `${newAuthor.Имя} ${newAuthor.Фамилия}`.trim(),
      biography: newAuthor.Биография
    };
    res.status(201).json(formattedAuthor);
  } catch (error) {
    console.error('Ошибка при создании автора:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновить автора
const updateAuthor = async (req, res) => {
  try {
    const { firstName, lastName, biography } = req.body;
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Автор не найден' });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Имя и фамилия автора обязательны' });
    }
    await author.update({
      Имя: firstName,
      Фамилия: lastName,
      Биография: biography || null
    });
    const formattedAuthor = {
      id: author.КодАвтора,
      firstName: author.Имя,
      lastName: author.Фамилия,
      fullName: `${author.Имя} ${author.Фамилия}`.trim(),
      biography: author.Биография
    };
    res.json(formattedAuthor);
  } catch (error) {
    console.error('Ошибка при обновлении автора:', error);
    res.status(500).json({ message: error.message });
  }
};

// Удалить автора
const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Автор не найден' });
    }
    await author.destroy();
    res.json({ message: 'Автор успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении автора:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
}; 