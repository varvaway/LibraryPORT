import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Controls = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const ReadersContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ReadersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
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
    cursor: pointer;
  }
`;

const ReadersPage = () => {
  const navigate = useNavigate();
  const [readers, setReaders] = useState([]);
  const [sortField, setSortField] = useState('lastName');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReaders = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/readers');
        if (response.data.success) {
          setReaders(response.data.readers.map(reader => ({
            id: reader.КодПользователя,
            firstName: reader.Имя,
            lastName: reader.Фамилия,
            email: reader.ЭлектроннаяПочта,
            phone: reader.Телефон
          })));
        }
      } catch (error) {
        console.error('Ошибка при загрузке читателей:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    loadReaders();
  }, [navigate]);

  const sortedReaders = readers.sort((a, b) => {
    if (sortField === 'lastName') {
      return a.lastName.localeCompare(b.lastName);
    } else if (sortField === 'firstName') {
      return a.firstName.localeCompare(b.firstName);
    }
  });

  const handleReaderClick = (id) => {
    navigate(`/reader/${id}`);
  };

  if (loading) {
    return (
      <Container>
        <Title>Загрузка...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Читатели</Title>
      
      <Controls>
        <span>Сортировать по:</span>
        <Select value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="lastName">Фамилии</option>
          <option value="firstName">Имени</option>
        </Select>
      </Controls>

      <ReadersContainer>
        <ReadersTable>
          <thead>
            <tr>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
            </tr>
          </thead>
          <tbody>
            {sortedReaders.map((reader) => (
              <tr key={reader.id} onClick={() => handleReaderClick(reader.id)}>
                <td>{reader.lastName}</td>
                <td>{reader.firstName}</td>
                <td>{reader.email}</td>
                <td>{reader.phone}</td>
              </tr>
            ))}
            {sortedReaders.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  Читатели не найдены
                </td>
              </tr>
            )}
          </tbody>
        </ReadersTable>
      </ReadersContainer>
    </Container>
  );
};

export default ReadersPage;
