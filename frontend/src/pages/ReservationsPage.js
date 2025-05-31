import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.mahogany};
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2em;
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.mahogany};
  }
`;

const ExportButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.mahogany};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'активна':
        return '#e3f2fd';
      case 'завершена':
        return '#e8f5e9';
      case 'отменена':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'активна':
        return '#1565c0';
      case 'завершена':
        return '#2e7d32';
      case 'отменена':
        return '#c62828';
      default:
        return '#616161';
    }
  }};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  cursor: pointer;
  position: relative;

  &:after {
    content: '';
    display: ${props => props.$sorted ? 'inline-block' : 'none'};
    width: 0;
    height: 0;
    margin-left: 5px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-${props => props.$sorted === 'asc' ? 'bottom' : 'top'}: 5px solid #000;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const Tr = styled.tr`
  background-color: ${props => props.expired ? '#f5f5f5' : 'white'};
`;

const DropdownContent = styled.div`
  display: ${props => props.$show ? 'block' : 'none'};
  position: absolute;
  background-color: white;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reservations/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setReservations(response.data.reservations.map(res => ({
          ...res,
          startDate: new Date(res.startDate),
          endDate: new Date(new Date(res.startDate).getTime() + 14 * 24 * 60 * 60 * 1000)
        })));
      }
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReservations = React.useMemo(() => {
    if (!sortConfig.key) return reservations;

    return [...reservations].sort((a, b) => {
      // Получаем значения для сравнения на основе ключа сортировки
      const getValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
      };

      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [reservations, sortConfig]);

  // Фильтрация по поисковому запросу
  const filteredReservations = React.useMemo(() => {
    return sortedReservations.filter(reservation => {
      const searchLower = searchTerm.toLowerCase();
      const readerName = `${reservation.reader.lastName} ${reservation.reader.firstName}`.toLowerCase();
      
      if (!reservation.book) {
        return readerName.includes(searchLower);
      }

      const bookTitle = reservation.book.title.toLowerCase();
      const bookAuthor = reservation.book.author.toLowerCase();
      const bookCategory = reservation.book.category.toLowerCase();
      
      return readerName.includes(searchLower) ||
             bookTitle.includes(searchLower) ||
             bookAuthor.includes(searchLower) ||
             bookCategory.includes(searchLower);
    });
  }, [sortedReservations, searchTerm]);

  const exportToExcel = () => {
    const currentDate = format(new Date(), 'dd.MM.yyyy HH:mm', { locale: ru });
    const data = filteredReservations.map(res => ({
      'Фамилия читателя': res.reader.lastName,
      'Имя читателя': res.reader.firstName,
      'Название книги': res.book ? res.book.title : 'Нет данных',
      'Автор': res.book ? res.book.author : 'Нет данных',
      'Категория': res.book ? res.book.category : 'Нет данных',
      'Начало бронирования': format(new Date(res.startDate), 'dd.MM.yyyy', { locale: ru }),
      'Конец бронирования': format(new Date(res.endDate), 'dd.MM.yyyy', { locale: ru }),
      'Статус': new Date(res.endDate) < new Date() ? 'Закончено' : 'Активно'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Бронирования');
    XLSX.writeFile(wb, `Бронирования от ${currentDate}.xlsx`);
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'Список бронирований',
            heading: HeadingLevel.HEADING_1
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Код')] }),
                  new TableCell({ children: [new Paragraph('Пользователь')] }),
                  new TableCell({ children: [new Paragraph('Книга')] }),
                  new TableCell({ children: [new Paragraph('Автор')] }),
                  new TableCell({ children: [new Paragraph('Дата')] }),
                  new TableCell({ children: [new Paragraph('Статус')] })
                ]
              }),
              ...reservations.map(reservation => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(reservation.КодБронирования.toString())] }),
                  new TableCell({ children: [new Paragraph(reservation.User ? `${reservation.User.Имя} ${reservation.User.Фамилия}` : 'Нет данных')] }),
                  new TableCell({ children: [new Paragraph(reservation.Books?.[0] ? reservation.Books[0].Название : 'Нет данных')] }),
                  new TableCell({ children: [new Paragraph(reservation.Books?.[0] ? reservation.Books[0].Автор : 'Нет данных')] }),
                  new TableCell({ children: [new Paragraph(new Date(reservation.ДатаБронирования).toLocaleDateString())] }),
                  new TableCell({ children: [new Paragraph(reservation.Статус)] })
                ]
              }))
            ]
          })
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'Бронирования.docx');
    });
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/reservations/${reservationId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchReservations(); // Обновляем список бронирований
    } catch (error) {
      console.error('Ошибка при отмене бронирования:', error);
    }
  };

  return (
    <Container>
      <Title>Управление бронированиями</Title>
      
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Поиск по читателю или книге..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ position: 'relative' }}>
          <div ref={dropdownRef}>
            <ExportButton onClick={() => setShowExportDropdown(!showExportDropdown)}>
              Скачать
            </ExportButton>
            <DropdownContent $show={showExportDropdown}>
              <DropdownItem onClick={() => { exportToExcel(); setShowExportDropdown(false); }}>Экспорт в Excel</DropdownItem>
              <DropdownItem onClick={() => { exportToWord(); setShowExportDropdown(false); }}>Экспорт в Word</DropdownItem>
            </DropdownContent>
          </div>
        </div>
      </SearchContainer>

      <StyledTable>
        <thead>
          <tr>
            <Th>Код</Th>
            <Th onClick={() => handleSort('User.Фамилия')} $sorted={sortConfig.key === 'User.Фамилия' ? sortConfig.direction : null}>
              Пользователь
            </Th>
            <Th onClick={() => handleSort('Books[0].Название')} $sorted={sortConfig.key === 'Books[0].Название' ? sortConfig.direction : null}>
              Название книги
            </Th>
            <Th onClick={() => handleSort('Books[0].Автор')} $sorted={sortConfig.key === 'Books[0].Автор' ? sortConfig.direction : null}>
              Автор
            </Th>
            <Th onClick={() => handleSort('ДатаБронирования')} $sorted={sortConfig.key === 'ДатаБронирования' ? sortConfig.direction : null}>
              Дата
            </Th>
            <Th onClick={() => handleSort('Статус')} $sorted={sortConfig.key === 'Статус' ? sortConfig.direction : null}>
              Статус
            </Th>
            <Th>Действия</Th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.КодБронирования}>
              <td>{reservation.КодБронирования}</td>
              <td>{reservation.User ? `${reservation.User.Имя} ${reservation.User.Фамилия}` : 'Нет данных'}</td>
              <td>{reservation.Books?.[0] ? reservation.Books[0].Название : 'Нет данных'}</td>
              <td>{reservation.Books?.[0] ? reservation.Books[0].Автор : 'Нет данных'}</td>
              <td>{new Date(reservation.ДатаБронирования).toLocaleDateString('ru-RU')}</td>
              <td>
                <StatusBadge status={reservation.Статус}>
                  {reservation.Статус}
                </StatusBadge>
              </td>
              <td>
                <button onClick={() => handleCancelReservation(reservation.КодБронирования)}>Отменить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </Container>
  );

};

export default ReservationsPage;
