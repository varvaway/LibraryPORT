import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
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

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isManageBooksModalOpen, setIsManageBooksModalOpen] = useState(false);
  const [selectedCategoryForBooks, setSelectedCategoryForBooks] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Необходима авторизация для доступа к данным категориям');
        navigate('/login'); // Redirect to login if not authorized
        return;
      }

      console.log('Запрос данных о категориях...');
      const response = await axios.get('/api/admin-categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.categories) {
        console.log('Данные о категориях:', response.data);
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      toast.error('Ошибка при загрузке категорий');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category => {
      const searchLower = searchTerm.toLowerCase();
      return (category.Название?.toLowerCase().includes(searchLower) ||
              category.Описание?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    let aValue, bValue;
    
    switch(key) {
      case 'Название':
        aValue = a.Название;
        bValue = b.Название;
        break;
      case 'Описание':
        aValue = a.Описание;
        bValue = b.Описание;
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const categoryData = {
        Название: e.target.Название.value,
        Описание: e.target.Описание.value
      };

      if (editCategory) {
        await axios.put(`/api/admin-categories/${editCategory.КодКатегории}`, categoryData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Категория успешно обновлена');
      } else {
        await axios.post('/api/admin-categories', categoryData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Категория успешно создана');
      }

      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
      toast.error(error.response?.data?.message || 'Ошибка при сохранении категории');
    }
  };

  const handleAdd = () => {
    setEditCategory(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin-categories/${categoryToDelete.КодКатегории}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Категория успешно удалена');
      fetchCategories();
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      toast.error(error.response?.data?.message || 'Ошибка при удалении категории');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleManageBooks = async (category) => {
    setSelectedCategoryForBooks(category);
    setIsManageBooksModalOpen(true);
    // Fetch books for this category and available books
    await fetchCategoryBooks(category.КодКатегории);
    await fetchAvailableBooks(category.КодКатегории);
  };

  const fetchCategoryBooks = async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin-categories/${categoryId}/books`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Книги для категории ${categoryId}:`, response.data.books);
      setCategoryBooks(response.data.books);
    } catch (error) {
      console.error('Ошибка при получении книг категории:', error);
      toast.error('Ошибка при загрузке книг для категории');
    }
  };

  const fetchAvailableBooks = async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin-categories/${categoryId}/available-books`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableBooks(response.data.books);
    } catch (error) {
      console.error('Ошибка при получении доступных книг:', error);
      toast.error('Ошибка при загрузке доступных книг');
    }
  };

  const handleAddBookToCategory = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin-categories/${selectedCategoryForBooks.КодКатегории}/books`, 
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Книга успешно добавлена в категорию');
      await fetchCategoryBooks(selectedCategoryForBooks.КодКатегории);
      await fetchAvailableBooks(selectedCategoryForBooks.КодКатегории);
    } catch (error) {
      console.error('Ошибка при добавлении книги в категорию:', error);
      toast.error(error.response?.data?.message || 'Ошибка при добавлении книги в категорию');
    }
  };

  const handleRemoveBookFromCategory = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin-categories/${selectedCategoryForBooks.КодКатегории}/books/${bookId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Книга успешно удалена из категории');
      await fetchCategoryBooks(selectedCategoryForBooks.КодКатегории);
      await fetchAvailableBooks(selectedCategoryForBooks.КодКатегории);
    } catch (error) {
      console.error('Ошибка при удалении книги из категории:', error);
      toast.error(error.response?.data?.message || 'Ошибка при удалении книги из категории');
    }
  };

  const ModalContentFlex = styled(ModalContent)`
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 800px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  `;
  
  const BookListContainer = styled.div`
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  `;
  
  const BookColumn = styled.div`
    flex: 1;
    min-width: 300px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  
  const BookItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
  `;
  
  const BookTitle = styled.span`
    font-weight: 500;
  `;

  const AddRemoveButton = styled(ActionButton)`
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    background-color: ${props => props.$add ? '#28a745' : '#dc3545'};
    width: auto;
  `;

  return (
    <Container>
      <Title>Управление категориями</Title>
      <Controls>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по названию или описанию..."
        />
        <ActionButton onClick={handleAdd}>
          Добавить категорию
        </ActionButton>
      </Controls>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th onClick={() => handleSort('КодКатегории')}>
                Код категории {sortConfig.key === 'КодКатегории' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Название')}>
                Название {sortConfig.key === 'Название' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Описание')}>
                Описание {sortConfig.key === 'Описание' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map(category => (
              <tr key={category.КодКатегории}>
                <td>{category.КодКатегории}</td>
                <td>{category.Название}</td>
                <td>{category.Описание}</td>
                <td className="actions">
                  <ReservationButton 
                    className="edit"
                    onClick={() => handleEdit(category)}
                  >
                    Редактировать
                  </ReservationButton>
                  <ReservationButton 
                    className="delete"
                    onClick={() => {
                      setCategoryToDelete(category);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Удалить
                  </ReservationButton>
                  <ReservationButton 
                    className="manage-books"
                    onClick={() => handleManageBooks(category)}
                  >
                    Управлять книгами
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
          title="Удаление категории"
          message={`Вы уверены, что хотите удалить категорию "${categoryToDelete?.Название}"?`}
        />
      )}

      {isEditModalOpen && (
        <Modal>
          <ModalContent>
            <h2>{editCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
            <form onSubmit={handleSave}>
              <FormGroup>
                <Label>Название</Label>
                <Input
                  type="text"
                  name="Название"
                  defaultValue={editCategory?.Название || ''}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Описание</Label>
                <Input
                  type="text"
                  name="Описание"
                  defaultValue={editCategory?.Описание || ''}
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

      {isManageBooksModalOpen && selectedCategoryForBooks && (
        <Modal>
          <ModalContentFlex>
            <h2>Управление книгами для категории: {selectedCategoryForBooks.Название}</h2>
            <BookListContainer>
              <BookColumn>
                <h3>Книги в категории</h3>
                {categoryBooks.length > 0 ? (
                  categoryBooks.map(book => (
                    <BookItem key={book.КодКниги}>
                      <BookTitle>{book.Название}</BookTitle>
                      <AddRemoveButton 
                        onClick={() => handleRemoveBookFromCategory(book.КодКниги)}
                        $add={false}
                      >
                        Удалить
                      </AddRemoveButton>
                    </BookItem>
                  ))
                ) : (
                  <p>В этой категории пока нет книг.</p>
                )}
              </BookColumn>
              <BookColumn>
                <h3>Доступные книги</h3>
                {availableBooks.length > 0 ? (
                  availableBooks.map(book => (
                    <BookItem key={book.КодКниги}>
                      <BookTitle>{book.Название}</BookTitle>
                      <AddRemoveButton 
                        onClick={() => handleAddBookToCategory(book.КодКниги)}
                        $add={true}
                      >
                        Добавить
                      </AddRemoveButton>
                    </BookItem>
                  ))
                ) : (
                  <p>Нет доступных книг для добавления.</p>
                )}
              </BookColumn>
            </BookListContainer>
            <ModalButtons>
              <ActionButton type="button" onClick={() => setIsManageBooksModalOpen(false)}>
                Закрыть
              </ActionButton>
            </ModalButtons>
          </ModalContentFlex>
        </Modal>
      )}
    </Container>
  );
};

export default AdminCategoriesPage; 