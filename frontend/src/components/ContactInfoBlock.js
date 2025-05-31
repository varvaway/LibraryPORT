import React from 'react';
import styled from 'styled-components';

const Block = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  margin: 40px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.mahogany};
  font-size: 2.2rem;
  margin-bottom: 24px;
  text-align: center;
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding-left: 50px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding-left: 20px;
  }
`;

const ContactItem = styled.div`
  margin-bottom: 24px;
  font-size: 1.6rem;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.pistachioCream};
    margin-bottom: 8px;
  }
`;

const ConvertImage = styled.img`
  position: absolute;
  bottom: 32px;
  right: 32px;
  width: 240px;
  height: auto;
`;

const SocialLink = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    font-size: 1.4rem;

    &:hover {
      opacity: 0.8;
    }
  }

  img {
    width: 32px;
    height: 32px;
    transition: opacity 0.2s;
  }
`;

export default function ContactInfoBlock() {
  return (
    <Block>
      <Title>Контактная информация</Title>
      <InfoSection>
        <div>
          <ContactItem>
            <strong>Адрес:</strong>
            Большой пр. ПС, 9/18 (4-й этаж)
          </ContactItem>
          <ContactItem>
            <strong>Телефон:</strong>
            8 (812) 235-35-96
          </ContactItem>
          <ContactItem>
            <strong>E-mail:</strong>
            gadarars@email.ru
          </ContactItem>
          <ContactItem>
            <strong>Социальные сети:</strong>
            <SocialLink>
              <a 
                href="https://vk.com/gaidaralib" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img src="/icons/vk.png" alt="VK" />
                <span>gaidaralib</span>
              </a>
            </SocialLink>
            <SocialLink>
              <a 
                href="https://t.me/gaidarlibrary" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img src="/icons/telegram.png" alt="Telegram" />
                <span>gaidarlibrary</span>
              </a>
            </SocialLink>
          </ContactItem>
        </div>
        <div>
          <ContactItem>
            <strong>Режим работы:</strong>
            Понедельник – пятница: 12:00–20:00<br />
            Суббота: 11:00–19:00<br />
            Выходные дни: воскресенье<br />
            Санитарный день – <strong>последний четверг месяца</strong>
          </ContactItem>
        </div>
      </InfoSection>
      <ConvertImage src="/images/convert.png" alt="Convert" />
    </Block>
  );
}