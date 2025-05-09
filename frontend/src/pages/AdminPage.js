import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';

const AdminContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const UserInfo = styled.div`
  margin-bottom: 2rem;
  position: relative;
  
  h2 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: 1.1rem;
    margin: 0.25rem 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.mahogany};
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '✓';
    font-size: 1.4rem;
    font-weight: bold;
  }
`;

const EditableField = styled.div`
  margin: 0.5rem 0;
  
  label {
    display: block;
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  input {
    width: 100%;
    max-width: 300px;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.lightGray};
    border-radius: 4px;
    font-size: 1.1rem;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.mahogany};
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => props.primary && `
    background: ${props.theme.colors.mahogany};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.darkMahogany};
    }
  `}
  
  ${props => props.secondary && `
    background: white;
    color: ${props.theme.colors.mahogany};
    border: 1px solid ${props.theme.colors.mahogany};
    
    &:hover {
      background: ${props.theme.colors.lightGray};
    }
  `}
`;

const AdminPanelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const PanelItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  h3 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 1rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
  }
`;

const AdminPage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get('/api/auth/profile');
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
      }
    };
    
    loadUserProfile();
  }, []);
  
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  
  const handleEditProfile = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };
  
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/profile', editedUser, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedUser = response.data;
      
      // Обновляем данные в localStorage и состоянии
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      // Отправляем событие об обновлении пользователя
      window.dispatchEvent(new Event('userUpdated'));
      
      // Показываем сообщение об успехе
      setShowSuccess(true);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Ошибка при сохранении изменений');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <AdminContainer>
      {showSuccess && (
        <Overlay>
          <SuccessMessage>
            Изменения успешно сохранены
          </SuccessMessage>
        </Overlay>
      )}
      
      <UserInfo>
        {isEditing ? (
          <>
            <EditableField>
              <label>Имя</label>
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
              />
            </EditableField>
            <EditableField>
              <label>Фамилия</label>
              <input
                type="text"
                name="surname"
                value={editedUser.surname}
                onChange={handleInputChange}
              />
            </EditableField>
            <EditableField>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
              />
            </EditableField>
            <ButtonGroup>
              <Button primary onClick={handleSaveChanges}>
                Сохранить изменения
              </Button>
              <Button secondary onClick={handleCancelEdit}>
                Отменить
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <>
            <h2>{user.surname} {user.name}</h2>
            <p>{user.email}</p>
            <Button primary onClick={handleEditProfile}>
              Редактировать профиль
            </Button>
          </>
        )}
      </UserInfo>

      <AdminPanelGrid>
        <PanelItem>
          <h3>Читатели</h3>
          <p>Управление читателями, просмотр заявок на регистрацию</p>
        </PanelItem>
        
        <PanelItem>
          <h3>Книги</h3>
          <p>Управление книжным фондом библиотеки</p>
        </PanelItem>
        
        <PanelItem>
          <h3>Мультимедийные ресурсы</h3>
          <p>Управление электронными материалами</p>
        </PanelItem>
      </AdminPanelGrid>
    </AdminContainer>
  );
};

export default AdminPage;
