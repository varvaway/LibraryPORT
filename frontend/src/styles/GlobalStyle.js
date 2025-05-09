import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Lovelace';
    src: url('/fonts/Lovelace.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-size: ${({ theme }) => theme.fonts.baseSize};
  }
  @font-face {
    font-family: 'Moiamova';
    src: url('/fonts/Moiamova.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  body {
    background: ${({ theme }) => theme.colors.whiteSmoke};
    color: ${({ theme }) => theme.colors.mahogany};
    font-family: 'Moiamova', Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lovelace', serif;
    color: ${({ theme }) => theme.colors.mahogany};
    margin: 0;
  }
`; 