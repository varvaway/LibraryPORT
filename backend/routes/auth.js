const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Фейковый пользователь
const fakeUser = {
  КодПользователя: 1,
  Имя: 'Варвара',
  Фамилия: 'Кнороз',
  Роль: 'Администратор',
  ХэшПароля: 'wiwiwi'
};

// Вход пользователя
router.post('/login', (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    console.log('Попытка входа:', { firstName, lastName });

    // Проверяем данные фейкового пользователя
    if (firstName !== fakeUser.Имя || lastName !== fakeUser.Фамилия) {
      console.log('Пользователь не найден');
      return res.status(401).json({ message: 'Неверное имя, фамилия или пароль' });
    }

    if (password !== fakeUser.ХэшПароля) {
      console.log('Неверный пароль');
      return res.status(401).json({ message: 'Неверное имя, фамилия или пароль' });
    }

    // Создаем токен
    const token = jwt.sign(
      { id: fakeUser.КодПользователя },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Успешный вход');

    res.json({
      token,
      user: {
        id: fakeUser.КодПользователя,
        name: fakeUser.Имя,
        surname: fakeUser.Фамилия,
        role: fakeUser.Роль
      }
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;