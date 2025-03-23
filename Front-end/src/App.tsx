import { useState, useEffect } from 'react'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'
import { Landing } from './pages/landing/Landing'
import { ResetPassword } from './pages/reset-password/ResetPassword'
import { Routes, Route,BrowserRouter as Router } from 'react-router-dom';


function App() {
 

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Verificar se o usuário está logado ao carregar a página
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
  }
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Landing 
            isLoggedIn={isLoggedIn}
            onLoginClick={() => window.location.href='/login'} // Redirecionamento via React Router
            onRegisterClick={() =>  window.location.href='/register'} // Redirecionamento via React Router
            onLogout={handleLogout}
          />}
        />  
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} onForgotPasswordClick={() => window.location.href='/forgot-password'} onRegisterClick={()=>window.location.href='/register'} />}  />
        <Route path="/register" element={<Register onLoginClick={()=> window.location.href='/login'} />} />
        <Route path="/forgot-password" element={<ForgotPassword onBackToLogin={() => window.location.href = '/login'} />} />
        <Route path="/reset-password" element={<ResetPassword onBackToLogin={() => window.location.href = '/login'} />} />
      </Routes>
    </Router>
  );   
}
 
 


export default App
