import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик запросов
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Отправка запроса:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log('Получен ответ:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Ошибка ответа:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default instance;
