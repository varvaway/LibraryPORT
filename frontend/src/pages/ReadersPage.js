import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Table, TableContainer, PageHeader, Controls, SearchInput, ActionButton } from '../components/StyledTable';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const ReadersContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &.primary {
    background-color: #4CAF50;
    color: white;
    &:hover {
      background-color: #45a049;
    }
  }

  &.edit {
    background-color: #2196F3;
    color: white;
    margin-right: 8px;
    &:hover {
      background-color: #1976D2;
    }
  }

  &.delete {
    background-color: #f44336;
    color: white;
    &:hover {
      background-color: #d32f2f;
    }
  }

  &.export {
    background-color: ${({ theme }) => theme.colors.pistachioCream};
    color: black;
    &:hover {
      opacity: 0.9;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
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
  }

  .actions {
    width: 180px;
    text-align: right;
  }
`;

const ReadersPage = () => {
  const navigate = useNavigate();
  const [readers, setReaders] = useState([]);
  const [sortField, setSortField] = useState('lastName');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReader, setEditingReader] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [readerToDelete, setReaderToDelete] = useState(null);

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

  const handleExportExcel = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `выгрузка_читателей_от_${date}.xlsx`;
    setIsDropdownOpen(false);

    const data = filteredReaders.map(reader => ({
      'Фамилия': reader.lastName,
      'Имя': reader.firstName,
      'Email': reader.email,
      'Телефон': reader.phone
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Читатели');
    XLSX.writeFile(wb, fileName);
  };

  const handleExportWord = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `выгрузка_читателей_от_${date}.doc`;

    // Создаем таблицу в HTML формате
    let tableHtml = '<table style="width:100%; border-collapse: collapse;">';
    
    // Заголовки
    tableHtml += '<tr style="background-color: #f5f5f5;">';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Фамилия</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Имя</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Email</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Телефон</th>';
    tableHtml += '</tr>';

    // Данные
    filteredReaders.forEach(reader => {
      tableHtml += '<tr>';
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.lastName}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.firstName}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.email}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.phone}</td>`;
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';

    // Создаем документ для скачивания
    const blob = new Blob([tableHtml], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDropdownOpen(false);
  };

  const filteredReaders = readers.filter(reader => {
    const searchLower = searchQuery.toLowerCase();
    return (
      reader.lastName.toLowerCase().includes(searchLower) ||
      reader.firstName.toLowerCase().includes(searchLower) ||
      reader.email.toLowerCase().includes(searchLower) ||
      reader.phone.toLowerCase().includes(searchLower)
    );
  });

  const sortedReaders = [...filteredReaders].sort((a, b) => {
    if (sortField === 'lastName') {
      return a.lastName.localeCompare(b.lastName);
    } else if (sortField === 'firstName') {
      return a.firstName.localeCompare(b.firstName);
    }
    return 0;
  });

  const handleDeleteClick = (reader, event) => {
    event.stopPropagation();
    setReaderToDelete(reader);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!readerToDelete) return;

      // Получаем детальную информацию о читателе, включая бронирования
      const readerResponse = await axios.get(`/api/readers/${readerToDelete.id}`);
      const activeReservations = readerResponse.data.reservations?.filter(
        reservation => reservation.Статус === 'Активно'
      ) || [];

      // Если есть активные бронирования, удаляем их
      if (activeReservations.length > 0) {
        for (const reservation of activeReservations) {
          await axios.delete(`/api/reservations/${reservation.КодБронирования}`);
        }
      }

      // Затем удаляем самого читателя
      await axios.delete(`/api/readers/${readerToDelete.id}`);
      setReaders(readers.filter(reader => reader.id !== readerToDelete.id));

      const message = activeReservations.length > 0 ?
        'Читатель и его бронирования были удалены из библиотеки' :
        'Читатель был удален из библиотеки';

      setDeleteModalOpen(false);
      setReaderToDelete(null);

      toast.success(message, {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Ошибка при удалении читателя:', error);
      toast.error('Ошибка при удалении читателя');
    }
  };

  const handleEdit = (reader, event) => {
    event.stopPropagation();
    setEditingReader(reader);
    setFormData({
      firstName: reader.firstName,
      lastName: reader.lastName,
      email: reader.email,
      phone: reader.phone
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingReader(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        Имя: formData.firstName,
        Фамилия: formData.lastName,
        ЭлектроннаяПочта: formData.email,
        Телефон: formData.phone,
        Роль: 'Читатель'
      };

      if (editingReader) {
        const response = await axios.put(`/api/readers/${editingReader.id}`, payload);
        if (response.data.success) {
          const updatedReader = response.data.reader;
          setReaders(readers.map(reader =>
            reader.id === editingReader.id ? {
              ...reader,
              firstName: updatedReader.Имя,
              lastName: updatedReader.Фамилия,
              email: updatedReader.ЭлектроннаяПочта,
              phone: updatedReader.Телефон
            } : reader
          ));
          toast.success('Читатель успешно обновлен');
        }
      } else {
        console.log('Отправка данных:', {
          Имя: formData.firstName,
          Фамилия: formData.lastName,
          ЭлектроннаяПочта: formData.email,
          Телефон: formData.phone || null,
          Роль: 'Читатель',
          ХэшПароля: 'temporary'
        });
        
        const response = await axios.post('/api/readers', {
          Имя: formData.firstName,
          Фамилия: formData.lastName,
          ЭлектроннаяПочта: formData.email,
          Телефон: formData.phone || null,
          Роль: 'Читатель',
          ХэшПароля: 'temporary'
        });
        if (response.data.success) {
          const newReader = response.data.reader;
          setReaders([...readers, {
            id: newReader.КодПользователя,
            firstName: newReader.Имя,
            lastName: newReader.Фамилия,
            email: newReader.ЭлектроннаяПочта,
            phone: newReader.Телефон
          }]);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
          });
          setIsModalOpen(false);
          toast.success('Читатель успешно добавлен');
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении читателя:', error);
      toast.error('Ошибка при сохранении читателя');
    }
  };

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
      <PageHeader>
        <h1>Читатели</h1>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Поиск читателей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ActionButton $primary onClick={handleCreate}>
            Добавить читателя
          </ActionButton>
          <Select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="lastName">Фамилии</option>
            <option value="firstName">Имени</option>
          </Select>
          <DropdownContainer>
            <ActionButton 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ backgroundColor: '#6B4B4B', color: 'white' }}
            >
              Скачать
            </ActionButton>
            <DropdownContent isOpen={isDropdownOpen}>
              <DropdownItem onClick={handleExportExcel}>Экспорт в Excel</DropdownItem>
              <DropdownItem onClick={handleExportWord}>Экспорт в Word</DropdownItem>
            </DropdownContent>
          </DropdownContainer>
        </Controls>
      </PageHeader>

      <TableContainer>
        <ReadersTable>
          <thead>
            <tr>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th className="actions">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedReaders.map((reader) => (
              <tr key={reader.id} onClick={() => handleReaderClick(reader.id)}>
                <td>{reader.lastName}</td>
                <td>{reader.firstName}</td>
                <td>{reader.email}</td>
                <td>{reader.phone}</td>
                <td className="actions">
                  <Button className="edit" onClick={(e) => handleEdit(reader, e)}>
                    Редактировать
                  </Button>
                  <Button className="delete" onClick={(e) => handleDeleteClick(reader, e)}>
                    Удалить
                  </Button>
                </td>
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
      </TableContainer>

      {isModalOpen && (
        <Modal>
          <ModalContent>
            <h2>{editingReader ? 'Редактировать читателя' : 'Создать читателя'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Фамилия:</label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Имя:</label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Email:</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Телефон:</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </FormGroup>
              <ModalButtons>
                <Button type="button" onClick={() => setIsModalOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="primary">
                  {editingReader ? 'Сохранить' : 'Создать'}
                </Button>
              </ModalButtons>
            </Form>
          </ModalContent>
        </Modal>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setReaderToDelete(null);
        }}
        title="Удаление читателя"
      >
        <p>Вы действительно хотите удалить читателя {readerToDelete?.lastName} {readerToDelete?.firstName} из базы?</p>
        <p style={{ marginTop: '12px', color: '#d32f2f' }}>Все его активные бронирования будут также удалены.</p>
      </ConfirmationModal>
    </Container>
  );
};

export default ReadersPage;
