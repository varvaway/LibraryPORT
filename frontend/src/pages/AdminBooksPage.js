import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import EditBookModal from '../components/EditBookModal';
import ConfirmationModal from '../components/ConfirmationModal';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BooksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    padding: 0.5rem;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f5f5f5;
  }
`;

const TableHeader = styled.th`
  cursor: pointer;
  padding: 0.5rem;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('Название');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/books');
        console.log('Ответ API:', response.data);
        console.log('Структура API:', typeof response.data, Array.isArray(response.data));
        const booksData = Array.isArray(response.data) ? response.data : [];
        console.log('Книги после преобразования:', booksData);
        console.log('Первая книга:', booksData[0]);
        console.log('Поля первой книги:', Object.keys(booksData[0]));
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
        toast.error('Ошибка при загрузке книг');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (book.title || '').toLowerCase().includes(searchLower) ||
        (book.author || '').toLowerCase().includes(searchLower) ||
        (book.description || '').toLowerCase().includes(searchLower) ||
        (book.year ? book.year.toString().includes(searchLower) : false) ||
        (book.isbn || '').toLowerCase().includes(searchLower) ||
        (book.categoryName || '').toLowerCase().includes(searchLower) ||
        (book.status || '').toLowerCase().includes(searchLower)
      );
    });
    setFilteredBooks(filtered);
  }, [books, searchTerm]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    setEditBook({
      КодКниги: '',
      Название: '',
      Описание: '',
      ГодИздания: '',
      ISBN: '',
      Статус: 'Доступна',
      Категория: '',
      Автор: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (book) => {
    const bookData = {
      КодКниги: book.id,
      Название: book.title,
      Описание: book.description,
      ГодИздания: book.year,
      ISBN: book.isbn,
      Статус: book.status || 'Доступна',
      Автор: book.author || '',
      Категория: book.categoryId || ''
    };
    setEditBook(bookData);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      await axios.delete(`/api/books/${bookToDelete.КодКниги}`);
      toast.success('Книга успешно удалена');
      setBooks(books.filter(book => book.КодКниги !== bookToDelete.КодКниги));
      setFilteredBooks(filteredBooks.filter(book => book.КодКниги !== bookToDelete.КодКниги));
    } catch (error) {
      console.error('Ошибка при удалении книги:', error);
      toast.error('Ошибка при удалении книги');
    } finally {
      setDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  const handleSave = async (bookData) => {
    try {
      console.log('Данные для сохранения:', bookData);
      let response;
      const bookDataToSend = {
        Название: bookData.Название || '',
        Описание: bookData.Описание || '',
        ГодИздания: bookData.ГодИздания || '',
        ISBN: bookData.ISBN || '',
        Статус: bookData.Статус || 'Доступна',
        Автор: bookData.Автор || '',
        Категория: bookData.Категория || null,
        КодКниги: bookData.КодКниги
      };

      if (bookData.id) {
        response = await axios.put(`/api/books/${bookData.id}`, bookDataToSend);
      } else {
        response = await axios.post('/api/books', bookDataToSend);
      }

      const updatedBook = response.data;
      
      if (bookData.id) {
        setBooks(books.map(book => 
          book.id === bookData.id ? updatedBook : book
        ));
        setFilteredBooks(filteredBooks.map(book => 
          book.id === bookData.id ? updatedBook : book
        ));
      } else {
        setBooks([...books, updatedBook]);
        setFilteredBooks([...filteredBooks, updatedBook]);
      }

      setIsEditModalOpen(false);
      toast.success('Книга успешно сохранена');
    } catch (error) {
      console.error('Ошибка при сохранении книги:', error);
      toast.error('Ошибка при сохранении книги');
    }
  };

  // Map sort field names to match the actual book object properties
  const getSortField = (book, field) => {
    const fieldMap = {
      'title': 'title',
      'author': 'author',
      'description': 'description',
      'year': 'year',
      'isbn': 'isbn',
      'categoryName': 'categoryName',
      'status': 'status'
    };
    
    const actualField = fieldMap[field] || field;
    return book[actualField] || '';
  };

  const sortedBooks = Array.isArray(filteredBooks) ? [...filteredBooks].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const fieldA = getSortField(a, sortField);
    const fieldB = getSortField(b, sortField);
    
    // Handle numeric fields
    if (sortField === 'year' || sortField === 'ГодИздания') {
      return (parseInt(fieldA) - parseInt(fieldB)) * direction;
    }
    
    // Handle string fields
    return String(fieldA).localeCompare(String(fieldB)) * direction;
  }) : [];

  return (
    <PageContainer>
      <Title>Книги</Title>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: 1
          }}
        />
        <AddButton onClick={handleAdd}>
          <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
          Добавить книгу
        </AddButton>
      </div>
      {!isLoading ? (
        <div>
          <p>Отображаемые книги: {filteredBooks.length}</p>
          <p>Сортировка по: {sortField} ({sortDirection})</p>
          <BooksTable>
            <thead>
              <tr>
                <TableHeader onClick={() => handleSort('title')}>
                  Название
                  {sortField === 'title' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('author')}>
                  Автор
                  {sortField === 'author' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('description')}>
                  Описание
                  {sortField === 'description' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('year')}>
                  Год издания
                  {sortField === 'year' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('isbn')}>
                  ISBN
                  {sortField === 'isbn' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('categoryName')}>
                  Категория
                  {sortField === 'categoryName' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('status')}>
                  Статус
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredBooks) && filteredBooks.length > 0 ? (
                filteredBooks.map((book, index) => (
                  <tr key={book.id || `book-${index}`}>
                    <td>{book.title || 'Нет данных'}</td>
                    <td>{book.author || 'Нет данных'}</td>
                    <td>{book.description || 'Нет данных'}</td>
                    <td>{book.year || 'Нет данных'}</td>
                    <td>{book.isbn || 'Нет данных'}</td>
                    <td>{book.categoryName || 'Нет данных'}</td>
                    <td>{book.status || 'Нет данных'}</td>
                    <td>
                      <ButtonGroup>
                        <Button $primary onClick={() => handleEdit(book)}>
                          <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>
                          Редактировать
                        </Button>
                        <Button onClick={() => {
                          setBookToDelete(book);
                          setDeleteModalOpen(true);
                        }}>
                          <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                          Удалить
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    Нет книг для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </BooksTable>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        book={editBook}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удаление книги"
        message="Вы уверены, что хотите удалить эту книгу?"
      />
    </PageContainer>
  );
};

export default AdminBooksPage;
