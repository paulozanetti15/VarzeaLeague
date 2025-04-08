import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'
import { ResetPassword } from './pages/reset-password/ResetPassword'
import CreateMatch from './pages/matches/CreateMatch'
import MatchList from './pages/matches/MatchList'
import MatchDetail from './pages/matches/MatchDetail'
import TeamList from './pages/teams/TeamList'
import CreateTeam from './pages/teams/CreateTeam'
import EditTeam from './pages/teams/EditTeam'
import PrivateRoute from './components/PrivateRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import { USER_ROLES } from './utils/roleUtils'
import { useAuth } from './hooks/useAuth'

function AppContent() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, user, login, logout } = useAuth();
  const handleLoginSuccess = (userData: { user: any; token: string }) => {
    login(userData);
    navigate('/');
  };
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <Landing 
            isLoggedIn={isLoggedIn}
            user={user}
            onLoginClick={() => navigate('/login')}
            onRegisterClick={() => navigate('/register')}
            onLogout={handleLogout}
          />
        } />
        
        <Route path="/login" element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <Login 
              onRegisterClick={() => navigate('/register')}
              onForgotPasswordClick={() => navigate('/forgot-password')}
              onLoginSuccess={handleLoginSuccess}
            />
          )
        } />
        <Route path="/register" element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <Register 
              onLoginClick={() => navigate('/login')}
            />
          )
        } />
        <Route path="/forgot-password" element={
          <ForgotPassword 
            onBackToLogin={() => navigate('/login')}
          />
        } />

      <Route path="/reset-password/:token" element={
        <ResetPassword 
          onBackToLogin={() => navigate('/login')}
        />
      } />

      <Route path="/create-match" element={
        <PrivateRoute isLoggedIn={isLoggedIn}>
          <CreateMatch />
        </PrivateRoute>
      } />

        <Route path="/matches/:id" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES]}
            >
              <MatchDetail />
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        <Route path="/teams" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
            >
              <TeamList />
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        <Route path="/teams/create" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
            >
              <CreateTeam />
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        <Route path="/teams/edit/:id" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
            >
              <EditTeam />
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;