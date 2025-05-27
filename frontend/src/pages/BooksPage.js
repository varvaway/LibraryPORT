import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const BooksPage = () => {
  return (
    <Container>
      <Title>Книги</Title>
      {/* Здесь будет содержимое страницы книг */}
    </Container>
  );
};

export default BooksPage;
