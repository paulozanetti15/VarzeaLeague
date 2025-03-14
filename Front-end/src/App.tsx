import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Login } from './pages/login/Login'
import { Register } from './pages/register/Register'
import { ForgotPassword } from './pages/forgot-password/ForgotPassword'

type Page = 'login' | 'register' | 'forgot-password';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <Login 
            onRegisterClick={() => setCurrentPage('register')}
            onForgotPasswordClick={() => setCurrentPage('forgot-password')}
          />
        );
      case 'register':
        return <Register onLoginClick={() => setCurrentPage('login')} />;
      case 'forgot-password':
        return <ForgotPassword onBackToLogin={() => setCurrentPage('login')} />;
    }
  }

  return renderPage();
}

export default App
