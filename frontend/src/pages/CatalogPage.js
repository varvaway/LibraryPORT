import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const CatalogContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  max-width: 90vw;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background || '#f8f8f8'};
  margin: 0;
  padding: 0;
`;

const Sidebar = styled.div`
  width: 190px;
  flex-shrink: 0;
  margin: 0;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: 2rem 0 2rem 0.5rem;
`;

//const Container = styled.div`
//  padding: 2rem 0 2rem 0;
//  max-width: 1910px;
//  margin: 0 auto;
//  display: flex;
//  gap: 4rem;
//  h1 {
//    color: ${({ theme }) => theme.colors.mahogany};
//    margin-bottom: 2rem;
//  }
//`;

const CategoriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
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
    width: 56px;
    height: 56px;
    margin-bottom: 0.5rem;
    opacity: ${props => props.$active ? 1 : 0.7};
  }
  
  span {
    font-size: 1.05rem;
    font-weight: ${props => props.$active ? 'bold' : 'normal'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 2rem 1rem 2rem 5rem;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.mahogany};
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 2.5rem;
  display: flex;
  gap: 1rem;
  max-width: 400px;
  width: 100%;
  
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
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

const BookCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0.7rem 0.7rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 0.9rem;
  
  ${props => props.$expanded && `
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  `}
  
  h3 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 0.3rem;
    font-size: 1rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin: 0.12rem 0;
    font-size: 0.9rem;
  }
  
  .description {
    border-top: 1px solid #e0e0e0;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    color: #444;
    font-size: 0.92rem;
    background: #faf9f7;
    border-radius: 0 0 8px 8px;
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
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '400px',
    width: '90%',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(2px)',
    zIndex: 1000,
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
  const [userBookings, setUserBookings] = useState([]);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';
  
  // Получаем активные бронирования пользователя
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user || !user.id) return;
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get('/api/bookings/reader', { headers });
        if (response.data.success) {
          // Собираем id всех книг из активных бронирований
          const activeBookIds = response.data.bookings
            .filter(b => b.status === 'Активно')
            .flatMap(b => b.books.map(book => book.id));
          setUserBookings(activeBookIds);
        }
      } catch (e) {
        setUserBookings([]);
      }
    };
    fetchUserBookings();
  }, []);

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
    // Проверяем наличие токена перед отправкой запроса
    const token = localStorage.getItem('token');
    if (!token) {
      setModalMessage('Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.');
      setShowModal(true);
      return;
    }

    try {
      await axios.post('/api/reservations', { bookId: book.id });
      setModalMessage(`Вы забронировали книгу "${book.title}" (${book.author}). Приходите за ней до конца рабочего дня.`);
      setShowModal(true);
    } catch (error) {
      console.error('Ошибка при бронировании:', error);
      console.log('Ответ сервера:', error.response);
      console.log('Данные ответа:', error.response?.data);
      
      // Используем сообщение от сервера, если оно есть
      const errorMessage = error.response?.data?.message || 'Произошла ошибка при бронировании книги. Попробуйте позже.';
      console.log('Сообщение об ошибке:', errorMessage);
      
      setModalMessage(errorMessage);
      setShowModal(true);

      // Если ошибка 401, удаляем токен
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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

  // Добавим функцию для определения причины недоступности
  const getUnavailableReason = (book) => {
    if (book.status !== 'Доступна') return 'Книга уже забронирована';
    return '';
  };

  // Функция для расчета времени выдачи
  const getPickupTime = () => {
    const now = new Date();
    const day = now.getDay(); // 0 - воскресенье
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLastThursday = (() => {
      const d = new Date(now);
      d.setDate(1);
      let lastThursday = 0;
      for (let i = 1; i <= 31; i++) {
        d.setDate(i);
        if (d.getMonth() !== now.getMonth()) break;
        if (d.getDay() === 4) lastThursday = i;
      }
      return now.getDate() === lastThursday;
    })();

    // Выходные: воскресенье и последний четверг месяца
    if (day === 0 || isLastThursday) {
      return { day: 'выходной', text: 'Сегодня библиотека не работает' };
    }
    // Суббота
    if (day === 6) {
      if (hour < 17) {
        if (hour < 17) {
          const pickupHour = hour + 2 <= 19 ? hour + 2 : 19;
          if (pickupHour <= 19) {
            return { day: 'today', text: `СЕГОДНЯ до ${pickupHour}:00` };
          }
        }
      }
      return { day: 'tomorrow', text: 'ЗАВТРА с 12:00' };
    }
    // Пн-Пт
    if (day >= 1 && day <= 5) {
      if (hour < 18) {
        const pickupHour = hour + 2 <= 20 ? hour + 2 : 20;
        if (pickupHour <= 20) {
          return { day: 'today', text: `СЕГОДНЯ до ${pickupHour}:00` };
        }
      }
      return { day: 'tomorrow', text: 'ЗАВТРА с 12:00' };
    }
    return { day: 'unknown', text: '' };
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [unavailableReason, setUnavailableReason] = useState('');

  const handleBookCardClick = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const handleReserveClick = (book) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setModalMessage('Бронировать книги могут только зарегистрированные пользователи. Зарегистрируйтесь, чтобы погрузиться в мир чтения.');
      setShowModal(true);
      setShowConfirmModal(false);
      setSuccessMessage('');
      setSelectedBook(null);
      return;
    }
    setSelectedBook(book);
    setShowConfirmModal(true);
    setShowModal(false);
    setSuccessMessage('');
  };

  // Вынести обновление книг и бронирований в отдельную функцию
  const fetchBooksAndBookings = async () => {
    const response = await axios.get('/api/books');
    setBooks(response.data);
    if (user && user.id) {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const bookingsResp = await axios.get('/api/bookings/reader', { headers });
      if (bookingsResp.data.success) {
        const activeBookIds = bookingsResp.data.bookings
          .filter(b => b.status === 'Активно')
          .flatMap(b => b.books.map(book => book.id));
        setUserBookings(activeBookIds);
      }
    }
  };

  const handleConfirmReserve = async () => {
    if (!selectedBook) return;
    // Проверка на фронте перед отправкой запроса
    if (userBookings.includes(selectedBook.id) || selectedBook.status !== 'Доступна') {
      setSuccessMessage('Книга уже недоступна для бронирования. Обновите страницу.');
      setShowConfirmModal(false);
      setShowModal(false);
      await fetchBooksAndBookings();
      return;
    }
    try {
      await handleReserve(selectedBook);
      const pickup = getPickupTime();
      setSuccessMessage(`Книга "${selectedBook.title}" (${selectedBook.author}) забронирована! Заберите её из библиотеки ${pickup.text}`);
      setShowConfirmModal(false);
      setShowModal(false);
      await fetchBooksAndBookings();
    } catch (e) {
      setSuccessMessage('Книга уже недоступна для бронирования. Обновите страницу.');
      await fetchBooksAndBookings();
    }
  };

  return (
    <CatalogContainer>
      <Sidebar>
        <h1 style={{marginBottom: '2rem', fontSize: '1.5rem', textAlign: 'left'}}>Категории</h1>
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
      </Sidebar>
      <MainContent>
        <h1 style={{marginBottom: '1.5rem', fontSize: '1.7rem', textAlign: 'left'}}>Каталог книг</h1>
        <SearchBar>
          <input
            type="text"
            placeholder="Поиск книг..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
        <BooksGrid>
          {filteredBooks.map((book) => {
            const isAvailable = book.status === 'Доступна' && !userBookings.includes(book.id);
            return (
              <BookCard
                key={book.id}
                onClick={() => handleBookCardClick(book.id)}
                style={{
                  opacity: isAvailable ? 1 : 0.5,
                  cursor: 'pointer',
                  pointerEvents: isAvailable ? 'auto' : 'none',
                }}
              >
                <h3>{book.title}</h3>
                <p>Автор: {book.author}</p>
                <p>Год: {book.year}</p>
                {!isAvailable && (
                  <p style={{ color: '#b22222', fontWeight: 'bold' }}>
                    {userBookings.includes(book.id) ? 'Вы уже забронировали эту книгу' : getUnavailableReason(book)}
                  </p>
                )}
                {expandedBookId === book.id && (
                  <div className="description">
                    <p>{book.description}</p>
                  </div>
                )}
                <ButtonGroup>
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      handleReserveClick(book);
                    }}
                    disabled={!isAvailable}
                  >
                    Забронировать
                  </Button>
                </ButtonGroup>
              </BookCard>
            );
          })}
        </BooksGrid>
      </MainContent>
      <Modal
        isOpen={showModal || showConfirmModal || !!successMessage}
        onRequestClose={() => {
          setShowModal(false);
          setShowConfirmModal(false);
          setSuccessMessage('');
          setUnavailableReason('');
          setSelectedBook(null);
          setModalMessage('');
        }}
        contentLabel="Сообщение"
        style={modalStyles}
      >
        {/* Сообщение для неавторизованных пользователей */}
        {modalMessage && (
          <>
            <h2 style={{ color: '#333', fontSize: '1.3rem', marginBottom: '10px', fontWeight: '500', lineHeight: '1.4' }}>
              {modalMessage}
            </h2>
            <Button 
              onClick={() => {
                setShowModal(false);
                setModalMessage('');
              }}
              style={{ marginTop: '10px', padding: '10px 25px', fontSize: '1rem' }}
            >
              Закрыть
            </Button>
          </>
        )}
        {/* Подтверждение бронирования */}
        {!modalMessage && showConfirmModal && selectedBook && (
          <>
            <h2>Вы хотите забронировать книгу?</h2>
            <p><b>{selectedBook.title}</b> — {selectedBook.author}</p>
            <ButtonGroup>
              <Button $primary onClick={async () => {
                await handleConfirmReserve();
                if (window.updateReservations) window.updateReservations();
              }}>Да</Button>
              <Button onClick={() => {
                setShowConfirmModal(false);
                setSelectedBook(null);
              }}>Нет</Button>
            </ButtonGroup>
          </>
        )}
        {/* Успешное бронирование */}
        {!modalMessage && !!successMessage && (
          <>
            <h2>Успешно!</h2>
            <p>{successMessage}</p>
            <Button onClick={() => {
              setSuccessMessage('');
              setSelectedBook(null);
            }}>OK</Button>
          </>
        )}
      </Modal>
    </CatalogContainer>
  );
};

export default CatalogPage;
