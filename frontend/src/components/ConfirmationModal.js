import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  width: 90%;
  text-align: center;
`;

const Title = styled.h3`
  color: #333;
  margin: 0 0 20px 0;
  font-size: 1.4rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &.confirm {
    background-color: #f44336;
    color: white;
    &:hover {
      background-color: #d32f2f;
    }
  }

  &.cancel {
    background-color: #e0e0e0;
    color: #333;
    &:hover {
      background-color: #bdbdbd;
    }
  }
`;

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, children }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>{title}</Title>
        {children}
        <ButtonGroup>
          <Button className="cancel" onClick={onCancel}>
            Отмена
          </Button>
          <Button className="confirm" onClick={onConfirm}>
            Подтвердить
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
