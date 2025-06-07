const nodemailer = require('nodemailer');

// Константы для рабочих часов
const WORK_HOURS = {
  weekdays: { 
    start: 12, 
    end: 20,
    responseTime: 14  // В будни ответ до 14:00
  },
  saturday: { 
    start: 11, 
    end: 19,
    responseTime: 15  // В субботу ответ до 15:00
  }
};

// Вспомогательные функции
const isSanitaryDay = (date) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lastThursday = lastDay.getDate() - ((lastDay.getDay() + 7 - 4) % 7);
  return date.getDate() === lastThursday;
};

const isWorkingHours = (date) => {
  const day = date.getDay();
  const hours = date.getHours();
  
  // Воскресенье или санитарный день
  if (day === 0 || isSanitaryDay(date)) return false;
  
  // Суббота
  if (day === 6) {
    return hours >= WORK_HOURS.saturday.start && hours < WORK_HOURS.saturday.end;
  }
  
  // Будни
  return hours >= WORK_HOURS.weekdays.start && hours < WORK_HOURS.weekdays.end;
};

const getNextWorkingDay = (date) => {
  const nextDay = new Date(date);
  
  do {
    nextDay.setDate(nextDay.getDate() + 1);
    // Пропускаем только воскресенье и санитарные дни
  } while (nextDay.getDay() === 0 || isSanitaryDay(nextDay));
  
  // Устанавливаем начало рабочего дня
  const dayType = nextDay.getDay() === 6 ? 'saturday' : 'weekdays';
  nextDay.setHours(WORK_HOURS[dayType].start, 0, 0, 0);
  
  return nextDay;
};

// Хранилище для последних заявок
const requestHistory = new Map();
// Время ожидания между заявками (в миллисекундах)
const COOLDOWN_TIME = 15 * 60 * 1000; // 15 минут

// Проверяем наличие переменных окружения
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('EMAIL_USER or EMAIL_PASS environment variables are not set. Emails will not be sent.');
}

// Создаем конфигурацию для отправки почты через Яндекс
let transporter = {
  sendMail: async (mailOptions) => {
    console.warn('Email sending is disabled (no SMTP config)');
    console.log('Mock email would be sent with options:', mailOptions);
    return { messageId: 'test-message-id-' + Date.now() };
  }
};

// Инициализируем SMTP
const initSmtp = async () => {
  console.log('Начало инициализации SMTP...');
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set. Using mock email sender.');
    return;
  }

  if (!process.env.EMAIL_USER) {
    console.warn('EMAIL_USER не установлен. Письма отправляться не будут.');
    return;
  }
  
  if (!process.env.EMAIL_PASS) {
    console.warn('EMAIL_PASS не установлен. Письма отправляться не будут.');
    return;
  }

  try {
    // Пробуем несколько вариантов подключения
    const smtpOptions = [
      // Вариант 1: SSL на порту 465
      {
        host: 'smtp.yandex.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false, // Пробуем отключить проверку сертификата
          minVersion: 'TLSv1.2'
        },
        debug: true,
        logger: true
      },
      // Вариант 2: STARTTLS на порту 587
      {
        host: 'smtp.yandex.com',
        port: 587,
        secure: false, // false для порта 587
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: true,
        logger: true
      },
      // Вариант 3: Без шифрования (только для тестирования)
      {
        host: 'smtp.yandex.com',
        port: 25,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        ignoreTLS: true,
        debug: true,
        logger: true
      }
    ];

    let lastError = null;
    
    // Пробуем подключиться по очереди каждым из вариантов
    for (const smtpConfig of smtpOptions) {
      try {
        console.log('Пробуем подключиться с настройками:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.auth.user
        });
        
        const testTransporter = nodemailer.createTransport(smtpConfig);
        await testTransporter.verify();
        
        console.log(`✅ Успешное подключение к ${smtpConfig.host}:${smtpConfig.port}`);
        return testTransporter;
      } catch (error) {
        lastError = error;
        console.error(`❌ Ошибка подключения к ${smtpConfig.host}:${smtpConfig.port}:`, error.message);
        // Продолжаем пробовать следующие настройки
      }
    }
    
    // Если ни один вариант не сработал, бросаем последнюю ошибку
    throw lastError;

    console.log('Попытка подключения к SMTP с настройками:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user
    });

    const smtpTransporter = nodemailer.createTransport(smtpConfig);
    
    // Проверяем соединение
    try {
      await smtpTransporter.verify();
      console.log('✅ SMTP подключение успешно установлено');
      transporter = smtpTransporter;
    } catch (verifyError) {
      console.error('❌ Ошибка проверки SMTP подключения:', verifyError);
      console.error('Будет использован моковый отправитель писем');
    }
  } catch (error) {
    console.error('❌ Ошибка при создании SMTP транспорта:', error);
    console.error('Будет использован моковый отправитель писем');
  }
};

