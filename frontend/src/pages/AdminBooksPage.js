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
  const [categories, setCategories] = useState([]);
  const statusOptions = ['Доступна', 'Забронирована'];
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Загружаем книги и категории параллельно
        const [booksResponse, categoriesResponse] = await Promise.all([
          axios.get('/api/books'),
          axios.get('/api/categories')
        ]);
        
        const booksData = Array.isArray(booksResponse.data) ? booksResponse.data : [];
        const categoriesData = Array.isArray(categoriesResponse.data) ? 
          categoriesResponse.data : [];
        
        console.log('Fetched books:', booksData);
        console.log('Fetched categories:', categoriesData);
        
        setBooks(booksData);
        setFilteredBooks(booksData);
        setCategories(categoriesData);
        
        // Log categories after state update
        setTimeout(() => {
          console.log('Categories in state after update:', categories);
        }, 0);
        
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        toast.error('Ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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
      Статус: 'Доступна', // Set default status
      Категория: '',
      Автор: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (book) => {
    const bookData = {
      id: book.id,
      title: book.title || book.Название,
      author: book.author || book.Автор,
      year: book.year || book.ГодИздания,
      isbn: book.isbn || book.ISBN,
      status: book.status || book.Статус || 'Доступна',
      categoryId: book.categoryId || book.Категория?.КодКатегории,
      description: book.description || book.Описание
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
      const token = localStorage.getItem('token');
      const isEdit = !!bookData.КодКниги;
      const url = isEdit 
        ? `/api/books/${bookData.КодКниги}`
        : '/api/books';
      const method = isEdit ? 'PUT' : 'POST';

      // Prepare data in the format expected by the backend
      const requestData = {
        title: bookData.Название,
        author: bookData.Автор,
        year: bookData.ГодИздания ? parseInt(bookData.ГодИздания) : null,
        isbn: bookData.ISBN || null,
        description: bookData.Описание || '',
        status: bookData.Статус || 'Доступна',
        categoryId: bookData.Категория ? parseInt(bookData.Категория) : null,
        id: bookData.КодКниги // Keep ID for backend reference if it's an edit
      };

      console.log('Sending data:', requestData);

      const response = await axios({
        method,
        url,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const savedBook = response.data;
      
      // Обновляем список книг с учетом категории
      if (isEdit) {
        setBooks(prevBooks => 
          prevBooks.map(book => {
            if (book.id === savedBook.id) {
              // Обновляем данные книги, включая информацию о категории
              return {
                ...savedBook,
                categoryName: categories.find(cat => cat.КодКатегории === savedBook.categoryId)?.Название || savedBook.categoryName
              };
            }
            return book;
          })
        );
        setFilteredBooks(prev => 
          prev.map(book => {
            if (book.id === savedBook.id) {
              return {
                ...savedBook,
                categoryName: categories.find(cat => cat.КодКатегории === savedBook.categoryId)?.Название || savedBook.categoryName
              };
            }
            return book;
          })
        );
      } else {
        // Для новой книги добавляем название категории
        const newBook = {
          ...savedBook,
          categoryName: categories.find(cat => cat.КодКатегории === savedBook.categoryId)?.Название
        };
        setBooks(prevBooks => [...prevBooks, newBook]);
        setFilteredBooks(prev => [...prev, newBook]);
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

  // Добавляем название категории к каждой книге и убираем дубликаты
  const booksWithCategoryNames = React.useMemo(() => {
    if (!Array.isArray(books)) return [];
    
    const uniqueBooks = [];
    const bookIds = new Set();
    
    books.forEach(book => {
      if (!book || !book.id) return;
      if (bookIds.has(book.id)) return; // Пропускаем дубликаты
      
      bookIds.add(book.id);
      uniqueBooks.push({
        ...book,
        categoryName: categories.find(cat => cat.КодКатегории === book.categoryId)?.Название || book.categoryName
      });
    });
    
    return uniqueBooks;
  }, [books, categories]);

  // Сортируем и фильтруем книги
  const sortedBooks = React.useMemo(() => {
    if (!Array.isArray(filteredBooks)) return [];
    
    const bookIds = new Set();
    
    const uniqueBooks = [...filteredBooks]
      .filter(book => {
        if (!book || !book.id) return false;
        if (bookIds.has(book.id)) return false;
        bookIds.add(book.id);
        return true;
      })
      .map(book => ({
        ...book,
        categoryName: categories.find(cat => cat.КодКатегории === book.categoryId)?.Название || book.categoryName
      }));

    return uniqueBooks.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      const fieldA = getSortField(a, sortField);
      const fieldB = getSortField(b, sortField);

      if (fieldA < fieldB) return -1 * direction;
      if (fieldA > fieldB) return 1 * direction;
      return 0;
    });
  }, [filteredBooks, sortDirection, sortField, categories]);

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
                <TableHeader onClick={() => handleSort('category')}>
                  Категория
                  {sortField === 'category' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader onClick={() => handleSort('year')}>
                  Год
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
                    <td>{book.title || '—'}</td>
                    <td>{book.author || '—'}</td>
                    <td>{book.categoryName || book.category?.Название || '—'}</td>
                    <td>{book.year || '—'}</td>
                    <td>{book.isbn || '—'}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: book.status === 'Доступна' ? '#e8f5e9' : '#fff3e0',
                        color: book.status === 'Доступна' ? '#2e7d32' : '#e65100',
                        fontWeight: 500
                      }}>
                        {book.status || 'Неизвестно'}
                      </span>
                    </td>
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
      {isEditModalOpen && (
        <>
          {console.log('Rendering EditBookModal with categories:', categories)}
          <EditBookModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            book={editBook}
            onSave={handleSave}
            categories={categories}
            statusOptions={statusOptions}
          />
        </>
      )}

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
