import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import Header from './components/Header';
import LibraryIntro from './components/LibraryIntro';
import BecomeReaderForm from './components/BecomeReaderForm';
import ContactInfoBlock from './components/ContactInfoBlock';
import MapPlaceholder from './components/MapPlaceholder';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import AdminPage from './pages/AdminPage';
import ReaderPage from './pages/ReaderPage';
import ReservationsPage from './pages/ReservationsPage';
import ReadersPage from './pages/ReadersPage';
import ReaderDetailsPage from './pages/ReaderDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import CatalogPage from './pages/CatalogPage';
import MultimediaPage from './pages/MultimediaPage';
import BooksPage from './pages/BooksPage';
import LoginPage from './pages/LoginPage';
import ReaderProfilePage from './pages/ReaderProfilePage';
import AdminBooksPage from './pages/AdminBooksPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const HomePage = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    return (
      <>
        <LibraryIntro />
        {!user && <BecomeReaderForm />}
        <ContactInfoBlock />
        <MapPlaceholder />
      </>
    );
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header onLoginClick={handleLoginClick} />
          
          <main style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto', flex: '1 0 auto' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/multimedia" element={<MultimediaPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/books" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <AdminBooksPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/multimedia" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <MultimediaPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reservations" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <ReservationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/readers" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <ReadersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <AdminCategoriesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reader" 
                element={
                  <ProtectedRoute requiredRole="Пользователь">
                    <ReaderPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requiredRole="Пользователь">
                    <ReaderProfilePage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>

          <Footer />
          
          <LoginModal 
            isOpen={isLoginModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;