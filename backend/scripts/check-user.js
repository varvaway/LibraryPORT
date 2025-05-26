const { User } = require('../models');

async function checkUser() {
  try {
    const user = await User.findOne({
      where: {
        Имя: 'Варвара',
        Фамилия: 'Кнороз'
      },
      raw: true
    });
    
    console.log('Результат поиска пользователя:', user);
  } catch (error) {
    console.error('Ошибка при поиске пользователя:', error);
  }
  process.exit();
}

checkUser();
