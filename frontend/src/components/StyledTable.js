import styled from 'styled-components';

// Стилизованная таблица, которую можно использовать во всех разделах
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #e9ecef;
    }
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background-color: #f8f9fa;
  }
`;

// Контейнер для таблицы с горизонтальной прокруткой
export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  margin-top: 20px;
`;

// Контейнер для верхней части страницы (заголовок + кнопки/поиск)
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
`;

// Контейнер для элементов управления (поиск, кнопки)
export const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

// Поле поиска
export const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

// Кнопка действия (добавить, редактировать и т.д.)
export const ActionButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.$primary ? '#0066cc' : '#fff'};
  color: ${props => props.$primary ? '#fff' : '#0066cc'};
  border: 1px solid #0066cc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.$primary ? '#0052a3' : '#f0f7ff'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
