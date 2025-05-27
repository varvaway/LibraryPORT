import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: #6b4423;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    background: #8b5e3c;
  }
`;

const ReaderInfo = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    color: #6b4423;
    margin-bottom: 15px;
  }

  p {
    margin: 8px 0;
    font-size: 16px;
  }
`;

const ReservationsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }

  tr:hover {
    background-color: #f9f9f9;
  }
`;

const ReaderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reader, setReader] = useState(null);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const loadReaderDetails = async () => {
      try {
        const response = await axios.get(`/api/readers/${id}`);
        if (response.data.success) {
          const { reader: readerData, reservations: reservationsData } = response.data;
          setReader({
            id: readerData.КодПользователя,
            firstName: readerData.Имя,
            lastName: readerData.Фамилия,
            email: readerData.ЭлектроннаяПочта,
            phone: readerData.Телефон
          });
          setReservations(reservationsData.map(res => ({
            id: res.КодБронирования,
            startDate: new Date(res.ДатаНачала).toLocaleDateString(),
            endDate: new Date(res.ДатаОкончания).toLocaleDateString(),
            status: res.Статус,
            bookTitle: res.Book.Название,
            bookAuthor: res.Book.Автор
          })));
        }
      } catch (error) {
        console.error('Ошибка при загрузке информации о читателе:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      }
    };

    loadReaderDetails();
  }, [id, navigate]);

  if (!reader) {
    return <Container>Загрузка...</Container>;
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/readers')}>← Назад к списку</BackButton>
      
      <Title>Информация о читателе</Title>
      
      <ReaderInfo>
        <h2>{reader.lastName} {reader.firstName}</h2>
        <p><strong>Email:</strong> {reader.email}</p>
        <p><strong>Телефон:</strong> {reader.phone}</p>
      </ReaderInfo>

      <h2>Бронирования книг</h2>
      <ReservationsTable>
        <thead>
          <tr>
            <th>Книга</th>
            <th>Автор</th>
            <th>Дата начала</th>
            <th>Дата окончания</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.bookTitle}</td>
              <td>{reservation.bookAuthor}</td>
              <td>{reservation.startDate}</td>
              <td>{reservation.endDate}</td>
              <td>{reservation.status}</td>
            </tr>
          ))}
          {reservations.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                Нет активных бронирований
              </td>
            </tr>
          )}
        </tbody>
      </ReservationsTable>
    </Container>
  );
};

export default ReaderDetailsPage;
