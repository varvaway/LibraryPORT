import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import EditAuthorModal from '../components/EditAuthorModal'; // Будет создан позже
import ConfirmationModal from '../components/ConfirmationModal'; // Будет создан позже

const PageContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const AddButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AuthorsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    padding: 0.5rem;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f5f5f5;
  }
`;

const TableHeader = styled.th`
  cursor: pointer;
  padding: 0.5rem;
`;

const Button = styled.button`
  background-color: ${props => props.$primary ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AdminAuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/authors');
        setAuthors(response.data);
        setFilteredAuthors(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке авторов:', error);
        toast.error('Ошибка при загрузке авторов');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  useEffect(() => {
    const filtered = authors.filter(author => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (author.fullName || '').toLowerCase().includes(searchLower);
    });
    setFilteredAuthors(filtered);
  }, [authors, searchTerm]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortField = (author, field) => {
    const fieldMap = {
      'fullName': 'fullName',
    };
    const actualField = fieldMap[field] || field;
    return author[actualField] || '';
  };

  const sortedAuthors = React.useMemo(() => {
    if (!Array.isArray(filteredAuthors)) return [];
    return [...filteredAuthors].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      const fieldA = getSortField(a, sortField);
      const fieldB = getSortField(b, sortField);
      if (fieldA < fieldB) return -1 * direction;
      if (fieldA > fieldB) return 1 * direction;
      return 0;
    });
  }, [filteredAuthors, sortDirection, sortField]);

  const handleAdd = () => {
    setEditAuthor({ id: '', firstName: '', lastName: '' });
    setIsEditModalOpen(true);
  };

  const handleEdit = (author) => {
    setEditAuthor(author);
    setIsEditModalOpen(true);
  };

  const handleDelete = (author) => {
    setAuthorToDelete(author);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!authorToDelete) return;
    try {
      await axios.delete(`/api/authors/${authorToDelete.id}`);
      toast.success('Автор успешно удален');
      setAuthors(prevAuthors => prevAuthors.filter(a => a.id !== authorToDelete.id));
      setFilteredAuthors(prevFiltered => prevFiltered.filter(a => a.id !== authorToDelete.id));
    } catch (error) {
      console.error('Ошибка при удалении автора:', error);
      toast.error('Ошибка при удалении автора');
    } finally {
      setDeleteModalOpen(false);
      setAuthorToDelete(null);
    }
  };

  const handleSave = async (authorData) => {
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!authorData.id;
      const url = isEdit ? `/api/authors/${authorData.id}` : '/api/authors';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: authorData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const savedAuthor = response.data;
      if (isEdit) {
        setAuthors(prevAuthors => 
          prevAuthors.map(author => 
            author.id === savedAuthor.id ? savedAuthor : author
          )
        );
        setFilteredAuthors(prevFiltered => 
          prevFiltered.map(author => 
            author.id === savedAuthor.id ? savedAuthor : author
          )
        );
      } else {
        setAuthors(prevAuthors => [...prevAuthors, savedAuthor]);
        setFilteredAuthors(prevFiltered => [...prevFiltered, savedAuthor]);
      }
      toast.success('Автор успешно сохранен');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении автора:', error);
      toast.error('Ошибка при сохранении автора');
    }
  };

  return (
    <PageContainer>
      <Title>Авторы</Title>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Поиск авторов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: 1
          }}
        />
        <AddButton onClick={handleAdd}>
          <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
          Добавить автора
        </AddButton>
      </div>
      {!isLoading ? (
        <div>
          <p>Отображаемые авторы: {sortedAuthors.length}</p>
          <p>Сортировка по: {sortField} ({sortDirection})</p>
          <AuthorsTable>
            <thead>
              <tr>
                <TableHeader onClick={() => handleSort('fullName')}>
                  Имя Автора
                  {sortField === 'fullName' && (
                    sortDirection === 'asc' ? '↑' : '↓'
                  )}
                </TableHeader>
                <TableHeader>
                  Биография
                </TableHeader>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sortedAuthors) && sortedAuthors.length > 0 ? (
                sortedAuthors.map((author, index) => (
                  <tr key={author.id || `author-${index}`}>
                    <td>{author.fullName || '—'}</td>
                    <td>{author.biography || '—'}</td>
                    <td>
                      <ButtonGroup>
                        <Button $primary onClick={() => handleEdit(author)}>
                          <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>
                          Редактировать
                        </Button>
                        <Button onClick={() => handleDelete(author)}>
                          <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                          Удалить
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>
                    Нет авторов для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </AuthorsTable>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}
      {/* Edit/Add Modal */}
      {isEditModalOpen && (
        <EditAuthorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          author={editAuthor}
          onSave={handleSave}
        />
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Удаление автора"
        message={`Вы уверены, что хотите удалить автора "${authorToDelete?.fullName}"?`}
      />
    </PageContainer>
  );
};

export default AdminAuthorsPage; 