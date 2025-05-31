import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.mahogany};
`;

const SearchBar = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
  font-size: 1rem;
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.mahogany};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.darkMahogany};
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const BookCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BookActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &.edit {
    background: #f0ad4e;
    color: white;
    
    &:hover {
      background: #ec971f;
    }
  }
  
  &.delete {
    background: #d9534f;
    color: white;
    
    &:hover {
      background: #c9302c;
    }
  }
`;

const CategoryList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.mahogany};
  border-radius: 20px;
  background: ${({ active, theme }) => active ? theme.colors.mahogany : 'white'};
  color: ${({ active }) => active ? 'white' : '#666'};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.mahogany};
    color: white;
  }
`;

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Загрузка книг и категорий при монтировании
    loadBooks();
    loadCategories();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await axios.get('/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке книг:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    }
  };

  const handleAddBook = () => {
    // TODO: Реализовать добавление книги
  };

  const handleEditBook = (bookId) => {
    // TODO: Реализовать редактирование книги
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      try {
        await axios.delete(`/api/books/${bookId}`);
        loadBooks(); // Перезагрузить список книг
      } catch (error) {
        console.error('Ошибка при удалении книги:', error);
      }
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container>
      <Header>
        <Title>Управление книгами</Title>
        <SearchBar
          type="text"
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <AddButton onClick={handleAddBook}>Добавить новую книгу</AddButton>
      </Header>

      <CategoryList>
        <CategoryButton
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        >
          Все категории
        </CategoryButton>
        {categories.map(category => (
          <CategoryButton
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </CategoryButton>
        ))}
      </CategoryList>

      <BooksGrid>
        {filteredBooks.map(book => (
          <BookCard key={book.id}>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>Категория: {book.category}</p>
            <BookActions>
              <ActionButton
                className="edit"
                onClick={() => handleEditBook(book.id)}
              >
                Редактировать
              </ActionButton>
              <ActionButton
                className="delete"
                onClick={() => handleDeleteBook(book.id)}
              >
                Удалить
              </ActionButton>
            </BookActions>
          </BookCard>
        ))}
      </BooksGrid>
    </Container>
  );
};

export default AdminBooksPage;
