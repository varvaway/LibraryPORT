import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ReaderContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${({ $primary, theme }) => 
    $primary ? theme.colors.mahogany : 'transparent'};
  color: ${({ $primary, theme }) => 
    $primary ? 'white' : theme.colors.mahogany};
  border: 1px solid ${({ theme }) => theme.colors.mahogany};
  
  &:hover {
    background-color: ${({ $primary, theme }) => 
      $primary ? theme.colors.darkMahogany : theme.colors.lightMahogany};
    color: ${({ $primary }) => 
      $primary ? 'white' : 'white'};
  }
`;

const BooksSection = styled.div`
  margin-top: 2rem;
  flex: 1;
  padding: 0 1rem;
  
  h3 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
`;

const BooksContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: 1.1rem;
  text-align: center;
  margin-top: 2rem;
  font-style: italic;
`;

const BooksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BookCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h4 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin: 0.25rem 0;
    font-size: 1rem;
    
    &.status {
      color: ${({ theme }) => theme.colors.mahogany};
      font-weight: bold;
      margin-top: 0.5rem;
    }
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

const ReaderPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      // Получаем активные бронирования
      const currentResponse = await axios.get(`/api/reservations/reader/${user.id}`);
      const currentReservations = currentResponse.data.reservations.filter(
        reservation => reservation.Статус === 'Активно'
      );
      setCurrentBooks(currentReservations.map(reservation => ({
        id: reservation.КодБронирования,
        title: reservation.Книга.Название,
        author: reservation.Книга.Автор,
        reservationDate: reservation.ДатаНачала,
        returnDate: reservation.ДатаОкончания,
        status: reservation.Статус
      })));

      // Получаем историю бронирований
      const historyResponse = await axios.get(`/api/reservations/reader/${user.id}`);
      const historyReservations = historyResponse.data.reservations.filter(
        reservation => reservation.Статус === 'Завершено'
      );
      setHistoryBooks(historyReservations.map(reservation => ({
        id: reservation.КодБронирования,
        title: reservation.Книга.Название,
        author: reservation.Книга.Автор,
        reservationDate: reservation.ДатаНачала,
        returnDate: reservation.ДатаОкончания,
        status: reservation.Статус
      })));

      setError(null);
    } catch (error) {
      console.error('Ошибка при загрузке книг:', error);
      setError('Ошибка при загрузке книг');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`/api/readers/${storedUser.id}`);
        if (response.data.success) {
          const userData = response.data.reader;
          setUser(userData);
          setEditedUser(userData);
          loadBooks();
        } else {
          setError('Ошибка при загрузке профиля');
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        setError('Ошибка при загрузке профиля');
      }
    };
    checkAuthAndLoadProfile();
  }, []);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        try {
          const currentResponse = await axios.get('/api/reservations/current', { headers });
          setCurrentBooks(currentResponse.data);
        } catch (error) {
          if (error.response?.status === 404) {
            setCurrentBooks([]);
          } else {
            throw error;
          }
        }

        try {
          const historyResponse = await axios.get('/api/reservations/history', { headers });
          setHistoryBooks(historyResponse.data);
        } catch (error) {
          if (error.response?.status === 404) {
            setHistoryBooks([]);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
        setError('Ошибка при загрузке данных о бронированиях');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
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
      const response = await axios.put(`/api/readers/${user.id}`, {
        Имя: editedUser.name,
        Фамилия: editedUser.surname,
        ЭлектроннаяПочта: editedUser.email
      });

      if (response.data.success) {
        const updatedUser = {
          ...user,
          name: editedUser.name,
          surname: editedUser.surname,
          email: editedUser.email
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert('Ошибка при сохранении изменений');
      }
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
    <ReaderContainer>
      {showSuccess && (
        <Overlay>
          <SuccessMessage>
            Изменения успешно сохранены
          </SuccessMessage>
        </Overlay>
      )}
      
      {error && (
        <EmptyMessage style={{ color: theme.colors.mahogany }}>
          {error}
        </EmptyMessage>
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
              <Button $primary onClick={handleSaveChanges}>
                Сохранить изменения
              </Button>
              <Button onClick={handleCancelEdit}>
                Отменить
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <>
            <h2>{user.surname} {user.name}</h2>
            <p>{user.email}</p>
            <Button $primary onClick={handleEditProfile}>
              Редактировать профиль
            </Button>
          </>
        )}
      </UserInfo>

      {isLoading ? (
        <EmptyMessage>Загрузка данных...</EmptyMessage>
      ) : (
        <BooksContainer>
          <BooksSection>
            <h3>История броней</h3>
            {historyBooks.length > 0 ? (
              <BooksList>
                {historyBooks.map(book => (
                  <BookCard key={book.id}>
                    <h4>{book.title}</h4>
                    <p>Автор: {book.author}</p>
                    <p>Дата брони: {new Date(book.reservationDate).toLocaleDateString()}</p>
                    <p>Дата возврата: {new Date(book.returnDate).toLocaleDateString()}</p>
                    <p className="status">Статус: Возвращена</p>
                  </BookCard>
                ))}
              </BooksList>
            ) : (
              <EmptyMessage>У вас пока не было броней книг</EmptyMessage>
            )}
          </BooksSection>

          <BooksSection>
            <h3>Текущие брони</h3>
            {currentBooks.length > 0 ? (
              <BooksList>
                {currentBooks.map(book => (
                  <BookCard key={book.id}>
                    <h4>{book.title}</h4>
                    <p>Автор: {book.author}</p>
                    <p>Дата брони: {new Date(book.reservationDate).toLocaleDateString()}</p>
                    <p>Срок возврата: {new Date(book.returnDate).toLocaleDateString()}</p>
                    <p className="status">Статус: {book.status}</p>
                  </BookCard>
                ))}
              </BooksList>
            ) : (
              <EmptyMessage>У вас нет активных броней</EmptyMessage>
            )}
          </BooksSection>
        </BooksContainer>
      )}
    </ReaderContainer>
  );
};

export default ReaderPage;
