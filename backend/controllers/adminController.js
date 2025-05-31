const { Reservation, Book, Author, Category, BookAuthor, BookCategory, ReservationItem, User } = require('../models');
const { Op } = require('sequelize');

// Все бронирования
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          attributes: ['КодПользователя', 'Имя', 'Фамилия'],
        },
        {
          model: Book,
          through: { attributes: [] },
          attributes: ['КодКниги', 'Название'],
          include: [
            {
              model: Author,
              through: { attributes: [] },
              attributes: ['Имя', 'Фамилия'],
            }
          ]
        }
      ],
      order: [['КодБронирования', 'ASC']]
    });

    const formatted = reservations.map(res => ({
      КодБронирования: res.КодБронирования,
      Пользователь: `${res.User.Имя} ${res.User.Фамилия}`,
      НазваниеКниги: res.Books[0]?.Название || '',
      Авторы: res.Books[0]?.Authors?.map(a => `${a.Имя} ${a.Фамилия}`).join(', ') || '',
      Дата: res.ДатаБронирования,
      Статус: res.Статус
    }));

    res.json({ success: true, reservations: formatted });
  } catch (e) {
    console.error('Ошибка при получении всех бронирований:', e);
    res.status(500).json({ success: false, message: 'Ошибка сервера', error: e.message });
  }
};

// Добавить книгу
exports.createBook = async (req, res) => {
  const { Название, Описание, ГодИздания, ISBN, Статус, authors, categories } = req.body;
  try {
    const book = await Book.create({ Название, Описание, ГодИздания, ISBN, Статус });
    if (Array.isArray(authors)) {
      await Promise.all(authors.map(КодАвтора => BookAuthor.create({ КодКниги: book.КодКниги, КодАвтора })));
    }
    if (Array.isArray(categories)) {
      await Promise.all(categories.map(КодКатегории => BookCategory.create({ КодКниги: book.КодКниги, КодКатегории })));
    }
    res.json(book);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Редактировать книгу
exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const { Название, Описание, ГодИздания, ISBN, Статус, authors, categories } = req.body;
  try {
    const book = await Book.findByPk(id);
    if (!book) return res.status(404).json({ message: 'Книга не найдена' });
    await book.update({ Название, Описание, ГодИздания, ISBN, Статус });
    if (Array.isArray(authors)) {
      await BookAuthor.destroy({ where: { КодКниги: id } });
      await Promise.all(authors.map(КодАвтора => BookAuthor.create({ КодКниги: id, КодАвтора })));
    }
    if (Array.isArray(categories)) {
      await BookCategory.destroy({ where: { КодКниги: id } });
      await Promise.all(categories.map(КодКатегории => BookCategory.create({ КодКниги: id, КодКатегории })));
    }
    res.json(book);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить книгу
exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    await BookAuthor.destroy({ where: { КодКниги: id } });
    await BookCategory.destroy({ where: { КодКниги: id } });
    await ReservationItem.destroy({ where: { КодКниги: id } });
    await Book.destroy({ where: { КодКниги: id } });
    res.json({ message: 'Книга удалена' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['КодПользователя', 'Имя', 'Фамилия', 'ЭлектроннаяПочта', 'Роль'] });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Добавить пользователя
exports.createUser = async (req, res) => {
  const { Имя, Фамилия, ЭлектроннаяПочта, ХэшПароля, Роль } = req.body;
  try {
    const exists = await User.findOne({ where: { ЭлектроннаяПочта } });
    if (exists) return res.status(400).json({ message: 'Пользователь с такой почтой уже существует' });
    const user = await User.create({ Имя, Фамилия, ЭлектроннаяПочта, ХэшПароля, Роль });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить пользователя
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { Имя, Фамилия, ЭлектроннаяПочта, ХэшПароля, Роль } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    await user.update({ Имя, Фамилия, ЭлектроннаяПочта, ХэшПароля, Роль });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить пользователя
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.destroy({ where: { КодПользователя: id } });
    res.json({ message: 'Пользователь удалён' });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 