import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from '../utils/axios';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.mahogany};
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const ResourcesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const ResourceCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: ${({ theme }) => theme.colors.mahogany};
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin: 0.25rem 0;
    font-size: 1rem;
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
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
`;

const MultimediaPage = () => {
  const [resources, setResources] = useState([]);
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
    // TODO: Implement edit functionality
    console.log('Edit resource:', resource);
  };

  const handleDelete = async (resource) => {
    if (window.confirm('Вы уверены, что хотите удалить этот ресурс?')) {
      try {
        await axios.delete(`/api/multimedia/${resource.id}`);
        setResources(resources.filter(r => r.id !== resource.id));
      } catch (error) {
        console.error('Ошибка при удалении ресурса:', error);
      }
    }
  };

  const handleAdd = () => {
    // TODO: Implement add functionality
    console.log('Add new resource');
  };

  return (
    <PageContainer>
      <Title>Мультимедийные ресурсы</Title>
      
      <ResourcesGrid>
        {resources.map(resource => (
          <ResourceCard key={resource.id}>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <p>Тип: {resource.type}</p>
            <ResourceLink href={resource.url} target="_blank" rel="noopener noreferrer">
              Открыть ресурс
            </ResourceLink>
            {isAdmin && (
              <ButtonGroup>
                <Button onClick={() => handleEdit(resource)}>Редактировать</Button>
                <Button onClick={() => handleDelete(resource)}>Удалить</Button>
              </ButtonGroup>
            )}
          </ResourceCard>
        ))}
      </ResourcesGrid>

      {isAdmin && (
        <AddButton $primary onClick={handleAdd}>
          Добавить ресурс
        </AddButton>
      )}
    </PageContainer>
  );
};

export default MultimediaPage;
