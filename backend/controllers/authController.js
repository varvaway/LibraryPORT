const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config();

exports.login = async (req, res) => {
  console.log('=== Начало процесса входа ===');
  console.log('Тело запроса:', req.body);
  console.log('Атрибуты модели User:', Object.keys(User.rawAttributes));
  console.log('Поля в базе:', User.rawAttributes);
  const { firstName, lastName, password } = req.body;

  try {
    // наличие всех необходимых полей
    console.log('Проверка полей:', { firstName, lastName, hasPassword: !!password });
    if (!firstName || !lastName || !password) {
      console.log('Ошибка: Отсутствуют обязательные поля');
      return res.status(400).json({
        success: false,
        message: 'Все поля обязательны для заполнения'
      });
    }

    //  Поиск пользователя
    console.log('Запрос на поиск пользователя:', { 'Имя': firstName, 'Фамилия': lastName });
    const user = await User.findOne({
      where: {
        Имя: firstName,
        Фамилия: lastName
      }
    });

    console.log('Результат поиска:', user ? 'Пользователь найден' : 'Пользователь не найден');
    if (user) {
      console.log('Данные пользователя:', {
        id: user.КодПользователя,
        'Имя': user.Имя,
        'Фамилия': user.Фамилия,
        'Роль': user.Роль,
        'ХэшПароля': user.ХэшПароля
      });
    }

    // Проверка существования пользователя
    if (!user) {
      console.log('Ошибка: Пользователь не найден');
      return res.status(401).json({ 
        success: false,
        message: 'Пользователь не найден' 
      });
    }

    // Проверка пароля
    console.log('Начинаем проверку пароля');
    console.log('Введенный пароль:', password, 'Длина:', password.length);
    console.log('Пароль в базе:', user.ХэшПароля, 'Длина:', user.ХэшПароля.length);
    console.log('Коды символов введенного пароля:', Array.from(password).map(c => c.charCodeAt(0)));
    console.log('Коды символов пароля в базе:', Array.from(user.ХэшПароля).map(c => c.charCodeAt(0)));
    
    // Прямое сравнение паролей, так как они не хешированы
    if (password !== user.ХэшПароля) {
      console.log('Ошибка: Неверный пароль');
      return res.status(401).json({
        success: false,
        message: 'Неверный пароль'
      });
    }

    // Генерация токена
    const token = jwt.sign(
      {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия,
        role: user.Роль
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Отправка успешного ответа
    res.json({
      success: true,
      token: 'Bearer ' + token,
      user: {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия,
        role: user.Роль
      }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    console.error('Детали ошибки:', {
      name: error.name,
      message: error.message,
      sql: error.sql,
      parameters: error.parameters,
      parent: error.parent ? {
        name: error.parent.name,
        message: error.parent.message,
        code: error.parent.code
      } : null
    });
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера: ' + error.message
    });
  }
};

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Проверка существования пользователя
    const existingUser = await User.findOne({
      where: {
        ЭлектроннаяПочта: email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с такой почтой уже существует'
      });
    }

    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создание нового пользователя
    const user = await User.create({
      Имя: firstName,
      Фамилия: lastName,
      ЭлектроннаяПочта: email,
      ХэшПароля: hashedPassword,
      Роль: 'читатель' // По умолчанию новый пользователь - читатель
    });

    const token = jwt.sign(
      {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия,
        role: user.Роль
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      token: 'Bearer ' + token,
      user: {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия,
        role: user.Роль
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия,
        email: user.ЭлектроннаяПочта,
        role: user.Роль,
        phone: user.Телефон
      }
    });
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Обновление данных
    await user.update({
      Имя: firstName || user.Имя,
      Фамилия: lastName || user.Фамилия,
      ЭлектроннаяПочта: email || user.ЭлектроннаяПочта,
      Телефон: phone || user.Телефон
    });

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: {
        id: user.КодПользователя,
        firstName: user.Имя,
        lastName: user.Фамилия,
        email: user.ЭлектроннаяПочта,
        role: user.Роль,
        phone: user.Телефон
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};