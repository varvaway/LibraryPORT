const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/auth');

// Получение списка всех пользователей
router.get('/', auth.adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['КодПользователя', 'Фамилия', 'Имя', 'Роль', 'ЭлектроннаяПочта'],
      order: [['Фамилия', 'ASC']]
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получение пользователя по ID
router.get('/:id', auth.adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['КодПользователя', 'Фамилия', 'Имя', 'Роль', 'Email', 'ДатаРегистрации']
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Обновление пользователя
router.put('/:id', auth.adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    const { Фамилия, Имя, Email, Роль } = req.body;
    await user.update({ Фамилия, Имя, Email, Роль });
    res.json({ success: true, message: 'Пользователь успешно обновлен' });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Удаление пользователя
router.delete('/:id', auth.adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    await user.destroy();
    res.json({ success: true, message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
