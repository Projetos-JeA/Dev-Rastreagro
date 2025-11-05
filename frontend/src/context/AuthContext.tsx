/**
 * Authentication Context
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getStoredToken } from '../config/api';
import { authService, LoginRequest, TwoFactorRequest } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (credentials: LoginRequest) => Promise<void>;
  login2FA: (data: TwoFactorRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      setUser({ id: response.user_id, tipo: response.user_type, email: credentials.email });
      setIsAuthenticated(true);
    } catch (error: any) {
      throw error;
    }
  };

  const login2FA = async (data: TwoFactorRequest) => {
    try {
      const response = await authService.verify2FA(data);
      setUser({ id: response.user_id, tipo: response.user_type });
      setIsAuthenticated(true);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        login2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

