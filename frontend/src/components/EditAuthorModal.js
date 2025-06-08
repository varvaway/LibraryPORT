import React, { useState, useEffect } from 'react';
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
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000
  }
};

const FormField = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #442727;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
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
      background-color: #4CAF50;
      color: white;

      &:hover {
        background-color: #45a049;
      }
    }

    &:last-child {
      background-color: #f44336;
      color: white;

      &:hover {
        background-color: #d32f2f;
      }
    }
  }
`;

const EditAuthorModal = ({ isOpen, onClose, author, onSave }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [biography, setBiography] = useState('');

  useEffect(() => {
    if (author) {
      setFirstName(author.firstName || '');
      setLastName(author.lastName || '');
      setBiography(author.biography || '');
    } else {
      setFirstName('');
      setLastName('');
      setBiography('');
    }
  }, [author]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: author?.id,
      firstName,
      lastName,
      biography
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Редактировать/Добавить Автора"
    >
      <h2>{author?.id ? 'Редактировать автора' : 'Добавить автора'}</h2>
      <form onSubmit={handleSubmit}>
        <FormField>
          <label htmlFor="firstName">Имя</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </FormField>
        <FormField>
          <label htmlFor="lastName">Фамилия</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </FormField>
        <FormField>
          <label htmlFor="biography">Биография</label>
          <textarea
            id="biography"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows="5"
          />
        </FormField>
        <ButtonGroup>
          <button type="submit">Сохранить</button>
          <button type="button" onClick={onClose}>Отмена</button>
        </ButtonGroup>
      </form>
    </Modal>
  );
};

export default EditAuthorModal; 