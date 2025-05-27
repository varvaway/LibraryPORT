import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.mahogany};
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  
  img {
    height: 50px;
  }
  
  span {
    color: white;
    font-size: 1.8rem;
    font-weight: 500;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 3rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.4rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const AuthSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: 1px solid white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: transparent;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  img {
    width: 20px;
    height: 20px;
    filter: invert(1);
  }
  
  &:hover {
    background-color: white;
    color: ${({ theme }) => theme.colors.mahogany};
    
    img {
      filter: none;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  span {
    color: #927D14;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  text-align: center;

  h3 {
    color: #6b4423;
    margin-bottom: 20px;
    font-size: 1.5em;
  }

  div {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 25px;
  }

  button {
    padding: 10px 25px;
    font-size: 1.1em;
  }
`;

const Header = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo onClick={goHome}>
            <img src={logo} alt="Библиотека" />
            <span>Библиотека</span>
          </Logo>
          
          <Navigation>
            <NavLink to="/catalog">Каталог</NavLink>
            <NavLink to="/multimedia">Мультимедийные ресурсы</NavLink>
          </Navigation>

          <AuthSection>
            {user ? (
              <UserInfo>
                <span>{user.name} {user.surname}</span>
                {user.role === 'Администратор' ? (
                  <NavLink to="/admin">Панель администратора</NavLink>
                ) : (
                  <NavLink to="/profile">Личный кабинет</NavLink>
                )}
                <Button onClick={handleLogoutClick}>
                  <img 
                    src={`${process.env.PUBLIC_URL}/icons/${user.role === 'Администратор' ? 'admin.png' : 'reader.png'}`} 
                    alt={user.role === 'Администратор' ? 'Администратор' : 'Читатель'} 
                  />
                  Выйти
                </Button>
              </UserInfo>
            ) : (
              <Button onClick={onLoginClick}>
                <img src={`${process.env.PUBLIC_URL}/icons/open-book.png`} alt="Войти" />
                Войти
              </Button>
            )}
          </AuthSection>
        </HeaderContent>
      </HeaderContainer>
      {showLogoutConfirm && (
        <Overlay>
          <Dialog>
            <h3>Вы точно хотите выйти?</h3>
            <div>
              <Button style={{ background: 'white', color: '#442727', borderColor: 'white' }} onClick={handleConfirmLogout}>Да</Button>
              <Button style={{ background: '#442727', color: 'white', borderColor: '#442727' }} onClick={handleCancelLogout}>Нет</Button>
            </div>
          </Dialog>
        </Overlay>
      )}
    </>
  );
};

export default Header;