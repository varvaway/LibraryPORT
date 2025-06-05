import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const AddButton = styled.button`
  background-color: ${props => props.$primary ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResourcesTable = styled.table`
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
    cursor: ${props => props.isAdmin ? 'pointer' : 'default'};
  }
`;

const TableHeader = styled.th`
  cursor: ${props => props.$sortable ? 'pointer' : 'default'};
`;

const ResourceLink = styled.a`
  color: #2196F3;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ResourcesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ResourceCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .description {
    margin: 0.5rem 0;
  }
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
  margin-top: 1rem;
`;

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <h2>{title}</h2>
        <p>{message}</p>
        <ButtonGroup>
          <Button onClick={onClose}>Отмена</Button>
          <Button onClick={onConfirm} $primary>
            Подтвердить
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

const MultimediaPage = () => {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Видео',
    url: ''
  });
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'Администратор';
  const isReader = user?.role === 'Читатель';

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get('/api/multimedia');
        setResources(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке ресурсов:', error);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const filtered = resources.filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (a[sortField] < b[sortField]) return -1 * direction;
      if (a[sortField] > b[sortField]) return 1 * direction;
      return 0;
    });
    setFilteredResources(sorted);
  }, [resources, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (resource) => {
    setResourceToDelete(resource);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/multimedia/${resourceToDelete.id}`);
      setResources(resources.filter(r => r.id !== resourceToDelete.id));
      toast.success('Ресурс успешно удален');
    } catch (error) {
      toast.error('Ошибка при удалении ресурса');
    } finally {
      setDeleteModalOpen(false);
      setResourceToDelete(null);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      type: 'Видео',
      url: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.type || !formData.url) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        url: formData.url.trim()
      };

      if (editingResource) {
        await axios.put(`/api/multimedia/${editingResource.id}`, payload);
        toast.success('Ресурс успешно обновлен');
      } else {
        await axios.post('/api/multimedia', payload);
        toast.success('Ресурс успешно добавлен');
      }

      const updatedResources = await axios('/api/multimedia');
      setResources(updatedResources.data);
      
      setIsModalOpen(false);
      setEditingResource(null);
      setFormData({ title: '', description: '', type: 'Видео', url: '' });
    } catch (error) {
      console.error('Ошибка при сохранении ресурса:', error);
      toast.error('Ошибка при сохранении ресурса');
    }
  };

  return (
    <PageContainer>
      <Title>Мультимедийные ресурсы</Title>
      <input
        type="text"
        placeholder="Поиск..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ddd',
          marginBottom: '1rem'
        }}
      />
      {isAdmin && (
        <AddButton onClick={handleAdd} $primary>
          <i className="fas fa-plus"></i>
          Добавить ресурс
        </AddButton>
      )}
      {isAdmin ? (
        <ResourcesTable isAdmin={isAdmin}>
          <thead>
            <tr>
              <TableHeader $sortable onClick={() => handleSort('title')}>
                Название
                {sortField === 'title' && (
                  sortDirection === 'asc' ? (
                    <i className="fas fa-sort-up"></i>
                  ) : (
                    <i className="fas fa-sort-down"></i>
                  )
                )}
              </TableHeader>
              <TableHeader $sortable onClick={() => handleSort('description')}>
                Описание
                {sortField === 'description' && (
                  sortDirection === 'asc' ? (
                    <i className="fas fa-sort-up"></i>
                  ) : (
                    <i className="fas fa-sort-down"></i>
                  )
                )}
              </TableHeader>
              <TableHeader>Тип</TableHeader>
              <TableHeader>Ссылка</TableHeader>
              <TableHeader>Действия</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>{resource.description}</td>
                <td>{resource.type}</td>
                <td>
                  <ResourceLink href={resource.url} target="_blank">
                    Открыть
                  </ResourceLink>
                </td>
                <td className="actions">
                  <Button 
                    onClick={() => handleEdit(resource)}
                    $primary
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button 
                    onClick={() => handleDelete(resource)}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </ResourcesTable>
      ) : (
        <ResourcesGrid>
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} onClick={() => window.open(resource.url, '_blank')}>
              <h3>{resource.title}</h3>
              <p className="description">{resource.description}</p>
              <p>Тип: {resource.type}</p>
              <div className="actions">
                <Button onClick={(e) => {
                  e.stopPropagation();
                  window.open(resource.url, '_blank');
                }} $primary>
                  <i className="fas fa-external-link-alt"></i>
                </Button>
              </div>
            </ResourceCard>
          ))}
        </ResourcesGrid>
      )}

      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <h2>{editingResource ? 'Редактировать ресурс' : 'Добавить ресурс'}</h2>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Название</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <label>Описание</label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Тип</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="Видео">Видео</option>
                <option value="Аудио">Аудио</option>
                <option value="Интерактив">Интерактив</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <label>Ссылка</label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </FormGroup>
            <ButtonGroup>
              <Button type="button" onClick={() => setIsModalOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" $primary>
                {editingResource ? 'Обновить' : 'Добавить'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удаление ресурса"
        message="Вы уверены, что хотите удалить этот ресурс?"
      />
    </PageContainer>
  );
};

export default MultimediaPage;
