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
    // If clicking the same field, toggle direction
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    setEditBook(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (book) => {
    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year,
      isbn: book.isbn,
      status: book.status,
      category: book.categories?.[0] || book.category,
      categoryId: book.categoryId || book.categories?.[0]?.id,
      description: book.description
    };
    
    console.log('Editing book data:', bookData);
    
    // Ensure we have all necessary fields for editing
    const bookToEdit = {
      ...bookData,
      КодКниги: bookData.id,
      Название: bookData.title,
      Автор: bookData.author,
      ГодИздания: bookData.year,
      ISBN: bookData.isbn,
      Статус: bookData.status || 'Доступна',
      categoryId: bookData.categoryId || bookData.category?.id || bookData.category
    };
    
    setEditBook(bookToEdit);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;

    // Use either id or КодКниги, whichever is available
    const bookId = bookToDelete.id || bookToDelete.КодКниги;
    
    if (!bookId) {
      console.error('Не удалось определить ID книги для удаления:', bookToDelete);
      toast.error('Ошибка: не удалось определить ID книги');
      return;
    }

    try {
      console.log('Удаление книги с ID:', bookId);
      await axios.delete(`/api/books/${bookId}`);
      toast.success('Книга успешно удалена');
      
      // Update both books and filteredBooks state
      setBooks(prevBooks => prevBooks.filter(book => (book.id || book.КодКниги) !== bookId));
      setFilteredBooks(prevFiltered => prevFiltered.filter(book => (book.id || book.КодКниги) !== bookId));
    } catch (error) {
      console.error('Ошибка при удалении книги:', error);
      toast.error(`Ошибка при удалении книги: ${error.response?.data?.message || error.message}`);
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

      // Разбиваем имя автора на части
      let authorId = null;
      if (bookData.Автор) {
        const authorParts = bookData.Автор.split(' ');
        const firstName = authorParts[0];
        const lastName = authorParts.slice(1).join(' ');

        // Ищем или создаем автора
        try {
          const authorResponse = await axios.get('/api/authors');
          const existingAuthor = authorResponse.data.find(
            a => a.firstName === firstName && a.lastName === lastName
          );

          if (existingAuthor) {
            authorId = existingAuthor.id;
          } else {
            // Создаем нового автора
            const newAuthorResponse = await axios.post('/api/authors', {
              firstName,
              lastName
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            authorId = newAuthorResponse.data.id;
          }
        } catch (error) {
          console.error('Ошибка при работе с автором:', error);
          throw error;
        }
      }

      // Prepare data in the format expected by the backend
      const requestData = {
        title: bookData.Название,
        description: bookData.Описание || '',
        year: bookData.ГодИздания ? parseInt(bookData.ГодИздания) : null,
        isbn: bookData.ISBN || '',
        status: bookData.Статус || 'Доступна',
        authors: authorId ? [authorId] : [],
        categories: bookData.Категория ? [parseInt(bookData.Категория)] : []
      };

      console.log('Sending request to:', url);
      console.log('Request method:', method);
      console.log('Request data:', requestData);
      console.log('Book data from form:', bookData);

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
      console.log('Received saved book:', savedBook);
      
      // Обновляем список книг
      if (isEdit) {
        setBooks(prevBooks => 
          prevBooks.map(book => {
            if (book.id === savedBook.id) {
              return {
                ...savedBook,
                categoryName: savedBook.categoryName || categories.find(cat => cat.КодКатегории === savedBook.categories?.[0]?.id)?.Название
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
                categoryName: savedBook.categoryName || categories.find(cat => cat.КодКатегории === savedBook.categories?.[0]?.id)?.Название
              };
            }
            return book;
          })
        );
      } else {
        // Для новой книги добавляем название категории
        const newBook = {
          ...savedBook,
          categoryName: savedBook.categoryName || categories.find(cat => cat.КодКатегории === savedBook.categories?.[0]?.id)?.Название
        };
        setBooks(prev => [...prev, newBook]);
        setFilteredBooks(prev => [...prev, newBook]);
      }

      setIsEditModalOpen(false);
      toast.success(isEdit ? 'Книга успешно обновлена' : 'Книга успешно добавлена');
    } catch (error) {
      console.error('Ошибка при сохранении книги:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Ошибка при сохранении книги');
    }
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
        categoryName: categories.find(cat => cat.КодКатегории === book.categoryId)?.Название || book.categoryName || '',
        // Ensure all sortable fields have string values
        title: book.title || '',
        author: book.author || '',
        year: book.year ? String(book.year) : '',
        status: book.status || '',
        isbn: book.isbn || ''
      }));

    console.log('Sorting by:', sortField, 'direction:', sortDirection);
    console.log('Sample book data:', uniqueBooks[0]);

    const sorted = [...uniqueBooks].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      const fieldMap = {
        'Название': 'title',
        'Автор': 'author',
        'Год': 'year',
        'Статус': 'status',
        'Категория': 'categoryName',
        'ISBN': 'isbn'
      };
      
      const field = fieldMap[sortField] || sortField;
      const valueA = String(a[field] || '').toLowerCase().trim();
      const valueB = String(b[field] || '').toLowerCase().trim();
      
      console.log(`Comparing ${valueA} and ${valueB} for field ${field}`);
      
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });

    console.log('Sorted result:', sorted);
    return sorted;
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
          <p>Сортировка по: {sortField} ({sortDirection === 'asc' ? 'А-Я' : 'Я-А'})</p>
          <BooksTable>
            <thead>
              <tr>
                <TableHeader 
                  onClick={() => handleSort('Название')}
                  title="Сортировать по названию"
                  style={{ cursor: 'pointer' }}
                >
                  {sortField === 'Название' 
                    ? sortDirection === 'asc' 
                      ? 'Название (А-Я)' 
                      : 'Название (Я-А)'
                    : 'Название'}
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('Автор')}
                  title="Сортировать по автору"
                  style={{ cursor: 'pointer' }}
                >
                  {sortField === 'Автор' 
                    ? sortDirection === 'asc' 
                      ? 'Автор (А-Я)' 
                      : 'Автор (Я-А)'
                    : 'Автор'}
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('Категория')}
                  title="Сортировать по категории"
                  style={{ cursor: 'pointer' }}
                >
                  {sortField === 'Категория' 
                    ? sortDirection === 'asc' 
                      ? 'Категория (А-Я)' 
                      : 'Категория (Я-А)'
                    : 'Категория'}
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('Год')}
                  title="Сортировать по году издания"
                  style={{ cursor: 'pointer' }}
                >
                  {sortField === 'Год' 
                    ? sortDirection === 'asc' 
                      ? 'Год (по возрастанию)' 
                      : 'Год (по убыванию)'
                    : 'Год'}
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('ISBN')}
                  title="Сортировать по ISBN"
                  style={{ cursor: 'pointer' }}
                >
                  ISBN
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('Статус')}
                  title="Сортировать по статусу"
                  style={{ cursor: 'pointer' }}
                >
                  {sortField === 'Статус' 
                    ? sortDirection === 'asc' 
                      ? 'Статус (А-Я)' 
                      : 'Статус (Я-А)'
                    : 'Статус'}
                </TableHeader>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sortedBooks) && sortedBooks.length > 0 ? (
                sortedBooks.map((book, index) => (
                  <tr key={book.id || `book-${index}`}>
                    <td>{book.title || '—'}</td>
                    <td>{book.author || '—'}</td>
                    <td>{book.categories && book.categories.length > 0 
                      ? book.categories.map(cat => cat.name).join(', ') 
                      : '—'}</td>
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
