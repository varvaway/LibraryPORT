import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  transition: all 0.3s;
  
  ${({ $dimmed }) => $dimmed && `
    filter: blur(3px);
    opacity: 0.3;
    pointer-events: none;
  `}
`;

const Title = styled.h1`
  text-align: center;
  color: #6b4423;
  font-size: 2.5em;
  margin-bottom: 2rem;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;

  p {
    margin: 0.5rem 0;
    font-size: 2em;
    color: #6b4423;
  }

  button {
    margin-top: 25px;
    font-size: 1.1em;
    padding: 12px 24px;
  }
`;

const EditableField = styled.div`
  margin: 12px 0;
  
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 2em;
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
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: ${props => props.$primary ? '#6b4423' : '#fff'};
  color: ${props => props.$primary ? '#fff' : '#6b4423'};
  border: 1px solid #6b4423;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => props.$primary ? '#8b5e3c' : '#f9f9f9'};
  }
`;

const ReservationsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 3rem;
`;

const ReservationSection = styled.div`
  background: #ffebcd;
  border-radius: 8px;
  padding: 2rem;

  h2 {
    color: #6b4423;
    font-size: 1.8em;
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReservationItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    color: #6b4423;
    font-size: 1.4em;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin: 0.3rem 0;
    font-size: 1.1em;
  }

  .dates {
    color: #8b5e3c;
    font-style: italic;
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

const ReaderProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentReservations, setCurrentReservations] = useState([]);
  const [pastReservations, setPastReservations] = useState([]);

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      if (response.data.success) {
        const userData = {
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email
        };
        setUser(userData);
        setEditedUser(userData);
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  }, [navigate, setUser, setEditedUser]);

  const loadReservations = useCallback(async () => {
    try {
      const response = await axios.get('/api/bookings/reader');
      if (response.data.success) {
        const now = new Date();
        const current = [];
        const past = [];

        response.data.bookings.forEach(booking => {
          const bookingDate = new Date(booking.date);
          if (booking.status === 'Активно') {
            current.push(booking);
          } else {
            past.push(booking);
          }
        });

        setCurrentReservations(current);
        setPastReservations(past);
      }
    } catch (error) {
      console.error('Ошибка при загрузке резервирований:', error);
    }
  }, [setCurrentReservations, setPastReservations]);

  useEffect(() => {
    loadUserProfile();
    loadReservations();
  }, [loadUserProfile, loadReservations]);

  const handleEditClick = useCallback(() => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      setIsEditing(true);
    }
  }, [user, setEditedUser, setIsEditing]);

  const handleCancelEdit = useCallback(() => {
    setEditedUser(null);
    setIsEditing(false);
  }, [setEditedUser, setIsEditing]);

  const handleInputChange = useCallback((e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  }, [editedUser, setEditedUser]);

  const handleSaveChanges = useCallback(() => {
    setShowConfirmation(true);
  }, [setShowConfirmation]);

  const handleConfirmSave = useCallback(async () => {
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
  }, [editedUser, navigate, setUser, setIsEditing, setShowConfirmation, setShowSuccessMessage]);


  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  }, []);

  if (!user) {
    return (
      <Container $dimmed={false}>
        <div style={{ textAlign: 'center', fontSize: '1.5em', color: '#6b4423', padding: '2rem' }}>
          Загрузка...
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container $dimmed={showSuccessMessage || showConfirmation}>
        <Title>Личный кабинет</Title>

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

        <ReservationsGrid>
          <ReservationSection>
            <h2>Активные бронирования</h2>
            <ReservationList>
              {currentReservations.map(reservation => (
                <ReservationItem key={reservation._id}>
                  <h3>Бронирование #{reservation._id}</h3>
                  <p>Статус: {reservation.status}</p>
                  <p className="dates">
                    Дата: {formatDate(reservation.date)}
                  </p>
                </ReservationItem>
              ))}
              {currentReservations.length === 0 && (
                <p>У вас нет активных бронирований</p>
              )}
            </ReservationList>
          </ReservationSection>

          <ReservationSection>
            <h2>История бронирований</h2>
            <ReservationList>
              {pastReservations.map(reservation => (
                <ReservationItem key={reservation._id}>
                  <h3>Бронирование #{reservation._id}</h3>
                  <p>Статус: {reservation.status}</p>
                  <p className="dates">
                    Дата: {formatDate(reservation.date)}
                  </p>
                </ReservationItem>
              ))}
              {pastReservations.length === 0 && (
                <p>У вас нет истории бронирований</p>
              )}
            </ReservationList>
          </ReservationSection>
        </ReservationsGrid>
      </Container>

      {showConfirmation && (
        <Overlay>
          <Dialog>
            <h3>Подтвердите действие</h3>
            <p>Вы уверены, что хотите сохранить изменения?</p>
            <div>
              <Button $primary onClick={handleConfirmSave}>Да</Button>
              <Button onClick={() => setShowConfirmation(false)}>Нет</Button>
            </div>
          </Dialog>
        </Overlay>
      )}

      {showSuccessMessage && (
        <Overlay>
          <Dialog>
            <h3>Успешно!</h3>
            <p>Изменения успешно сохранены</p>
            <div>
              <Button $primary onClick={() => setShowSuccessMessage(false)}>OK</Button>
            </div>
          </Dialog>
        </Overlay>
      )}
    </>
  );
};

export default ReaderProfilePage;
