import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  
  console.log('ProtectedRoute проверка:', {
    userJson,
    user,
    requiredRole
  });
  
  if (!user || (!user.role && !user.Роль)) {
    console.log('Нет пользователя или роли:', user);
    return <Navigate to="/" />;
  }

  // Проверяем роль с учетом разных возможных форматов
  const userRole = user.role || user.Роль;
  console.log('Сравнение ролей:', {
    userRole,
    requiredRole,
    равны: userRole === requiredRole
  });
  
  if (userRole !== requiredRole) {
    console.log('Неверная роль:', userRole, 'требуется:', requiredRole);
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
