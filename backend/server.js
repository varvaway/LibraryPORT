const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3001;

// Подключение к базе данных и запуск сервера
sequelize.authenticate()
  .then(() => {
    console.log('Подключение к базе данных установлено успешно.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Модели синхронизированы с базой данных.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Ошибка при подключении к базе данных:', err);
  });
