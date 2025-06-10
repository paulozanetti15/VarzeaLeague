import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
// import { AnimatePresence } from 'framer-motion'
import './App.css'
import { Login } from './pages/login/Login'
import Register from './pages/register/Register'
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
import Profile from './pages/perfil/Perfil'
import PageTransition from './components/PageTransition'
import React, { lazy, Suspense } from 'react'

// Componente simples para loading
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Carregando...</p>
  </div>
);

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
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
    return <Loading />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <PageTransition>
            <Landing 
              isLoggedIn={isLoggedIn}
              user={user}
              onLoginClick={() => navigate('/login')}
              onRegisterClick={() => navigate('/register')}
              onLogout={handleLogout}
            />
          </PageTransition>
        } />
        
        <Route path="/perfil" element={
          isLoggedIn ? (
            <PageTransition>
              <Profile
                isLoggedIn={isLoggedIn}
                onLoginClick={() => navigate('/login')}
                onRegisterClick={() => navigate('/register')}
                onLogout={handleLogout}
              />
            </PageTransition>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/login" element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <PageTransition>
              <Login 
                onRegisterClick={() => navigate('/register')}
                onForgotPasswordClick={() => navigate('/forgot-password')}
                onLoginSuccess={handleLoginSuccess}
              />
            </PageTransition>
          )
        } />
        
        <Route path="/register" element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <PageTransition>
              <Register 
                onLoginClick={() => navigate('/login')}
              />
            </PageTransition>
          )
        } />
        
        <Route path="/forgot-password" element={
          <PageTransition>
            <ForgotPassword 
              onBackToLogin={() => navigate('/login')}
            />
          </PageTransition>
        } />

        <Route path="/reset-password/:token" element={
          <PageTransition>
            <ResetPassword 
              onBackToLogin={() => navigate('/login')}
            />
          </PageTransition>
        } />
        
        <Route path="/matches" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES, USER_ROLES.USUARIO_COMUM]}
            >
              <PageTransition>
                <MatchList />
              </PageTransition>
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        
        <Route path="/matches/create" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES, USER_ROLES.USUARIO_COMUM]}
            >
              <PageTransition>
                <CreateMatch />
              </PageTransition>
            </RoleBasedRoute>
          </PrivateRoute>
        } />

        <Route path="/matches/:id" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES, USER_ROLES.USUARIO_COMUM]}
            >
              <PageTransition>
                <MatchDetail />
              </PageTransition>
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        
        <Route path="/teams" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES, USER_ROLES.USUARIO_COMUM]}
            >
              <PageTransition>
                <TeamList />
              </PageTransition>
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        
        <Route path="/teams/create" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES, USER_ROLES.USUARIO_COMUM]}
            >
              <PageTransition>
                <CreateTeam />
              </PageTransition>
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        
        <Route path="/teams/edit/:id" element={
          <PrivateRoute isLoggedIn={isLoggedIn}>
            <RoleBasedRoute 
              isLoggedIn={isLoggedIn} 
              userRole={user?.userTypeId} 
              allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES, USER_ROLES.USUARIO_COMUM]}
            >
              <PageTransition>
                <EditTeam />
              </PageTransition>
            </RoleBasedRoute>
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#28a745',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#dc3545',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <AppContent />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;