import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  avatar: string;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    checkAuthStatus(storedToken);
  }, []);

  const checkAuthStatus = async (token: string | null) => {
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/auth/verify', {
        params: { token },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200 && response.data.user) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: { user: User; token: string }) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  return { isLoggedIn, isLoading, user, login, logout };
};
