import React from 'react';
import styled from 'styled-components';

const IntroSection = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.colors.lightCamel};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.mahogany};
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeText = styled.p`
  color: ${({ theme }) => theme.colors.mahogany};
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
`;

const LibraryIntro = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <IntroSection>
      {user ? (
        <WelcomeText>
          Добро пожаловать, {user.name} {user.surname}!
        </WelcomeText>
      ) : (
        <Title>Юношеская библиотека им. А. П. Гайдара</Title>
      )}
      <Description>
        Юношеская библиотека имени Аркадия Петровича Гайдара — одна из старейших библиотек Петроградского района. Благодаря сотрудникам библиотеки здесь сохранились исторические помещения с подлинной лепниной и прекрасными печами, а также уникальный балкон.
      </Description>
    </IntroSection>
  );
};

export default LibraryIntro;