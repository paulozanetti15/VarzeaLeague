import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'
import { ResetPassword } from './pages/reset-password/ResetPassword'
import CreateMatch from './pages/CreateMatch'


function App() {
 

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    window.location.href='/'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    window.location.href='/'
  }

  // Componente para proteger rotas
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
   <Router> 
      <Routes>
        <Route path="/" element={
          <Landing 
            isLoggedIn={isLoggedIn}
            onLoginClick={() => window.location.href='/login'}
            onRegisterClick={() => window.location.href='/register'}
            onLogout={handleLogout}
          />
        } />
        
        <Route path="/login" element={
          isLoggedIn ? (
            <Navigate to="/" />
          ) : (
            <Login 
              onRegisterClick={() => window.location.href='/register'}
              onForgotPasswordClick={() => window.location.href='/forgot-password'}
              onLoginSuccess={handleLoginSuccess}
            />
          )
        } />
        
        <Route path="/register" element={
          isLoggedIn ? (
            <Navigate to="/" />
          ) : (
            <Register 
              onLoginClick={() => window.location.href='/login'}
            />
          )
        } />
        
        <Route path="/forgot-password" element={
          <ForgotPassword 
            onBackToLogin={() => window.location.href='/login'}
          />
        } />

        <Route path="/create-match" element={
          <PrivateRoute>
            <CreateMatch />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

 export default App
