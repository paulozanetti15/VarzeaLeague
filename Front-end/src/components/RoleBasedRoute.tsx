import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleBasedRouteProps {
  isLoggedIn: boolean;
  userRole?: number;
  allowedRoles: number[];
  redirectTo?: string;
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  isLoggedIn,
  userRole,
  allowedRoles,
  redirectTo = '/access-denied', // Redirecionar para página de acesso negado
  children
}) => {
  // Verificar se está logado
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar se o papel do usuário está entre os permitidos
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Se passou pelas verificações, renderiza o componente filho
  return <>{children}</>;
};

export default RoleBasedRoute;