const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Маршруты
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const readerRequestRoutes = require('./routes/readerRequest');
const reservationsRoutes = require('./routes/reservations');
const multimediaRoutes = require('./routes/multimedia');
const readersRoutes = require('./routes/readers');
const usersRoutes = require('./routes/users');

// Создаем приложение
const app = express();

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reader-requests', readerRequestRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/readers', readersRoutes);
app.use('/api/users', usersRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  
  // Если это ошибка Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  // Если это ошибка авторизации
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Необходима авторизация'
    });
  }

  // Если это ошибка авторизации из JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Неверный токен'
    });
  }

  // Общая обработка ошибок
  console.error('Ошибка:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Ошибка сервера. Пожалуйста, попробуйте позже.'
  });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Запрошенный ресурс не найден'
  });
});

// Улучшенная обработка ошибок в процессе
process.on('unhandledRejection', (error) => {
  console.error('Необработанное отклонение:', error);
  console.error('Стек ошибки:', error.stack);
});

process.on('uncaughtException', (error) => {
  console.error('Необработанная ошибка:', error);
  console.error('Стек ошибки:', error.stack);
});

// Улучшенная обработка ошибок в Express
app.use((err, req, res, next) => {
  if (err) {
    console.error('Ошибка в Express:', err);
    console.error('Стек ошибки:', err.stack);
  }
  next(err);
});

module.exports = app;