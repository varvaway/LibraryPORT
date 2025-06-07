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
    cursor: pointer;
  }
`;

const TableHeader = styled.th`
  cursor: pointer;
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

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [sortField, setSortField] = useState('Название');
  const [sortDirection, setSortDirection] = useState('asc');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'Администратор';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        setBooks(response.data.books);
        setFilteredBooks(response.data.books);
      } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
        toast.error('Ошибка при загрузке книг');
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book => 
      book.Название.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.Описание.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.ISBN.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const handleSort = (field) => {
    setSortField(field);
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleAdd = () => {
    setEditBook(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (book) => {
    setEditBook(book);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/books/${bookToDelete.КодКниги}`);
      toast.success('Книга успешно удалена');
      const updatedBooks = books.filter(book => book.КодКниги !== bookToDelete.КодКниги);
      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks);
    } catch (error) {
      console.error('Ошибка при удалении книги:', error);
      toast.error('Ошибка при удалении книги');
    } finally {
      setDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  const handleSave = async (formData) => {
    try {
      const data = {
        Название: formData.Название,
        Описание: formData.Описание,
        ГодИздания: formData.ГодИздания,
        ISBN: formData.ISBN,
        Статус: formData.Статус
      };

      if (editBook) {
        await axios.put(`/api/books/${editBook.КодКниги}`, data);
        toast.success('Книга успешно обновлена');
        const updatedBooks = books.map(book => 
          book.КодКниги === editBook.КодКниги ? { ...book, ...data } : book
        );
        setBooks(updatedBooks);
        setFilteredBooks(updatedBooks);
      } else {
        const response = await axios.post('/api/books', data);
        toast.success('Книга успешно добавлена');
        setBooks([...books, response.data]);
        setFilteredBooks([...filteredBooks, response.data]);
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении книги:', error);
      toast.error('Ошибка при сохранении книги');
    }
  };

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (a[sortField] < b[sortField]) return -1 * direction;
    if (a[sortField] > b[sortField]) return 1 * direction;
    return 0;
  });

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
        {isAdmin && (
          <AddButton onClick={handleAdd}>
            <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
            Добавить книгу
          </AddButton>
        )}
      </div>
      <BooksTable>
        <thead>
          <tr>
            <TableHeader onClick={() => handleSort('Название')}>
              Название
              {sortField === 'Название' && (
                sortDirection === 'asc' ? '↑' : '↓'
              )}
            </TableHeader>
            <TableHeader onClick={() => handleSort('Описание')}>
              Описание
              {sortField === 'Описание' && (
                sortDirection === 'asc' ? '↑' : '↓'
              )}
            </TableHeader>
            <TableHeader onClick={() => handleSort('ГодИздания')}>
              Год издания
              {sortField === 'ГодИздания' && (
                sortDirection === 'asc' ? '↑' : '↓'
              )}
            </TableHeader>
            <TableHeader onClick={() => handleSort('ISBN')}>
              ISBN
              {sortField === 'ISBN' && (
                sortDirection === 'asc' ? '↑' : '↓'
              )}
            </TableHeader>
            <TableHeader onClick={() => handleSort('Статус')}>
              Статус
              {sortField === 'Статус' && (
                sortDirection === 'asc' ? '↑' : '↓'
              )}
            </TableHeader>
            {isAdmin && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {sortedBooks.map(book => (
            <tr key={book.КодКниги}>
              <td>{book.Название}</td>
              <td>{book.Описание}</td>
              <td>{book.formattedYear || book.ГодИздания}</td>
              <td>{book.ISBN}</td>
              <td>{book.Статус}</td>
              {isAdmin && (
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
              )}
            </tr>
          ))}
        </tbody>
      </BooksTable>

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

export default BooksPage;
