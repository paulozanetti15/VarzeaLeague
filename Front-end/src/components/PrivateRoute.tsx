import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isLoggedIn }) => {
  const { user } = useAuth();
  const logged = typeof isLoggedIn === 'boolean' ? isLoggedIn : !!user;

  if (!logged) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;