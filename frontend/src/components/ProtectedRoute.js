import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  console.log('ProtectedRoute: проверка доступа');
  console.log('RequiredRole:', requiredRole);
  
  const userStr = localStorage.getItem('user');
  console.log('User from localStorage:', userStr);
  
  const user = JSON.parse(userStr || 'null');
  console.log('Parsed user:', user);
  
  if (!user) {
    console.log('Нет пользователя, редирект на /');
    return <Navigate to="/" />;
  }

  // Проверяем роль пользователя
  const hasAccess = 
    requiredRole === 'Администратор' ? user.role === 'Администратор' :
    requiredRole === 'Пользователь' ? ['Пользователь', 'Читатель'].includes(user.role) :
    false;

  console.log('Роль пользователя:', user.role);
  console.log('Требуемая роль:', requiredRole);
  console.log('Доступ разрешен:', hasAccess);

  if (!hasAccess) {
    console.log('Нет доступа, редирект на /');
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
