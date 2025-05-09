const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = 'supersecretkey'; // Для продакшена вынести в .env

exports.login = async (req, res) => {
  const { firstName, lastName, password } = req.body;
  try {
    console.log('Попытка входа:', { firstName, lastName });
    const user = await User.findOne({ 
      where: { 
        Имя: firstName,
        Фамилия: lastName
      } 
    });
    
    if (!user) {
      console.log('Пользователь не найден');
      return res.status(401).json({ message: 'Неверные данные' });
    }
    
    // Упрощенная проверка пароля
    if (password !== user.ХэшПароля) {
      console.log('Неверный пароль');
      return res.status(401).json({ message: 'Неверные данные' });
    }
    
    const token = jwt.sign({ id: user.КодПользователя, role: user.Роль }, JWT_SECRET, { expiresIn: '7d' });
    
    const userData = {
      id: user.КодПользователя,
      firstName: user.Имя,
      lastName: user.Фамилия,
      role: user.Роль
    };
    
    console.log('Успешный вход:', userData);
    
    res.json({ 
      token,
      user: userData
    });
  } catch (e) {
    console.error('Ошибка при входе:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({
      id: user.КодПользователя,
      name: user.Имя,
      surname: user.Фамилия,
      email: user.ЭлектроннаяПочта,
      role: user.Роль
    });
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, surname, email } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Обновляем данные
    await user.update({
      Имя: name,
      Фамилия: surname,
      ЭлектроннаяПочта: email
    });
    
    // Возвращаем обновленные данные
    res.json({
      id: user.КодПользователя,
      name: user.Имя,
      surname: user.Фамилия,
      email: user.ЭлектроннаяПочта,
      role: user.Роль
    });
  } catch (e) {
    console.error('Ошибка при обновлении профиля:', e);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
};