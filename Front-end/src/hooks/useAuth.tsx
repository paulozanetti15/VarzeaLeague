import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  avatar?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (userData: { user: User; token: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (userData: { user: User; token: string }) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('token', userData.token);

    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setUser(userData.user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isLoggedIn: !!user,
      login,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}; 