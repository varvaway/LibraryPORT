import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  background-color: #333;
  color: white;
  font-weight: 500;
  cursor: ${props => props.$sortable ? 'pointer' : 'default'};
  
  &:hover {
    background-color: ${props => props.$sortable ? '#444' : '#333'};
  }
`;

const ResourcesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background-color: ${({ theme }) => theme.colors.pistachioCream};
  }

  .actions {
    width: 200px;
    text-align: right;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.darkGray};
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.mahogany};
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.mahogany};
  }
`;

const ResourceLink = styled.a`
  color: ${({ theme }) => theme.colors.mahogany};
  text-decoration: none;
  display: block;
  margin-top: 1rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${({ $primary, theme }) => 
    $primary ? theme.colors.mahogany : 'transparent'};
  color: ${({ $primary, theme }) => 
    $primary ? 'white' : theme.colors.mahogany};
  border: 1px solid ${({ theme }) => theme.colors.mahogany};
  
  &:hover {
    background-color: ${({ $primary, theme }) => 
      $primary ? theme.colors.darkMahogany : theme.colors.lightMahogany};
    color: white;
  }
`;

const AddButton = styled(Button)`
  margin-bottom: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
`;

const MultimediaPage = () => {
  const [resources, setResources] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Видео',
    url: ''
  });
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'Администратор';

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

  const handleDeleteClick = (resource, event) => {
    event.stopPropagation();
    setResourceToDelete(resource);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/multimedia/${resourceToDelete.id}`);
      setResources(resources.filter(r => r.id !== resourceToDelete.id));
      toast.success('Ресурс успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении ресурса:', error);
      toast.error('Ошибка при удалении ресурса');
    } finally {
      setDeleteModalOpen(false);
      setResourceToDelete(null);
    }
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
    try {
      if (editingResource) {
        await axios.put(`/api/multimedia/${editingResource.id}`, formData);
        setResources(resources.map(r => 
          r.id === editingResource.id ? { ...r, ...formData } : r
        ));
        toast.success('Ресурс успешно обновлен');
      } else {
        const response = await axios.post('/api/multimedia', formData);
        setResources([...resources, response.data]);
        toast.success('Ресурс успешно добавлен');
      }
      setIsModalOpen(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Ошибка при сохранении ресурса:', error);
      toast.error('Ошибка при сохранении ресурса');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedResources = [...resources].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (a[sortField] < b[sortField]) return -1 * direction;
    if (a[sortField] > b[sortField]) return 1 * direction;
    return 0;
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageContainer>
      <Title>Мультимедийные ресурсы</Title>
      
      {isAdmin && (
        <AddButton $primary onClick={handleAdd}>
          Добавить ресурс
        </AddButton>
      )}

      <ResourcesTable>
        <thead>
          <tr>
            <TableHeader $sortable onClick={() => handleSort('title')}>
              Название {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHeader>
            <TableHeader $sortable onClick={() => handleSort('description')}>
              Описание {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHeader>
            <TableHeader $sortable onClick={() => handleSort('type')}>
              Тип {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHeader>
            <TableHeader>Ссылка</TableHeader>
            {isAdmin && <TableHeader className="actions">Действия</TableHeader>}
          </tr>
        </thead>
        <tbody>
          {sortedResources.map(resource => (
            <tr key={resource.id}>
              <td>{resource.title}</td>
              <td>{resource.description}</td>
              <td>{resource.type}</td>
              <td>
                <ResourceLink href={resource.url} target="_blank" rel="noopener noreferrer">
                  Открыть ресурс
                </ResourceLink>
              </td>
              {isAdmin && (
                <td className="actions">
                  <ButtonGroup>
                    <Button onClick={() => handleEdit(resource)}>Редактировать</Button>
                    <Button onClick={(e) => handleDeleteClick(resource, e)}>Удалить</Button>
                  </ButtonGroup>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </ResourcesTable>

      {isAdmin && (
        <>
          

          {isModalOpen && (
            <Modal>
              <ModalContent>
                <h2>{editingResource ? 'Редактировать ресурс' : 'Добавить ресурс'}</h2>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <label>Название:</label>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      name="title"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Описание:</label>
                    <Input
                      type="text"
                      value={formData.description}
                      onChange={handleInputChange}
                      name="description"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Ссылка:</label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      name="url"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Тип:</label>
                    <Select id="type" value={formData.type} onChange={handleInputChange} name="type">
                      <option value="Видео">Видео</option>
                      <option value="Аудио">Аудио</option>
                    </Select>
                  </FormGroup>
                  <ButtonGroup>
                    <Button type="button" onClick={() => setIsModalOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit" $primary>
                      {editingResource ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </ButtonGroup>
                </Form>
              </ModalContent>
            </Modal>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setResourceToDelete(null);
        }}
        title="Удаление ресурса"
      >
        <p>Вы действительно хотите удалить этот ресурс?</p>
        <p style={{ marginTop: '12px', color: '#d32f2f' }}>Отменить действие будет невозможно.</p>
      </ConfirmationModal>
    </PageContainer>
  );
};

export default MultimediaPage;
