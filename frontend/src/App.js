import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ReadersPage from './pages/ReadersPage';
import ReaderDetailsPage from './pages/ReaderDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import CatalogPage from './pages/CatalogPage';
import MultimediaPage from './pages/MultimediaPage';
import BooksPage from './pages/BooksPage';
import ReservationsPage from './pages/ReservationsPage';
import LoginPage from './pages/LoginPage';
import ReaderProfilePage from './pages/ReaderProfilePage';

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
        
        <div className="App">
          <Header onLoginClick={handleLoginClick} />
          
          <main style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto' }}>
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
                path="/readers" 
                element={
                  <ProtectedRoute requiredRole="Администратор">
                    <ReadersPage />
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