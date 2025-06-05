import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #6b4423;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.primary {
    background-color: #6b4423;
    color: white;

    &:hover:not(:disabled) {
      background-color: #8b5e3c;
    }
  }

  &.secondary {
    background-color: white;
    color: #6b4423;
    border: 1px solid #6b4423;

    &:hover:not(:disabled) {
      background-color: #f8f4f0;
    }
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 8px;
`;

export default function EditReaderForm({ isOpen, onClose, readerId, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && readerId) {
      loadReaderData();
    }
  }, [isOpen, readerId]);

  const loadReaderData = async () => {
    try {
      const response = await axios.get(`/api/readers/${readerId}`);
      if (response.data.success) {
        const { reader } = response.data;
        setFormData({
          firstName: reader.Имя,
          lastName: reader.Фамилия,
          email: reader.ЭлектроннаяПочта,
          phone: reader.Телефон
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных читателя:', error);
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: !formData.firstName ? 'Введите имя' : '',
      lastName: !formData.lastName ? 'Введите фамилию' : '',
      email: !formData.email ? 'Введите email' : '',
      phone: !formData.phone ? 'Введите телефон' : ''
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.put(`/api/readers/${readerId}`, formData);
      if (response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных читателя:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen}>
      <ModalContent>
        <h2>Редактирование читателя</h2>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Фамилия *</Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>Имя *</Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>Телефон *</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
          </InputGroup>

          <ButtonGroup>
            <Button
              type="submit"
              className="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}
