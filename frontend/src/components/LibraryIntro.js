import React from 'react';
import styled from 'styled-components';

const IntroContainer = styled.div`
  position: relative;
  padding: 170px 50px;
  text-align: center;
  background: url('/images/library-bg.jpg') center/cover no-repeat;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.6);
    z-index: 1;
  }
`;

const Title = styled.h1`
  font-size: 3em;
  color: #2c1810;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Description = styled.p`
  font-size: 1.6em;
  color: #2c1810;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  position: relative;
  z-index: 2;
`;

const WelcomeText = styled.p`
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

const LibraryIntro = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <IntroContainer>
      {user ? (
        <WelcomeText>
          Добро пожаловать в нашу библиотеку!
        </WelcomeText>
      ) : (
        <>
          <Title>Юношеская библиотека им. А. П. Гайдара</Title>
          <Description>
            Юношеская библиотека имени Аркадия Петровича Гайдара — одна из старейших библиотек Петроградского района. 
            Благодаря сотрудникам библиотеки здесь сохранились исторические помещения с подлинной лепниной и прекрасными печами, 
            а также уникальный балкон.
          </Description>
        </>
      )}
    </IntroContainer>
  );
};

export default LibraryIntro;