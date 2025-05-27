const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const db = require('./models');

// Инициализация базы данных
sequelize.authenticate()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено успешно! Ура!');
  })
  .catch(err => {
    console.error('❌ Ошибка при подключении к базе данных:');
    console.error('Сообщение:', err.message);
    console.error('Полная ошибка:', err);
    process.exit(1);
  });

// Порт сервера
const PORT = process.env.PORT || 3001;


const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const readerRequestRoutes = require('./routes/readerRequest');
const reservationsRoutes = require('./routes/reservations');
const multimediaRoutes = require('./routes/multimedia');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

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


// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err.message);
  console.error('Стек ошибки:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});



module.exports = app;