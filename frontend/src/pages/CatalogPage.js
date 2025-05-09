import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';

const CatalogContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
`;

const Sidebar = styled.div`
  width: 350px;
  flex-shrink: 0;
`;

const MainContent = styled.div`
  flex-grow: 1;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.mahogany};
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  
  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.lightGray};
    border-radius: 4px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    border: none;
    background: ${({ theme }) => theme.colors.mahogany};
    color: white;
    cursor: pointer;
    
    &:hover {
      background: ${({ theme }) => theme.colors.darkMahogany};
    }
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
    transform: translateY(-2px);
  }
  
  img {
    width: 64px;
    height: 64px;
    margin-bottom: 0.5rem;
  }
  
  span {
    font-size: 1.1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.darkGray};
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
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin: 0.25rem 0;
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${({ $primary, theme }) => 
    $primary ? theme.colors.mahogany : 'transparent'};
  color: ${({ $primary, theme }) => 
    $primary ? 'white' : theme.colors.mahogany};
  border: 1px solid ${({ theme }) => theme.colors.mahogany};
  
  &:hover {
    background-color: ${({ $primary, theme }) => 
      $primary ? theme.colors.darkMahogany : theme.colors.lightMahogany};
    color: white;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const AddButton = styled(Button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
`;

const CatalogPage = () => {
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'Администратор';
  
  const categories = [
    { id: 1, name: 'Категория 1', icon: '/ic_1.png' },
    { id: 2, name: 'Категория 2', icon: '/ic_2.png' },
    { id: 3, name: 'Категория 3', icon: '/ic_3png.png' },
    { id: 4, name: 'Категория 4', icon: '/ic_4.png' },
    { id: 5, name: 'Категория 5', icon: '/ic_5.png' },
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        setBooks(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleReserve = async (book) => {
    try {
      await axios.post('/api/reservations', { bookId: book.id });
      setSelectedBook(book);
      setModalMessage(`Вы забронировали книгу "${book.title}" (${book.author}). Приходите за ней до конца рабочего дня.`);
      setShowModal(true);
    } catch (error) {
      console.error('Ошибка при бронировании:', error);
      setModalMessage('Произошла ошибка при бронировании книги. Попробуйте позже.');
      setShowModal(true);
    }
  };

  const handleEdit = (book) => {
    // TODO: Implement edit functionality
    console.log('Edit book:', book);
  };

  const handleDelete = async (book) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
      try {
        await axios.delete(`/api/books/${book.id}`);
        setBooks(books.filter(b => b.id !== book.id));
      } catch (error) {
        console.error('Ошибка при удалении книги:', error);
      }
    }
  };

  const handleAdd = () => {
    // TODO: Implement add functionality
    console.log('Add new book');
  };

  return (
    <CatalogContainer>
      <Sidebar>
        <Title>Категории</Title>
        <CategoryList>
          {categories.map(category => (
            <CategoryItem
              key={category.id}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
            >
              <img src={category.icon} alt={category.name} />
              <span>{category.name}</span>
            </CategoryItem>
          ))}
        </CategoryList>
        {isAdmin && (
          <Button
            style={{ marginTop: '1rem', width: '100%' }}
            onClick={() => console.log('Edit categories')}
          >
            Изменить категории
          </Button>
        )}
      </Sidebar>
      
      <MainContent>
        <SearchBar>
          <input
            type="text"
            placeholder="Поиск книг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => {}}>Поиск</button>
        </SearchBar>
      
        <BooksGrid>
          {books
            .filter(book => 
              (!searchQuery || 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase())
              ) &&
              (!selectedCategory || book.categoryId === selectedCategory)
            )
            .map(book => (
              <BookCard key={book.id}>
                <h3>{book.title}</h3>
                <p>Автор: {book.author}</p>
                <p>Год издания: {book.year}</p>
                <p>Жанр: {book.genre}</p>
                <ButtonGroup>
                  {isAdmin ? (
                    <>
                      <Button onClick={() => handleEdit(book)}>Редактировать</Button>
                      <Button onClick={() => handleDelete(book)}>Удалить</Button>
                    </>
                  ) : (
                    user ? (
                      <Button $primary onClick={() => handleReserve(book)}>Забронировать</Button>
                    ) : null
                  )}
                </ButtonGroup>
              </BookCard>
            ))}
        </BooksGrid>

        {isAdmin && (
          <AddButton $primary onClick={handleAdd}>
            Добавить новую книгу
          </AddButton>
        )}
      </MainContent>

      {showModal && (
        <>
          <Overlay onClick={() => setShowModal(false)} />
          <Modal>
            <p>{modalMessage}</p>
            <Button $primary onClick={() => setShowModal(false)}>OK</Button>
          </Modal>
        </>
      )}
    </CatalogContainer>
  );
};

export default CatalogPage;
