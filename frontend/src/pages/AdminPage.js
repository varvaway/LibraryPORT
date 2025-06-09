import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #442727;
  font-size: 2em;
  margin-bottom: 1.5rem;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;

  p {
    margin: 0.3rem 0;
    font-size: 1.5em;
    color: #6b4423;
  }

  button {
    margin-top: 15px;
    font-size: 1em;
    padding: 8px 20px;
  }
`;

const EditableField = styled.div`
  margin: 8px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1.5em;
    color: #6b4423;
    text-align: center;
    background: transparent;

    &:focus {
      outline: none;
      border-color: #6b4423;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 6px 14px;
  background: ${props => props.$primary ? '#442727' : '#fff'};
  color: ${props => props.$primary ? '#fff' : '#442727'};
  border: 1px solid #442727;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#5a3434' : '#f9f9f9'};
    transform: translateY(-1px);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 1000;
`;

const Dialog = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  h3 {
    color: #6b4423;
    margin-bottom: 20px;
    font-size: 1.5em;
  }

  div {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 25px;
  }

  button {
    padding: 10px 25px;
    font-size: 1.1em;
  }
`;

const AdminPanelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 1rem;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 30px auto;
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const PanelItem = styled.div`
  background: #ffebcd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  h2 {
    color: #442727;
    margin-bottom: 0.8rem;
    font-size: 1.4em;
  }

  p {
    color: #442727;
    margin: 0;
    font-size: 1em;
    text-align: center;
  }

  &:hover {
    transform: translateY(-3px);
  }
`;

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get('/api/auth/profile');
        console.log('Profile response:', response.data);
        if (response.data.success) {
          setUser({
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            role: response.data.user.role
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleEditClick = () => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(null);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    try {
      const response = await axios.put('/api/auth/profile', {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email
      });
      
      if (response.data.success) {
        setUser(editedUser);
        setIsEditing(false);
        setShowConfirmation(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
      }
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  if (!user) {
    return (
      <Container $dimmed={false}>
        Загрузка...
      </Container>
    );
  }

  return (
    <>
      <Container $dimmed={showSuccessMessage || showConfirmation}>
        <Title>Панель администратора</Title>

        <ProfileInfo>
          {!isEditing ? (
            <>
              <p>{user.firstName} {user.lastName}</p>
              <p>{user.email}</p>
              <Button $primary onClick={handleEditClick}>Редактировать профиль</Button>
            </>
          ) : (
            <>
              <EditableField>
                <input
                  type="text"
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  placeholder="Имя"
                />
              </EditableField>
              <EditableField>
                <input
                  type="text"
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  placeholder="Фамилия"
                />
              </EditableField>
              <EditableField>
                <input
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </EditableField>
              <ButtonGroup>
                <Button $primary onClick={handleSaveChanges}>Сохранить</Button>
                <Button onClick={handleCancelEdit}>Отменить</Button>
              </ButtonGroup>
            </>
          )}
        </ProfileInfo>

        <AdminPanelGrid>
          <PanelItem onClick={() => navigate('/admin/readers')}>
            <h2>Читатели</h2>
            <p>Управление читателями библиотеки</p>
          </PanelItem>
          <PanelItem onClick={() => navigate('/admin/books')}>
            <h2>Книги</h2>
            <p>Управление книжным фондом</p>
          </PanelItem>
          <PanelItem onClick={() => navigate('/admin/reservations')}>
            <h2>Бронирования</h2>
            <p>Управление бронированиями книг</p>
          </PanelItem>
          <PanelItem onClick={() => navigate('/admin/multimedia')}>
            <h2>Мультимедиа</h2>
            <p>Управление мультимедийными ресурсами</p>
          </PanelItem>
          <PanelItem onClick={() => navigate('/admin/categories')}>
            <h2>Категории</h2>
            <p>Управление категориями для книг</p>
          </PanelItem>
          <PanelItem onClick={() => navigate('/admin/authors')}>
            <h2>Авторы</h2>
            <p>Управление авторами</p>
          </PanelItem>
        </AdminPanelGrid>
      </Container>

      {showConfirmation && (
        <Overlay>
          <Dialog>
            <h3>Подтвердите действие</h3>
            <p>Вы уверены, что хотите сохранить изменения?</p>
            <div>
              <Button style={{ background: 'white', color: '#442727', borderColor: 'white' }} onClick={handleConfirmSave}>Да</Button>
              <Button style={{ background: '#442727', color: 'white', borderColor: '#442727' }} onClick={() => setShowConfirmation(false)}>Нет</Button>
            </div>
          </Dialog>
        </Overlay>
      )}

      {showSuccessMessage && (
        <Overlay>
          <Dialog>
            <h3>Успешно!</h3>
            <p>Изменения успешно сохранены</p>
            <Button onClick={() => setShowSuccessMessage(false)}>OK</Button>
          </Dialog>
        </Overlay>
      )}
    </>
  );
};

export default AdminPage;
