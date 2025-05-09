import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Стили для модального окна
const PolicyModal = styled.div`
  position: fixed;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: ${({ $isVisible }) => ($isVisible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PolicyContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.mahogany};
`;

// Стили для формы
const FormWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  margin: 40px auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 500px;
`;

const FormTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.mahogany};
  font-size: 2.2rem;
  text-align: center;
  margin-bottom: 24px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  margin: 12px 0;
  border: 2px solid ${({ theme, $hasError }) => $hasError ? 'red' : theme.colors.lightCamel};
  border-radius: 8px;
  font-size: 1.2rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.mahogany};
  }
`;

const PhoneInput = styled(StyledInput).attrs({ type: 'tel' })``;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  font-size: 1.1rem;

  input {
    width: 20px;
    height: 20px;
  }

  span {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.colors.mahogany};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const DuplicateRequestModal = styled(PolicyModal)``;

const DuplicateRequestContent = styled(PolicyContent)`
  text-align: center;
  h3 {
    color: ${({ theme }) => theme.colors.mahogany};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.8rem;
    margin-bottom: 16px;
  }
  p {
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .time {
    color: ${({ theme }) => theme.colors.mahogany};
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const NotificationMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ $isSuccess }) => $isSuccess ? '#4caf50' : '#ff5252'};
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  max-width: 500px;
  line-height: 1.5;
  font-size: 1.2rem;
  font-weight: 500;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Форматирование телефонного номера
const formatPhoneNumber = (value) => {
  // Удаляем все не-цифры
  const numbers = value.replace(/[^\d]/g, '');
  // Берем только первые 11 цифр
  const digits = numbers.slice(0, 11);
  
  // Заполняем маску цифрами или подчеркиваниями
  const area = digits.slice(1, 4).padEnd(3, '_');
  const prefix = digits.slice(4, 7).padEnd(3, '_');
  const suffix1 = digits.slice(7, 9).padEnd(2, '_');
  const suffix2 = digits.slice(9, 11).padEnd(2, '_');
  
  // Собираем полный номер с маской
  return `8 (${area}) ${prefix}-${suffix1}-${suffix2}`;
};

export default function BecomeReaderForm() {
  // Начальное значение для телефона
  const initialPhone = '8 (___) ___-__-__';
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: initialPhone, 
    agreed: false 
  });

  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    agreed: false
  });

  const [notification, setNotification] = useState({
    message: '',
    success: false
  });
  
  const [showPolicy, setShowPolicy] = useState(false);
  const COOLDOWN_TIME = 15 * 60; // 15 минут в секундах
  const MAX_REQUESTS = 10; // Максимальное количество запоминаемых заявок

  const [duplicateRequest, setDuplicateRequest] = useState({ show: false, timeLeft: null });
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });

  // Проверка сохраненных заявок при загрузке
  useEffect(() => {
    const checkSavedRequests = () => {
      const savedRequests = JSON.parse(localStorage.getItem('readerRequests') || '{}');
      const currentTime = Date.now();

      // Удаляем заявки, у которых истек таймер
      Object.entries(savedRequests).forEach(([key, timestamp]) => {
        if (currentTime - timestamp >= COOLDOWN_TIME * 1000) {
          delete savedRequests[key];
        }
      });

      localStorage.setItem('readerRequests', JSON.stringify(savedRequests));
    };

    checkSavedRequests();
    const interval = setInterval(checkSavedRequests, 1000);
    return () => clearInterval(interval);
  }, []);

  // Проверка текущей заявки
  const checkRequestCooldown = (name, phone) => {
    const savedRequests = JSON.parse(localStorage.getItem('readerRequests') || '{}');
    const requestKey = `${name}-${phone}`;
    const lastRequest = savedRequests[requestKey];
    const currentTime = Date.now();

    if (lastRequest) {
      const timePassed = Math.floor((currentTime - lastRequest) / 1000);
      if (timePassed < COOLDOWN_TIME) {
        const timeLeft = COOLDOWN_TIME - timePassed;
        setDuplicateRequest({ show: true, timeLeft });
        setTimer({
          minutes: Math.floor(timeLeft / 60),
          seconds: timeLeft % 60
        });
        return true;
      }
    }
    return false;
  };

  // Сохранение новой заявки
  const saveRequest = (name, phone) => {
    const savedRequests = JSON.parse(localStorage.getItem('readerRequests') || '{}');
    const requestKey = `${name}-${phone}`;
    
    // Удаляем старые заявки, если превышен лимит
    const entries = Object.entries(savedRequests);
    if (entries.length >= MAX_REQUESTS) {
      const oldestRequest = entries.sort(([,a], [,b]) => a - b)[0][0];
      delete savedRequests[oldestRequest];
    }

    savedRequests[requestKey] = Date.now();
    localStorage.setItem('readerRequests', JSON.stringify(savedRequests));
  };

  // Обновление таймера
  useEffect(() => {
    let interval;
    if (duplicateRequest.timeLeft > 0) {
      interval = setInterval(() => {
        const minutes = Math.floor(duplicateRequest.timeLeft / 60);
        const seconds = duplicateRequest.timeLeft % 60;
        setTimer({ minutes, seconds });
        setDuplicateRequest(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (duplicateRequest.timeLeft === 0) {
      setDuplicateRequest({ show: false, timeLeft: null });
    }
    return () => clearInterval(interval);
  }, [duplicateRequest.timeLeft]);

  // Очистка уведомления через заданное время
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', success: false });
      }, notification.success ? 8000 : 6000); // 8 секунд для успеха, 6 для ошибки
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const validateName = (name) => {
    const words = name.trim().split(' ');
    const nameRegex = /^[А-ЯЁ][а-яё]+$/;
    return words.length === 2 && words.every(word => nameRegex.test(word));
  };

  const validatePhone = (phone) => {
    return phone.replace(/[^0-9]/g, '').length === 11;
  };

  const handlePhoneChange = (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const prevValue = formData.phone;
    const isDeleting = e.target.value.length < prevValue.length;

    // Получаем только цифры из введенного значения
    const numbers = e.target.value.replace(/[^\d]/g, '');
    const formattedPhone = formatPhoneNumber(numbers);
    setFormData({...formData, phone: formattedPhone});

    // Рассчитываем позицию курсора
    setTimeout(() => {
      let newPosition;
      if (isDeleting) {
        // При удалении перемещаем курсор на предыдущую цифру
        const prevNumberEndIndex = formattedPhone.slice(0, cursorPosition).replace(/[^\d]/g, '').length;
        let count = 0;
        newPosition = 0;
        
        // Находим позицию последней цифры перед курсором
        for (let i = 0; i < formattedPhone.length && count < prevNumberEndIndex; i++) {
          if (/\d/.test(formattedPhone[i])) {
            count++;
          }
          newPosition = i + 1;
        }
      } else {
        // При вводе ставим курсор на следующую позицию
        newPosition = formattedPhone.indexOf('_');
        if (newPosition === -1) newPosition = formattedPhone.length;
      }

      input.selectionStart = newPosition;
      input.selectionEnd = newPosition;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Сброс ошибок
    setErrors({
      name: false,
      phone: false,
      agreed: false
    });

    // Проверка полей
    if (!formData.name || !formData.phone || !formData.agreed) {
      setNotification({
        message: 'Пожалуйста, заполните все поля и примите условия',
        success: false
      });
      setErrors({
        name: !formData.name,
        phone: !formData.phone,
        agreed: !formData.agreed
      });
      return;
    }

    // Проверка формата имени
    if (!validateName(formData.name)) {
      setNotification({
        message: 'Введите Фамилию и Имя с заглавной буквы на русском языке',
        success: false
      });
      setErrors(prev => ({ ...prev, name: true }));
      return;
    }

    // Проверка формата телефона
    if (!validatePhone(formData.phone)) {
      setNotification({
        message: 'Введите корректный номер телефона',
        success: false
      });
      setErrors(prev => ({ ...prev, phone: true }));
      return;
    }

    // Проверяем, не было ли недавней заявки с такими же данными
    if (checkRequestCooldown(formData.name, formData.phone)) {
      return;
    }

    try {
      const response = await fetch('/api/reader-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем заявку в localStorage
        saveRequest(formData.name, formData.phone);

        // Очистка формы после успешной отправки
        setFormData({ name: '', phone: '', agreed: false });
        setNotification({
          message: `Ваша заявка успешно отправлена! Ожидайте звонка до ${data.responseTime}`,
          success: true
        });
      } else if (response.status === 429) {
        const minutes = parseInt(data.message.match(/\d+/)[0]);
        setDuplicateRequest({ 
          show: true, 
          timeLeft: minutes * 60
        });
        setTimer({ minutes, seconds: 0 });
      } else {
        throw new Error(data.message || 'Ошибка отправки');
      }
    } catch (error) {
      setNotification({
        message: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.',
        success: false
      });
    }
  };

  return (
    <FormWrapper>
      <FormTitle>Как стать читателем?</FormTitle>
      <form onSubmit={handleSubmit}>
        <StyledInput 
          placeholder="Фамилия и Имя" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          $hasError={errors.name}
        />
        <PhoneInput
          placeholder="Телефон" 
          value={formData.phone}
          onChange={handlePhoneChange}
          $hasError={errors.phone}
        />
        
        <CheckboxLabel>
          <input 
            type="checkbox" 
            checked={formData.agreed}
            onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
          />
          <span onClick={() => setShowPolicy(true)}>
            С условиями библиотеки ознакомлен(а)
          </span>
        </CheckboxLabel>

        <SubmitButton type="submit">Оставить заявку</SubmitButton>
      </form>

      {notification.message && (
        <NotificationMessage $isSuccess={notification.success}>
          {notification.message}
        </NotificationMessage>
      )}

      <PolicyModal $isVisible={showPolicy}>
        <PolicyContent>
          <CloseButton onClick={() => setShowPolicy(false)}>&times;</CloseButton>
          <h3>Политика конфиденциальности</h3>
          <p>Ваши персональные данные используются исключительно для обработки заявки 
          и не передаются третьим лицам. Нажимая кнопку "Оставить заявку", 
          вы соглашаетесь с условиями обработки персональных данных.</p>
        </PolicyContent>
      </PolicyModal>

      <DuplicateRequestModal $isVisible={duplicateRequest.show}>
        <DuplicateRequestContent>
          <CloseButton onClick={() => setDuplicateRequest({ show: false, timeLeft: null })}>&times;</CloseButton>
          <h3>Заявка уже отправлена</h3>
          <p>Мы уже получили вашу заявку и обязательно свяжемся с вами.</p>
          <p>Повторную заявку можно будет отправить через:</p>
          <p className="time">
            {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
          </p>
        </DuplicateRequestContent>
      </DuplicateRequestModal>
    </FormWrapper>
  );
}