import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
export { axiosInstance };

// Добавляем перехватчик запросов
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Добавляем Bearer токен в заголовок Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логируем запрос
    console.log('Отправка запроса:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
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

    // Если ошибка 401 (Unauthorized), очищаем данные авторизации
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Вместо перезагрузки страницы просто возвращаем ошибку
      return Promise.reject({
        ...error,
        unauthorized: true
      });
    }

    return Promise.reject(error);
  }
);

