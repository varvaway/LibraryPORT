const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3001;

console.log('Пытаемся подключиться к базе данных...');
console.log('Параметры подключения:', {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  instance: process.env.DB_INSTANCE
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено успешно!');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка при подключении к базе данных:');
    console.error('Сообщение:', err.message);
    console.error('Полная ошибка:', err);
    process.exit(1);
  });