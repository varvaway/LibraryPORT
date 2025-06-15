import React, { useState } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  line-height: 1;
  
  &:hover {
    color: #333;
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.mahogany};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.8rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.75rem 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1.1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1.5rem;
  background: ${props => props.disabled ? '#ccc' : props.theme.colors.mahogany};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1.2rem;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.disabled ? '#ccc' : props.theme.colors.darkMahogany};
  }
`;

const LoginModal = ({ isOpen, onClose, theme }) => {
  const navigate = useNavigate();
  console.log('Navigate function:', navigate); // Проверяем, что navigate определен
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: ''
  });

  const isFormValid = formData.firstName && formData.lastName && formData.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', formData);
      const { token, user } = response.data;
      
      console.log('Полученные данные пользователя:', user);
      
      // Сохраняем данные пользователя
      // Убираем префикс 'Bearer ' из токена при сохранении
      const cleanToken = token.replace('Bearer ', '');
      localStorage.setItem('token', cleanToken);
      
      // Нормализуем данные пользователя
      const normalizedUser = {
        ...user,
        name: user.firstName,
        surname: user.lastName,
        role: user.role || 'Читатель'
      };
      
      console.log('Сохраняемая роль:', normalizedUser.role);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      // Закрываем модальное окно ПЕРЕД навигацией
      onClose();

      // Перенаправляем пользователя в зависимости от роли
      console.log('Попытка перенаправления:', normalizedUser.role);

      // Добавляем небольшую задержку для гарантии сохранения данных - УДАЛЕНО
      // setTimeout(() => {
        if (normalizedUser.role === 'Администратор') {
          console.log('Перенаправление на /admin');
          navigate('/admin');
        } else if (normalizedUser.role === 'Читатель' || normalizedUser.role === 'Пользователь') {
          console.log('Перенаправление на /profile');
          navigate('/profile');
        } else {
          console.log('Неизвестная роль, перенаправление на /');
          navigate('/');
        }
        // Закрываем модальное окно после навигации - УДАЛЕНО
        // onClose();
      // }, 100);

      // Закрываем модальное окно будет выполнено в предыдущем setTimeout - УДАЛЕНО
      //

    } catch (error) {
      console.error('Ошибка при входе:', error);
      const message = error.response?.data?.message;
      
      if (message === 'Неверный пароль') {
        toast.error('Неверный пароль. Пожалуйста, проверьте введенные данные.');
      } else if (message === 'Пользователь не найден') {
        toast.error('Пользователь с такими именем и фамилией не найден.');
      } else {
        const errorMessage = error.response?.data?.message || 'Произошла ошибка при входе. Пожалуйста, попробуйте снова.';
        toast.error(errorMessage);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Вход в аккаунт</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="firstName"
            placeholder="Имя"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="lastName"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit" disabled={!isFormValid}>
            Войти
          </Button>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LoginModal;
