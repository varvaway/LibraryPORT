const nodemailer = require('nodemailer');

// Хранилище для последних заявок
const requestHistory = new Map();
// Время ожидания между заявками (в миллисекундах)
const COOLDOWN_TIME = 15 * 60 * 1000; // 15 минут

// Создаем конфигурацию для отправки почты через Яндекс
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true, // используем SSL
  auth: {
    user: process.env.EMAIL_USER || 'your-email@yandex.ru',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  },
  tls: {
    rejectUnauthorized: false, // для обхода ошибок сертификата
    minVersion: 'TLSv1.2'
  }
});

// Настройки для отправителя
const senderName = 'Юношеская библиотека им. А.П. Гайдара';

exports.sendReaderRequest = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Не указаны имя или телефон' });
  }

  // Проверка на повторную заявку
  const requestKey = `${name}-${phone}`;
  const lastRequestTime = requestHistory.get(requestKey);
  const now = new Date();
  const currentTimestamp = now.getTime();

  if (lastRequestTime && (currentTimestamp - lastRequestTime) < COOLDOWN_TIME) {
    const waitMinutes = Math.ceil((COOLDOWN_TIME - (currentTimestamp - lastRequestTime)) / 60000);
    return res.status(429).json({ 
      message: `Пожалуйста, подождите ${waitMinutes} минут перед отправкой новой заявки` 
    });
  }

  // Сохраняем время заявки
  requestHistory.set(requestKey, currentTimestamp);
  const dayOfWeek = now.getDay(); // 0 - воскресенье, 1-5 - пн-пт, 6 - суббота
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  let responseTime = new Date(now);
  
  // Функция установки времени на начало рабочего дня
  const setWorkDayStart = (date, isSaturday = false) => {
    date.setHours(isSaturday ? 11 : 12, 0, 0, 0);
    return date;
  };

  // Добавляем 4 часа к указанному времени
  const addResponseTime = (date) => {
    return new Date(date.getTime() + 3 * 60 * 60 * 1000);
  };

  if (dayOfWeek === 0) { // Воскресенье
    responseTime.setDate(responseTime.getDate() + 1); // Переходим на понедельник
    setWorkDayStart(responseTime);
    responseTime = addResponseTime(responseTime);
  } else if (dayOfWeek === 6) { // Суббота
    if (currentHour < 11) { // До начала рабочего дня
      setWorkDayStart(responseTime, true);
      responseTime = addResponseTime(responseTime);
    } else if (currentHour >= 19) { // После окончания рабочего дня
      responseTime.setDate(responseTime.getDate() + 2); // Переходим на понедельник
      setWorkDayStart(responseTime);
      responseTime = addResponseTime(responseTime);
    } else { // В течение рабочего дня
      responseTime = addResponseTime(now);
    }
  } else { // Понедельник - пятница
    if (currentHour < 12) { // До начала рабочего дня
      setWorkDayStart(responseTime);
      responseTime = addResponseTime(responseTime);
    } else if (currentHour >= 20) { // После окончания рабочего дня
      responseTime.setDate(responseTime.getDate() + 1);
      setWorkDayStart(responseTime);
      responseTime = addResponseTime(responseTime);
    } else { // В течение рабочего дня
      responseTime = addResponseTime(now);
    }
  }

  const formattedTime = responseTime.toLocaleString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  try {
    await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER || 'your-email@yandex.ru'}>`,
      to: process.env.EMAIL_TO || 'your-email@yandex.ru',
      subject: 'Новая заявка на регистрацию читателя',
      html: `
        <h2>Новая заявка на регистрацию читателя</h2>
        <p><strong>ФИО:</strong> ${name}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Время заявки:</strong> ${now.toLocaleString('ru-RU')}</p>
        <p style="color: red;"><strong>Пожалуйста, свяжитесь с читателем до ${formattedTime}</strong></p>
      `
    });

    res.json({ 
      message: 'Заявка успешно отправлена',
      responseTime: formattedTime
    });
  } catch (e) {
    console.error('Ошибка:', e);
    res.status(500).json({ message: 'Произошла ошибка при отправке заявки' });
  }
};