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
  max-width: 600px;
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

const Select = styled.select`
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

const EditReservationModal = ({ isOpen, onClose, onSave, reservation, title }) => {
  const [formData, setFormData] = useState({
    КодПользователя: '',
    КодКниги: '',
    ДатаОкончания: ''
  });

  useEffect(() => {
    if (reservation) {
      setFormData({
        КодПользователя: reservation.КодПользователя || '',
        КодКниги: reservation.Книги?.[0]?.КодКниги || '',
        ДатаОкончания: reservation.ДатаОкончания || ''
      });
    } else {
      setFormData({
        КодПользователя: '',
        КодКниги: '',
        ДатаОкончания: ''
      });
    }
  }, [reservation]);

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
        <h2>{title}</h2>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Читатель</label>
            <Select
              name="КодПользователя"
              value={formData.КодПользователя}
              onChange={handleChange}
              required
            >
              <option value="">Выберите читателя</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <label>Книга</label>
            <Select
              name="КодКниги"
              value={formData.КодКниги}
              onChange={handleChange}
              required
            >
              <option value="">Выберите книгу</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <label>Дата окончания</label>
            <Input
              type="date"
              name="ДатаОкончания"
              value={formData.ДатаОкончания}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <ButtonGroup>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" $primary>
              Сохранить
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default EditReservationModal;
