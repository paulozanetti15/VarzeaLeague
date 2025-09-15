import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Landing } from '../pages/landing/Landing';
import { Login } from '../pages/login/Login';
import UserManagement from '../pages/UserManagement';
import MatchListing from '../pages/listings/MatchListing';
import Layout from '../components/Layout';
import TeamCalendar from '../pages/teams/Calendar';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredUserType?: number;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredUserType }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredUserType && user.userTypeId !== requiredUserType) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, logout } = useAuth();

  // Se o usuário já estiver logado e tentar acessar /login, redireciona para /
  if (user && window.location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública para login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rota pública para landing */}
        <Route path="/" element={
          <Landing 
            isLoggedIn={!!user}
            user={user}
            onLoginClick={() => {}}
            onRegisterClick={() => {}}
            onLogout={logout}
          />
        } />

        {/* Rotas protegidas */}
        <Route path="/user-management" element={
          <PrivateRoute requiredUserType={1}>
            <Layout>
              <UserManagement />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/listings" element={
          <Layout>
            <MatchListing />
          </Layout>
        } />

        <Route path="/teams/calendar" element={
          <PrivateRoute requiredUserType={3}>
            <Layout>
              <TeamCalendar />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; 