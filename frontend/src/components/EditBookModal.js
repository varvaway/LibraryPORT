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
  padding: 2rem;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

const EditBookModal = ({ isOpen, onClose, onSave, book }) => {
  const [formData, setFormData] = useState({
    КодКниги: '',
    Название: '',
    Описание: '',
    ГодИздания: '',
    ISBN: '',
    Статус: '',
    Категория: ''
  });

  useEffect(() => {
    if (book) {
      setFormData({
        КодКниги: book.КодКниги,
        Название: book.Название,
        Описание: book.Описание,
        ГодИздания: book.ГодИздания,
        ISBN: book.ISBN,
        Статус: book.Статус,
        Категория: book.Категория
      });
    } else {
      setFormData({
        КодКниги: '',
        Название: '',
        Описание: '',
        ГодИздания: '',
        ISBN: '',
        Статус: '',
        Категория: ''
      });
    }
  }, [book]);

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
        <h2>{book ? 'Редактирование книги' : 'Добавление книги'}</h2>
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
            <label>Описание</label>
            <Input
              type="text"
              name="Описание"
              value={formData.Описание}
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
            <label>Категория</label>
            <select
              name="Категория"
              value={formData.Категория}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
              <option value="">Выберите категорию</option>
              <option value="1">Роман</option>
              <option value="2">Детектив</option>
              <option value="3">Научная фантастика</option>
              <option value="4">Приключения</option>
              <option value="5">Историческая литература</option>
            </select>
          </FormGroup>
          <FormGroup>
            <label>Статус</label>
            <select
              name="Статус"
              value={formData.Статус}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
              <option value="Доступна">Доступна</option>
              <option value="Зарезервирована">Зарезервирована</option>
              <option value="На руках">На руках</option>
              <option value="Потеряна">Потеряна</option>
            </select>
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
