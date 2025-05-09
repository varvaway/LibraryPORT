const jwt = require('jsonwebtoken');
const { User } = require('../models');

const userAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);

    if (!user || user.Роль !== 'Администратор') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
};

module.exports = {
  userAuth,
  adminAuth
};