import React from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000
  }
};

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s;

    &:first-child {
      background-color: #f44336;
      color: white;

      &:hover {
        background-color: #d32f2f;
      }
    }

    &:last-child {
      background-color: #cccccc;
      color: #333333;

      &:hover {
        background-color: #b3b3b3;
      }
    }
  }
`;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Подтверждение"
    >
      <h2>{title}</h2>
      <p>{message}</p>
      <ButtonGroup>
        <button onClick={onConfirm}>Да</button>
        <button onClick={onClose}>Отмена</button>
      </ButtonGroup>
    </Modal>
  );
};

export default ConfirmationModal;