// Глобальная переменная для транспорта
let smtpTransport = null;

// Инициализируем SMTP при старте
initSmtp().then(transport => {
  if (transport) {
    smtpTransport = transport;
    console.log('SMTP транспорт успешно инициализирован');
  } else {
    console.warn('SMTP транспорт не был инициализирован, используется моковый отправитель');
  }
}).catch(error => {
  console.error('Ошибка при инициализации SMTP транспорта:', error);
});

// Настройки для отправителя
const senderName = 'Юношеская библиотека им. А.П. Гайдара';

// Расчет времени ответа
function calculateResponseTime(requestTime) {
  const now = new Date(requestTime);
  const responseTime = new Date(now);
  
  if (isWorkingHours(now)) {
    // Если рабочее время - ответ в тот же день до конца рабочего дня
    if (now.getDay() === 6) { // Суббота
      responseTime.setHours(WORK_HOURS.saturday.end, 0, 0, 0);
    } else { // Будни
      responseTime.setHours(WORK_HOURS.weekdays.end, 0, 0, 0);
    }
  } else {
    // Если нерабочее время - ответ до 14:00 след. рабочего дня (15:00 в субботу)
    const nextDay = getNextWorkingDay(now);
    const isSaturday = nextDay.getDay() === 6;
    const dayType = isSaturday ? 'saturday' : 'weekdays';
    
    responseTime.setDate(nextDay.getDate());
    responseTime.setMonth(nextDay.getMonth());
    responseTime.setFullYear(nextDay.getFullYear());
    responseTime.setHours(
      WORK_HOURS[dayType].responseTime,
      0, 0, 0
    );
  }
  
  return responseTime;
}

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
  
  // Рассчитываем время ответа
  const responseTime = calculateResponseTime(now);
  
  // Форматируем время для отображения
  const formatTime = (date) => {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const requestTimeStr = formatTime(now);
  const responseTimeStr = formatTime(responseTime);
  
  // Проверяем, рабочее ли время
  const isWorkingTime = isWorkingHours(now);
  const dayNames = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
  const dayName = dayNames[responseTime.getDay()];
  
  // Формируем текст уведомления
  const notificationText = `Новая заявка на регистрацию читателя\n\n` +
    `ФИО: ${name}\n` +
    `Телефон: ${phone}\n` +
    `Время заявки: ${requestTimeStr}\n\n` +
    `Заявка получена ${isWorkingTime ? 'в рабочее время' : 'в нерабочее время'}.\n` +
    `Пожалуйста, свяжитесь с читателем до ${responseTimeStr} (${dayName}).`;

  try {
    // Формируем данные письма
    const mailOptions = {
      from: `"${senderName}" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `Новая заявка на регистрацию читателя от ${name}`,
      text: notificationText,
      html: `
        <h2>Новая заявка на регистрацию читателя</h2>
        <p><strong>ФИО:</strong> ${name}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Время заявки:</strong> ${now.toLocaleString('ru-RU')}</p>
        <p><strong>Статус:</strong> ${isWorkingTime ? 'В рабочее время' : 'В нерабочее время'}</p>
        <p style="color: red;"><strong>Пожалуйста, свяжитесь с читателем до ${responseTimeStr} (${dayName})</strong></p>
      `
    };

    // Логируем данные для отладки
    console.log('Sending email with data:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text
    });

    // Используем инициализированный транспорт или моковый отправитель
    const mailTransporter = smtpTransport || transporter;
    console.log('Используемый транспорт:', mailTransporter === smtpTransport ? 'SMTP' : 'моковый');

    // Отправляем email
    const mailResult = await mailTransporter.sendMail(mailOptions);

    console.log('Email sent successfully:', mailResult.messageId);

    return res.status(200).json({ 
      message: 'Заявка успешно отправлена',
      responseTime: responseTimeStr,
      responseTimestamp: responseTime.getTime(),
      isWorkingTime,
      dayName
    });
  } catch (e) {
    console.error('Ошибка при отправке email:', e);
    // Возвращаем успешный ответ, даже если не удалось отправить email
    // но логируем ошибку для отладки
    return res.status(200).json({
      message: 'Заявка принята, но возникли проблемы с отправкой уведомления',
      responseTime: responseTimeStr,
      responseTimestamp: responseTime.getTime(),
      isWorkingTime,
      dayName,
      warning: 'Не удалось отправить email уведомление'
    });
  }
};