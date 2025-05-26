import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

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

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  
  h1 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 2rem;
  }
`;

const CategoriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  width: 300px;
`;

const CategoryButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.mahogany : props.theme.colors.darkGray};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.mahogany};
  }
  
  img {
    width: 32px;
    height: 32px;
    margin-bottom: 0.5rem;
    opacity: ${props => props.$active ? 1 : 0.7};
  }
  
  span {
    font-size: 0.9rem;
    font-weight: ${props => props.$active ? 'bold' : 'normal'};
  }
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
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${props => props.$expanded && `
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  `}
  
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
  
  .description {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${({ theme }) => theme.colors.lightGray};
    display: ${props => props.$expanded ? 'block' : 'none'};
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

// Устанавливаем корневой элемент для модальных окон
Modal.setAppElement('#root');

const AddButton = styled(Button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
`;

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '90%',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

const CatalogPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedBookId, setExpandedBookId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';
  
  const filteredBooks = books.filter(book => 
    (!searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    ) &&
    (!selectedCategory || book.categoryId === selectedCategory)
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        setBooks(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

    fetchBooks();
    fetchCategories();
  }, []);

  const handleReserve = async (book) => {
    try {
      await axios.post('/api/reservations', { bookId: book.id });
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
    <Container>
      <div>
        <h1>Каталог книг</h1>
        <CategoriesContainer>
          {categories.map((category) => (
            <CategoryButton 
              key={category.id}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
              $active={category.id === selectedCategory}
            >
              <img src={`/ic_${category.id}.png`} alt={category.name} />
              <span>{category.name}</span>
            </CategoryButton>
          ))}
        </CategoriesContainer>
      </div>

      <MainContent>
        <SearchBar>
          <input
            type="text"
            placeholder="Поиск книг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <BooksGrid>
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id}
              onClick={() => setExpandedBookId(book.id === expandedBookId ? null : book.id)}
              $expanded={book.id === expandedBookId}
            >
              <h3>{book.title}</h3>
              <p>Автор: {book.author}</p>
              <p>Год: {book.year}</p>
              {book.id === expandedBookId && (
                <div className="description">
                  <p>{book.description}</p>
                </div>
              )}
              <ButtonGroup>
                <Button onClick={(e) => {
                  e.stopPropagation();
                  handleReserve(book);
                }}>
                  Забронировать
                </Button>
              </ButtonGroup>
            </BookCard>
          ))}
        </BooksGrid>
      </MainContent>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Сообщение"
        style={modalStyles}
      >
        <h2>{modalMessage}</h2>
        <Button onClick={() => setShowModal(false)}>Закрыть</Button>
      </Modal>
    </Container>
  );
};

export default CatalogPage;
