import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { DropdownContainer, DropdownContent, DropdownItem } from '../components/Dropdown';
import ConfirmationModal from '../components/ConfirmationModal';
import AutoCompleteSelect from '../components/AutoCompleteSelect';
import Button from '../components/ActionButton';

const ActionButton = styled(Button)`
  background-color: ${props => props.$primary ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ReservationButton = styled(Button)`
  background-color: ${props => props.className === 'edit' ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  margin-top: 1rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    cursor: pointer;
  }

  th:hover {
    background-color: #f0f2f5;
  }

  tr:hover {
    background-color: #f8f9fa;
  }

  td.actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;

  ${props => {
    switch (props.status) {
      case 'Активно':
        return 'background-color: #4CAF50; color: white;';
      case 'Завершено':
        return 'background-color: #2196F3; color: white;';
      case 'Отменено':
        return 'background-color: #f44336; color: white;';
      default:
        return 'background-color: #9e9e9e; color: white;';
    }
  }};
`;

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
  margin-right: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [editReservation, setEditReservation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('xlsx');
  const [readers, setReaders] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedReader, setSelectedReader] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Необходима авторизация для доступа к данным бронирований');
        return;
      }

      console.log('Запрос данных о бронированиях...');
      const response = await axios.get('/api/reservations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.reservations) {
        console.log('Данные о бронированиях:', response.data);
        // Выводим структуру первой книги из первого бронирования для отладки
        if (response.data.length > 0 && response.data[0].Books?.length > 0) {
          console.log('Структура книги из бронирования:', response.data[0].Books[0]);
        }
        const formattedReservations = response.data.reservations.map(reservation => ({
          КодБронирования: reservation.id,
          User: {
            КодПользователя: reservation.user?.КодПользователя || reservation.user?.id,
            Имя: reservation.user?.Имя || reservation.user?.firstName,
            Фамилия: reservation.user?.Фамилия || reservation.user?.lastName,
          },
          Books: reservation.books?.map(book => ({
             КодКниги: book.КодКниги || book.id,
             Название: book.Название || book.title,
             Автор: book.Автор || book.author,
          })) || [],
          ДатаБронирования: reservation.dateFrom,
          ДатаОкончания: reservation.dateTo,
          Статус: reservation.status,
          ReservationItems: reservation.ReservationItems
        }));

        setReservations(formattedReservations);
        setFilteredReservations(formattedReservations);
      }
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
      toast.error('Ошибка при загрузке бронирований');
    }
  };

  const fetchReaders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReaders(response.data.users);
    } catch (error) {
      console.error('Ошибка при получении читателей:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/books', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBooks(response.data.books);
    } catch (error) {
      console.error('Ошибка при получении книг:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchReaders();
    fetchBooks();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const reservationData = {
        КодПользователя: selectedReader?.КодПользователя,
        Книги: selectedBook ? [selectedBook.КодКниги] : [],
        ДатаБронирования: format(new Date(), 'yyyy-MM-dd'),
        ДатаОкончания: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
        Статус: 'Активно'
      };

      if (!selectedReader || !selectedBook) {
        toast.error('Пожалуйста, выберите читателя и книгу');
        return;
      }

      if (editReservation) {
        await axios.put(`/api/reservations/${editReservation.КодБронирования}`, reservationData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Бронирование успешно обновлено');
      } else {
        await axios.post('/api/reservations', reservationData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Бронирование успешно создано');
      }

      setIsEditModalOpen(false);
      fetchReservations();
    } catch (error) {
      console.error('Ошибка при сохранении бронирования:', error);
      toast.error('Ошибка при сохранении бронирования');
    }
  };

  const handleAdd = () => {
    setEditReservation(null);
    setSelectedReader(null);
    setSelectedBook(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (reservation) => {
    setEditReservation(reservation);
    setSelectedReader(reservation?.User);
    setSelectedBook(reservation?.Books?.[0]);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/reservations/${reservationToDelete.КодБронирования}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Бронирование успешно удалено');
      fetchReservations();
    } catch (error) {
      console.error('Ошибка при удалении бронирования:', error);
      toast.error('Ошибка при удалении бронирования');
    } finally {
      setDeleteModalOpen(false);
      setReservationToDelete(null);
    }
  };

  const handleExportExcel = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `выгрузка_бронирований_от_${date}.xlsx`;
    setIsDropdownOpen(false);

    const data = filteredReservations.map(res => ({
      'Читатель': `${res.User?.Фамилия} ${res.User?.Имя}`,
      'Книги': res.Books?.map(b => b.Название).join(', '),
      'Дата бронирования': format(new Date(res.ДатаБронирования), 'dd.MM.yyyy', { locale: ru }),
      'Дата окончания': format(new Date(res.ДатаОкончания), 'dd.MM.yyyy', { locale: ru }),
      'Статус': res.Статус
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Бронирования');
    XLSX.writeFile(wb, fileName);
  };

  const handleExportWord = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `выгрузка_бронирований_от_${date}.doc`;

    let tableHtml = '<table style="width:100%; border-collapse: collapse;">';
    tableHtml += '<tr style="background-color: #f5f5f5;">';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Читатель</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Книги</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Дата бронирования</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Дата окончания</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Статус</th>';
    tableHtml += '</tr>';

    filteredReservations.forEach(res => {
      tableHtml += '<tr>';
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${res.User?.Фамилия} ${res.User?.Имя}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${res.Books?.map(b => b.Название).join(', ')}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${format(new Date(res.ДатаБронирования), 'dd.MM.yyyy', { locale: ru })}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${format(new Date(res.ДатаОкончания), 'dd.MM.yyyy', { locale: ru })}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${res.Статус}</td>`;
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';

    const blob = new Blob([`<html><body>${tableHtml}</body></html>`], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const filtered = reservations.filter(reservation => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (reservation.User?.Фамилия?.toLowerCase().includes(searchLower) ||
        reservation.User?.Имя?.toLowerCase().includes(searchLower) ||
        reservation.Статус?.toLowerCase().includes(searchLower) ||
        reservation.Books?.some(book => 
          book.Название?.toLowerCase().includes(searchLower)
        ))
      );
    });
    setFilteredReservations(filtered);
  }, [searchTerm, reservations]);

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    let aValue, bValue;
    
    switch(key) {
      case 'Читатель':
        aValue = `${a.User?.Фамилия || ''} ${a.User?.Имя || ''}`;
        bValue = `${b.User?.Фамилия || ''} ${b.User?.Имя || ''}`;
        break;
      case 'Книги':
        aValue = a.Books?.map(book => book.Название).join(',') || '';
        bValue = b.Books?.map(book => book.Название).join(',') || '';
        break;
      case 'Дата бронирования':
        aValue = new Date(a.ДатаБронирования).getTime();
        bValue = new Date(b.ДатаБронирования).getTime();
        break;
      case 'Дата окончания':
        aValue = new Date(a.ДатаОкончания).getTime();
        bValue = new Date(b.ДатаОкончания).getTime();
        break;
      case 'Статус':
        aValue = a.Статус;
        bValue = b.Статус;
        break;
      default:
        aValue = a[key];
        bValue = b[key];
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction * aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction * (aValue - bValue);
    } else {
      return direction * (aValue > bValue ? 1 : -1);
    }
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Некорректная дата';
      }
      return format(date, 'dd.MM.yyyy', { locale: ru });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Некорректная дата';
    }
  };

  return (
    <Container>
      <Title>Бронирования</Title>
      <Controls>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по фамилии читателя, названию книги или статусу..."
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <ActionButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            Экспорт
          </ActionButton>
          <ActionButton onClick={handleAdd}>
            Добавить бронирование
          </ActionButton>
        </div>
      </Controls>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th onClick={() => handleSort('Читатель')}>
                Читатель {sortConfig.key === 'Читатель' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Книги')}>
                Книги {sortConfig.key === 'Книги' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Автор</th>
              <th onClick={() => handleSort('Дата бронирования')}>
                Дата бронирования {sortConfig.key === 'Дата бронирования' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Дата окончания')}>
                Дата окончания {sortConfig.key === 'Дата окончания' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Статус')}>
                Статус {sortConfig.key === 'Статус' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedReservations.map(reservation => (
              <tr key={reservation.КодБронирования}>
                <td>
                  {reservation.User?.Фамилия} {reservation.User?.Имя}
                </td>
                <td>
                  {reservation.Books?.map(book => book.Название).join(', ') || 'Нет книг'}
                </td>
                <td>
                  {reservation.Books?.map(book => 
                    book.Автор || 'Нет автора'
                  ).join('; ') || 'Нет автора'}
                </td>
                <td>
                  {formatDate(reservation.ДатаБронирования)}
                </td>
                <td>
                  {formatDate(reservation.ДатаОкончания)}
                </td>
                <td>
                  {reservation.Статус}
                </td>
                <td className="actions">
                  <ReservationButton 
                    className="edit"
                    onClick={() => handleEdit(reservation)}
                  >
                    Редактировать
                  </ReservationButton>
                  <ReservationButton 
                    className="delete"
                    onClick={() => {
                      setReservationToDelete(reservation);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Удалить
                  </ReservationButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Удаление бронирования"
          message={`Вы уверены, что хотите удалить бронирование ${reservationToDelete?.User?.Фамилия} ${reservationToDelete?.User?.Имя}?`}
        />
      )}

      {isEditModalOpen && (
        <Modal>
          <ModalContent>
            <h2>{editReservation ? 'Редактировать бронирование' : 'Добавить бронирование'}</h2>
            <form onSubmit={handleSave}>
              <FormGroup>
                <Label>Читатель</Label>
                <AutoCompleteSelect
                  options={readers}
                  value={selectedReader}
                  onChange={setSelectedReader}
                  placeholder="Выберите читателя..."
                  getOptionLabel={(reader) => `${reader.Фамилия} ${reader.Имя}`}
                  getOptionValue={(reader) => reader.КодПользователя}
                />
              </FormGroup>
              <FormGroup>
                <Label>Название книги</Label>
                <AutoCompleteSelect
                  options={books}
                  value={selectedBook}
                  onChange={setSelectedBook}
                  placeholder="Выберите книгу..."
                  getOptionLabel={(book) => book.Название}
                  getOptionValue={(book) => book.КодКниги}
                />
              </FormGroup>
              <FormGroup>
                <Label>Автор</Label>
                <Input
                  type="text"
                  value={selectedBook?.Автор || ''}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Дата бронирования</Label>
                <Input
                  type="date"
                  value={format(new Date(), 'yyyy-MM-dd')}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Дата окончания</Label>
                <Input
                  type="date"
                  value={format(addDays(new Date(), 14), 'yyyy-MM-dd')}
                  disabled
                />
              </FormGroup>
              <ModalButtons>
                <ActionButton type="button" onClick={() => setIsEditModalOpen(false)}>
                  Отмена
                </ActionButton>
                <ActionButton type="submit" $primary>
                  Сохранить
                </ActionButton>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      )}

      {isDropdownOpen && (
        <DropdownContainer ref={dropdownRef}>
          <DropdownContent isOpen={isDropdownOpen}>
            <DropdownItem onClick={handleExportExcel}>Excel</DropdownItem>
            <DropdownItem onClick={handleExportWord}>Word</DropdownItem>
          </DropdownContent>
        </DropdownContainer>
      )}
    </Container>
  );
};

export default ReservationsPage;