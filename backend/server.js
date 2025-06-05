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
  })
  .catch(err => {
    console.error('❌ Ошибка при подключении к базе данных:');
    console.error('Сообщение:', err.message);
    console.error('Полная ошибка:', err);
    // Продолжаем работу, не выходим из процесса
  });

// Обработка ошибок Express
app.use((err, req, res, next) => {
  console.error('❌ Ошибка Express:', err);
  res.status(500).json({
    success: false,
    message: 'Ошибка сервера'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  if (sequelize.options.logging !== false) {
    console.log('⚠️ Работает с ошибкой подключения к базе данных');
  }
});