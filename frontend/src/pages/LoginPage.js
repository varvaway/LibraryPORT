import React from 'react';
import styled from 'styled-components';
import LoginModal from '../components/LoginModal';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const LoginPage = () => {
  return (
    <Container>
      <LoginModal isOpen={true} />
    </Container>
  );
};

export default LoginPage;
