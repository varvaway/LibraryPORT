import React from 'react';
import styled from 'styled-components';

const FooterBlock = styled.footer`
  background: ${({ theme }) => theme.colors.mahogany};
  color: ${({ theme }) => theme.colors.whiteSmoke};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.95rem;
  text-align: center;
  padding: 18px 0 12px 0;
  flex-shrink: 0;
`;

export default function Footer() {
  return (
    <FooterBlock>
      © 2025 ООО "Варвара@Со" Все права защищены. Перепечатка и любое использование материалов возможно только при наличии ссылки на первоисточник.
    </FooterBlock>
  );
} 