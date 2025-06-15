import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 0.75rem;

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
    color: #333;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.$primary ? '#45a049' : '#d32f2f'};
  }
`;

const EditBookModal = ({ isOpen, onClose, onSave, book, categories = [], statusOptions = ['Доступна', 'Забронирована'] }) => {
  const [formData, setFormData] = useState({
    КодКниги: '',
    Название: '',
    Автор: '',
    ГодИздания: '',
    ISBN: '',
    Описание: '',
    Категория: '',
    Статус: 'Доступна'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when book prop changes
  useEffect(() => {
    if (book) {
      console.log('Editing book:', book);
      setFormData({
        КодКниги: book.КодКниги || book.id || '',
        Название: book.Название || book.title || '',
        Автор: book.Автор || book.author || '',
        ГодИздания: book.ГодИздания || book.year || '',
        ISBN: book.ISBN || book.isbn || '',
        Описание: book.Описание || book.description || '',
        Категория: book.Категория?.КодКатегории || book.categoryId || book.category?.id || '',
        Статус: book.Статус || book.status || 'Доступна'
      });
    } else {
      // Reset form for new book
      setFormData({
        КодКниги: '',
        Название: '',
        Автор: '',
        ГодИздания: '',
        ISBN: '',
        Описание: '',
        Категория: '',
        Статус: 'Доступна'
      });
    }
  }, [book]);

  // Debug categories when they change
  useEffect(() => {
    console.log('Categories in EditBookModal:', categories);
    if (categories && categories.length > 0) {
      console.log('First category sample:', categories[0]);
      console.log('Category fields:', Object.keys(categories[0]));
    }
  }, [categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <h2>{book ? 'Редактирование книги' : 'Создание новой книги'}</h2>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Название</label>
            <Input
              type="text"
              name="Название"
              value={formData.Название}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Автор</label>
            <Input
              type="text"
              name="Автор"
              value={formData.Автор}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Год издания</label>
            <Input
              type="number"
              name="ГодИздания"
              value={formData.ГодИздания}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label>ISBN</label>
            <Input
              type="text"
              name="ISBN"
              value={formData.ISBN}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Описание</label>
            <Input
              as="textarea"
              rows="3"
              name="Описание"
              value={formData.Описание}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <label>Статус</label>
            <select 
              name="Статус"
              value={formData.Статус}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1rem',
                backgroundColor: '#fff'
              }}
              required
            >
              <option value="">Выберите статус</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Категория</label>
            <select 
              name="Категория"
              value={formData.Категория || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                backgroundColor: '#fff',
                fontSize: '0.9rem',
                height: '38px',
                boxSizing: 'border-box'
              }}
              disabled={isLoading}
            >
              <option key="default" value="">Выберите категорию</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories
                  .filter(cat => cat && (cat.КодКатегории || cat.id))
                  .map(category => {
                    const categoryId = category.КодКатегории || category.id;
                    const categoryName = category.Название || category.name || 'Без названия';
                    return (
                      <option 
                        key={`cat-${categoryId}`} 
                        value={categoryId}
                      >
                        {categoryName}
                      </option>
                    );
                  })
              ) : (
                <option disabled>Нет доступных категорий</option>
              )}
            </select>
            {isLoading && <div>Загрузка категорий...</div>}
            {!isLoading && (!categories || categories.length === 0) && (
              <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Нет доступных категорий
              </div>
            )}
          </FormGroup>


          <ButtonGroup>
            <Button type="submit" $primary>Сохранить</Button>
            <Button type="button" onClick={onClose}>Отмена</Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default EditBookModal;
