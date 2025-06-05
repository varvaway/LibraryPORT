import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
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
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
  &:active {
    background-color: #e0e0e0;
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
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
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.className === 'primary' ? '#4a90e2' : '#f5f5f5'};
  color: ${props => props.className === 'primary' ? 'white' : '#333'};
  &:hover {
    background-color: ${props => props.className === 'primary' ? '#357abd' : '#e0e0e0'};
  }
`;

const Table = styled.table`
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
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background-color: #e0e0e0;
    }
  }

  tr:hover {
    background-color: #f9f9f9;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
  max-width: 400px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4a90e2;
  color: white;
  
  &:hover {
    background-color: #357abd;
  }
`;

const ReadersPage = () => {
  const [readers, setReaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedReader, setSelectedReader] = useState(null);
  const [formData, setFormData] = useState({
    Фамилия: '',
    Имя: '',
    Телефон: '',
    ЭлектроннаяПочта: ''
  });

  const [readerToDelete, setReaderToDelete] = useState(null);
  const [readerIdToDelete, setReaderIdToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'Фамилия',
    direction: 'asc'
  });



  useEffect(() => {
    fetchReaders();
  }, []);

  const fetchReaders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Необходима авторизация для доступа к данным читателей');
        return;
      }

      const response = await axios.get('/api/readers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Сессия истекла. Пожалуйста, войдите в систему снова.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (response.data.success) {
        setReaders(response.data.readers);
      } else {
        toast.error(response.data.message || 'Не удалось загрузить данные читателей');
      }
    } catch (error) {
      console.error('Ошибка при получении читателей:', error);
      if (error.response?.status === 401) {
        toast.error('Сессия истекла. Пожалуйста, войдите в систему снова.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Не удалось загрузить данные читателей');
      }
    }
  };

  const handleReaderClick = (reader) => {
    setSelectedReader(reader);
    navigate(`/readers/${reader._id}`);
  };

  const filteredReaders = readers.filter(reader =>
    reader.Фамилия.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reader.Имя.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reader.Телефон.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reader.ЭлектроннаяПочта.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedReaders = [...filteredReaders].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    return direction * a[key].localeCompare(b[key]);
  });

  const toggleModal = (type) => {
    setModalType(type);
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = modalType === 'edit' ? 'put' : 'post';
      const url = modalType === 'edit' 
        ? `/api/readers/${selectedReader.КодПользователя}` 
        : '/api/readers';

      const data = {
        Имя: formData.Имя,
        Фамилия: formData.Фамилия,
        Телефон: formData.Телефон,
        ЭлектроннаяПочта: formData.ЭлектроннаяПочта
      };

      const response = await axios[method](
        url,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success(modalType === 'edit' 
          ? 'Читатель успешно обновлен' 
          : 'Читатель успешно добавлен');
        setIsModalOpen(false);
        fetchReaders();
      }
    } catch (error) {
      console.error('Ошибка при сохранении читателя:', error);
      toast.error('Ошибка при сохранении читателя');
    }
  };

  const handleDelete = (reader) => {
    setReaderToDelete(reader);
    setReaderIdToDelete(reader.КодПользователя);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/readers/${readerIdToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Читатель успешно удален');
        setDeleteModalOpen(false);
        setReaderIdToDelete(null);
        fetchReaders();
      }
    } catch (error) {
      console.error('Ошибка при удалении читателя:', error);
      toast.error('Ошибка при удалении читателя');
    }
  };

  const handleExportExcel = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `выгрузка_читателей_от_${date}.xlsx`;
    setIsDropdownOpen(false);

    const data = filteredReaders.map(reader => ({
      'Фамилия': reader.Фамилия,
      'Имя': reader.Имя,
      'Email': reader.ЭлектроннаяПочта,
      'Телефон': reader.Телефон
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Читатели');
    XLSX.writeFile(wb, fileName);
  };

  const handleExportWord = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `выгрузка_читателей_от_${date}.doc`;

    let tableHtml = '<table style="width:100%; border-collapse: collapse;">';
    tableHtml += '<tr style="background-color: #f5f5f5;">';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Фамилия</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Имя</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Email</th>';
    tableHtml += '<th style="border: 1px solid #ddd; padding: 8px;">Телефон</th>';
    tableHtml += '</tr>';

    filteredReaders.forEach(reader => {
      tableHtml += '<tr>';
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.Фамилия}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.Имя}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.ЭлектроннаяПочта || ''}</td>`;
      tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${reader.Телефон || ''}</td>`;
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

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' 
      ? 'desc' 
      : 'asc';
    setSortConfig({ key, direction });
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container>
      <Title>Читатели</Title>
      <Controls>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по фамилии, имени, телефону или email..."
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <ActionButton onClick={() => { 
            setModalType('add'); 
            setFormData({
              Фамилия: '',
              Имя: '',
              Телефон: '',
              ЭлектроннаяПочта: ''
            });
            setIsModalOpen(true); 
          }}>
            Добавить читателя
          </ActionButton>
          <DropdownContainer ref={dropdownRef}>
            <ActionButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              Экспорт
            </ActionButton>
            <DropdownContent isOpen={isDropdownOpen}>
              <DropdownItem onClick={handleExportExcel}>Excel</DropdownItem>
              <DropdownItem onClick={handleExportWord}>Word</DropdownItem>
            </DropdownContent>
          </DropdownContainer>
        </div>
      </Controls>

      <ReadersContainer>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th onClick={() => handleSort('Фамилия')}>
                  Фамилия {sortConfig.key === 'Фамилия' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('Имя')}>
                  Имя {sortConfig.key === 'Имя' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedReaders.map((reader) => (
                <tr key={reader.КодПользователя} onClick={() => handleReaderClick(reader)}>
                  <td>{reader.Фамилия}</td>
                  <td>{reader.Имя}</td>
                  <td>{reader.Телефон}</td>
                  <td>{reader.ЭлектроннаяПочта}</td>
                  <td>
                    <Button 
                      className="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReader(reader);
                        setFormData({
                          Фамилия: reader.Фамилия,
                          Имя: reader.Имя,
                          Телефон: reader.Телефон,
                          ЭлектроннаяПочта: reader.ЭлектроннаяПочта
                        });
                        setModalType('edit');
                        setIsModalOpen(true);
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button 
                      className="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(reader);
                      }}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ReadersContainer>

      {isModalOpen && (
        <Modal>
          <ModalContent>
            <h2>{modalType === 'edit' ? 'Редактирование читателя' : 'Создание нового читателя'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Фамилия</label>
                <Input
                  name="Фамилия"
                  value={formData.Фамилия}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Имя</label>
                <Input
                  name="Имя"
                  value={formData.Имя}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Телефон</label>
                <Input
                  name="Телефон"
                  value={formData.Телефон}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Электронная почта</label>
                <Input
                  name="ЭлектроннаяПочта"
                  type="email"
                  value={formData.ЭлектроннаяПочта}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              <ModalButtons>
                <Button type="button" onClick={() => setIsModalOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="primary">
                  Сохранить
                </Button>
              </ModalButtons>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Удаление читателя"
          message={`Вы уверены, что хотите удалить читателя ${readerToDelete?.Фамилия} ${readerToDelete?.Имя}?`}
        />
      )}
    </Container>
  );
};

export default ReadersPage;