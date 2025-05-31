const jwt = require('jsonwebtoken');
const { User } = require('../models');

const userAuth = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
      console.log('Отсутствует заголовок Authorization');
      return res.status(401).json({
        success: false,
        message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token);

    if (!token) {
      console.log('Токен пустой после обработки');
      return res.status(401).json({
        success: false,
        message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
      });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);

    // Ищем пользователя
    const user = await User.findByPk(decoded.id);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Пользователь не найден в базе');
      return res.status(401).json({
        success: false,
        message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
      });
    }

    // Добавляем пользователя в запрос
    req.user = {
      id: user.КодПользователя,
      firstName: user.Имя,
      lastName: user.Фамилия,
      email: user.ЭлектроннаяПочта,
      role: user.Роль
    };
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({
      success: false,
      message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.header('Authorization');
    console.log('Admin auth header:', authHeader);
    
    if (!authHeader) {
      console.log('Отсутствует заголовок Authorization');
      return res.status(401).json({
        success: false,
        message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted admin token:', token);

    if (!token) {
      console.log('Токен пустой после обработки');
      return res.status(401).json({
        success: false,
        message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
      });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded admin token:', decoded);

    // Ищем пользователя
    const user = await User.findByPk(decoded.id);
    console.log('Found admin:', user ? 'Yes' : 'No');

    if (!user || user.Роль !== 'Администратор') {
      console.log('Пользователь не является администратором:', user?.Роль);
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Добавляем пользователя в запрос
    req.user = {
      id: user.КодПользователя,
      firstName: user.Имя,
      lastName: user.Фамилия,
      email: user.ЭлектроннаяПочта,
      role: user.Роль
    };
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации администратора:', error);
    res.status(401).json({
      success: false,
      message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
    });
  }
};

module.exports = {
  userAuth,
  adminAuth
};