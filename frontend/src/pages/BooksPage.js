import React from 'react';
import styled from 'styled-components';
import { Table, TableContainer, PageHeader, Controls, SearchInput, ActionButton } from '../components/StyledTable';

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
      <TableContainer>
        <Table>
          <Title>Книги</Title>
        </Table>
      </TableContainer>
      {/* Здесь будет содержимое страницы книг */}
    </Container>
  );
};

export default BooksPage;
