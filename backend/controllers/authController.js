const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

exports.login = async (req, res) => {
  const { firstName, lastName, password } = req.body;

  try {
    // 1. Поиск пользователя
    const user = await User.findOne({
      where: {
        Имя: firstName,
        Фамилия: lastName
      }
    });

    // 2. Проверка существования пользователя
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Пользователь не найден' 
      });
    }

    // 3. Проверка пароля
    if (!user.validPassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Неверный пароль'
      });
    }

    // 4. Генерация токена
    const token = jwt.sign(
      {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Отправка успешного ответа
    res.json({
      success: true,
      token: 'Bearer ' + token,
      user: {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия
      }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};