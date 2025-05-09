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
  
  &:hover {
    background-color: white;
    color: ${({ theme }) => theme.colors.mahogany};
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

const Header = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const goHome = () => {
    navigate('/');
  };

  return (
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
                <NavLink to="/reader">Личный кабинет</NavLink>
              )}
              <Button onClick={handleLogout}>Выйти</Button>
            </UserInfo>
          ) : (
            <Button onClick={onLoginClick}>Войти</Button>
          )}
        </AuthSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;