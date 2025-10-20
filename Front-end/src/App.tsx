import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
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
import MatchListing from './pages/listings/MatchListing'
import TeamList from './pages/teams/TeamList'
import CreateTeam from './pages/teams/CreateTeam'
import EditTeam from './pages/teams/EditTeam'
import PrivateRoute from './components/PrivateRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import { USER_ROLES } from './utils/roleUtils'
import { useAuth } from './hooks/useAuth'
import Profile from './pages/perfil/Perfil'
import PageTransition from './components/PageTransition'
import ChampionshipList from './pages/championships/ChampionsShipList/ChampionshipList'
import ChampionshipForm from './pages/championships/ChampionshipForm'
import ChampionshipDetail from './pages/championships/ChampionsShipDetail/ChampionshipDetail'
import ChampionshipEditForm from './pages/championships/ChampionshipEditForm'
import UserManagement from './pages/UserManagement'
import Navbar from './components/Navbar'
import TeamRequiredRoute from './components/TeamRequiredRoute'
import EditMatch from './pages/matches/EditMatch'
import { Box, CssBaseline } from '@mui/material'
import SystemOverview from './components/dashboard/SystemOverview'
import CalendarioPage from './pages/calendario/calendárioPage'
import HistoricoPage from './pages/Historico/HistoricoPage'
import { HistoricoProvider } from '../src/Context/HistoricoContext';
import RankingPlayers from './pages/ranking/RankingPlayers'
import RankingTeams from './pages/ranking/RankingTeams'

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

    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

    const isPublicRoute = publicRoutes.includes(location.pathname);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />
        {!isPublicRoute && <Navbar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: !isPublicRoute ? '72px' : 0,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
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

            <Route path="/dashboard" element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <RoleBasedRoute 
                  isLoggedIn={isLoggedIn} 
                  userRole={user?.userTypeId} 
                  allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES]}
                  redirectTo="/"
                >
                  <PageTransition>
                    <SystemOverview />
                  </PageTransition>
                </RoleBasedRoute>
              </PrivateRoute>
            } />

            <Route path="/listings" element={
              <PageTransition>
                <MatchListing />
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
          <Route path="/calendario" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
              >
                <PageTransition>
                  <CalendarioPage />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
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
                // Partidas: somente roles 1 (ADMIN_SISTEMA) e 2 (ADMIN_EVENTOS)
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS]}
                redirectTo="/"
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
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS]}
                redirectTo="/"
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
                // Detalhes de partidas: roles 1,2,3
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
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
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
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
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
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
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
              >
                <PageTransition>
                  <EditTeam />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />
          <Route path="/matches/edit/:id" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA,USER_ROLES.ADMIN_EVENTOS]}
                redirectTo="/"
              >
                <PageTransition>
                  <EditMatch />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />

          <Route path="/championships" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                // Campeonatos: somente roles 1 e 2
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS]}
                redirectTo="/"
              >
                <PageTransition>
                  <ChampionshipList />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />

          <Route path="/championships/create" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS]}
                redirectTo="/"
              >
                <PageTransition>
                  <ChampionshipForm />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />
          
          <Route path="/championships/:id" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                // Detalhes de campeonatos: roles 1,2,3
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
              >
                <PageTransition>
                  <ChampionshipDetail />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />
          <Route path="/historico" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute isLoggedIn={isLoggedIn} userRole={user?.userTypeId} allowedRoles={[USER_ROLES.ADMIN_TIMES]} redirectTo="/">
                  <TeamRequiredRoute redirectTo="/teams">
                    <PageTransition><HistoricoPage /></PageTransition>
                  </TeamRequiredRoute>
              </RoleBasedRoute>
            </PrivateRoute>
          } />


          <Route path="/championships/:id/edit" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS]}
                redirectTo="/"
              >
                <PageTransition>
                  <ChampionshipEditForm />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />

          <Route path="/ranking/jogadores" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES]}
                redirectTo="/"
              >
                <PageTransition>
                  <RankingPlayers />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />
          <Route path='/championships/:id/ranking-times' element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA, USER_ROLES.ADMIN_EVENTOS, USER_ROLES.ADMIN_TIMES,USER_ROLES.USUARIO_COMUM]}
                redirectTo="/"
              >
                <PageTransition>
                  <RankingTeams />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />
          {/* Rota para Gerenciamento de Usuários (Apenas Admin do Sistema) */}
          <Route path="/admin/users" element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <RoleBasedRoute 
                isLoggedIn={isLoggedIn} 
                userRole={user?.userTypeId} 
                allowedRoles={[USER_ROLES.ADMIN_SISTEMA]}
              >
                <PageTransition>
                  <UserManagement />
                </PageTransition>
              </RoleBasedRoute>
            </PrivateRoute>
          } />
          
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 999999,
          },
          success: {
            duration: 3000,
            style: {
              background: '#28a745',
              color: '#fff',
              zIndex: 999999,
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#dc3545',
              color: '#fff',
              zIndex: 999999,
            },
          },
        }}
        containerStyle={{
          zIndex: 999999,
        }}
      />
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
     <HistoricoProvider>
      <AppContent />
     </HistoricoProvider>
      
    </BrowserRouter>
  );
}

export default App;