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
    font-family: 'Catrinity';
    src: url('/fonts/Catrinity.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
    background: ${({ theme }) => theme.colors.whiteSmoke};
    color: ${({ theme }) => theme.colors.mahogany};
    font-family: 'Catrinity', Arial, sans-serif;
    display: flex;
    flex-direction: column;
  }
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lovelace', serif;
    color: ${({ theme }) => theme.colors.mahogany};
    margin: 0;
  }
`; 