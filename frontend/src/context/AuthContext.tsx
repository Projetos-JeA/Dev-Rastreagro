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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  async function loadUser() {
    const userData = await userService.me();
    setUser(userData);
    setIsAuthenticated(true);
  }

  async function checkAuth() {
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
  }

  async function login(credentials: LoginRequest) {
    try {
      await authService.login(credentials);
      await loadUser();
    } catch (error) {
      throw error;
    }
  }

  async function registerBuyer(payload: RegisterBuyerRequest) {
    await authService.registerBuyer(payload);
    await clearStoredTokens();
  }

  async function registerSeller(payload: RegisterSellerRequest) {
    await authService.registerSeller(payload);
    await clearStoredTokens();
  }

  async function registerServiceProvider(payload: RegisterServiceProviderRequest) {
    await authService.registerServiceProvider(payload);
    await clearStoredTokens();
  }

  async function logout() {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }

  useEffect(() => {
    checkAuth();
  }, []);

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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
