/**
 * Contexto global de autenticação da aplicação
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getStoredAccessToken, clearStoredTokens } from '../config/api';
import {
  authService,
  LoginRequest,
  RegisterBuyerRequest,
  RegisterSellerRequest,
  RegisterServiceProviderRequest,
} from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (credentials: LoginRequest) => Promise<void>;
  registerBuyer: (payload: RegisterBuyerRequest) => Promise<void>;
  registerSeller: (payload: RegisterSellerRequest) => Promise<void>;
  registerServiceProvider: (payload: RegisterServiceProviderRequest) => Promise<void>;
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

  const loadUser = async () => {
    const userData = await userService.me();
    setUser(userData);
    setIsAuthenticated(true);
  };

  const checkAuth = async () => {
    try {
      const token = await getStoredAccessToken();
      if (token) {
        await loadUser();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      await clearStoredTokens();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      await authService.login(credentials);
      await loadUser();
    } catch (error) {
      // Re-lançar o erro para que a tela de login possa tratá-lo
      throw error;
    }
  };

  const registerBuyer = async (payload: RegisterBuyerRequest) => {
    await authService.registerBuyer(payload);
    await clearStoredTokens();
  };

  const registerSeller = async (payload: RegisterSellerRequest) => {
    await authService.registerSeller(payload);
    await clearStoredTokens();
  };

  const registerServiceProvider = async (payload: RegisterServiceProviderRequest) => {
    await authService.registerServiceProvider(payload);
    await clearStoredTokens();
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
        registerBuyer,
        registerSeller,
        registerServiceProvider,
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
