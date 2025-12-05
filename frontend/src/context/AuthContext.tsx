import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredAccessToken, clearStoredTokens } from '../config/api';
import {
  authService,
  LoginRequest,
  RegisterBuyerRequest,
  RegisterSellerRequest,
  RegisterServiceProviderRequest,
  RegisterResponse,
} from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  profileImage: string | null;
  availableRoles: string[];
  activeRole: string | null;
  hasMultipleRoles: boolean;
  needsProfileSelection: boolean;
  roleLabel: Record<string, string>;
  currentRoleLabel: string;
  updateProfileImage: (uri: string | null) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  registerBuyer: (payload: RegisterBuyerRequest) => Promise<RegisterResponse>;
  registerSeller: (payload: RegisterSellerRequest) => Promise<RegisterResponse>;
  registerServiceProvider: (payload: RegisterServiceProviderRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  setActiveRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleLabel: Record<string, string> = {
  buyer: 'Produtor',
  seller: 'Fornecedor',
  service_provider: 'Prestador de Serviço',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const [needsProfileSelection, setNeedsProfileSelection] = useState(false);

  async function loadProfileImage(userId?: number) {
    try {
      if (!userId) return;
      const stored = await AsyncStorage.getItem(`@profileImage_${userId}`);
      if (stored) {
        setProfileImage(stored);
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a foto de perfil.');
    }
  }

  async function updateProfileImage(uri: string | null) {
    try {
      if (!user?.id) return;

      if (uri) {
        await AsyncStorage.setItem(`@profileImage_${user.id}`, uri);
      } else {
        await AsyncStorage.removeItem(`@profileImage_${user.id}`);
      }
      setProfileImage(uri);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a foto de perfil.');
    }
  }

  async function extractRoles(userData: any): Promise<string[]> {
    // Prioridade: usa array 'roles' se disponível (perfis reais no banco)
    if (Array.isArray(userData.roles) && userData.roles.length > 0) {
      console.log('📋 Perfis encontrados (roles):', userData.roles);
      return userData.roles;
    }
    // Fallback: usa role principal se array não estiver disponível
    if (userData.role) {
      console.log('⚠️ Usando role principal (fallback):', userData.role);
      return [userData.role];
    }
    console.warn('❌ Nenhum perfil encontrado!');
    return [];
  }

  async function loadUser() {
    const userData = await userService.me();
    const roles = await extractRoles(userData);

    setUser(userData);
    setAvailableRoles(roles);
    setIsAuthenticated(true);
    await loadProfileImage(userData.id);

    // Salva user_id para uso no interceptor HTTP
    await AsyncStorage.setItem('@rastreagro:user_id', String(userData.id));

    if (roles.length === 1) {
      setActiveRoleState(roles[0]);
      setNeedsProfileSelection(false);
      await AsyncStorage.setItem(`@activeRole_${userData.id}`, roles[0]);
    } else if (roles.length > 1) {
      // Tenta carregar perfil ativo salvo anteriormente
      const savedRole = await AsyncStorage.getItem(`@activeRole_${userData.id}`);
      if (savedRole && roles.includes(savedRole)) {
        setActiveRoleState(savedRole);
        setNeedsProfileSelection(false);
      } else {
        setActiveRoleState(null);
        setNeedsProfileSelection(true);
      }
    }
  }

  async function checkAuth() {
    try {
      const token = await getStoredAccessToken();
      if (token) {
        try {
          await loadUser();
        } catch (error) {
          // Token inválido ou expirado
          console.log('Token inválido, limpando...');
          await clearStoredTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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

  async function registerBuyer(payload: RegisterBuyerRequest): Promise<RegisterResponse> {
    const response = await authService.registerBuyer(payload);
    await clearStoredTokens();
    return response;
  }

  async function registerSeller(payload: RegisterSellerRequest): Promise<RegisterResponse> {
    const response = await authService.registerSeller(payload);
    await clearStoredTokens();
    return response;
  }

  async function registerServiceProvider(payload: RegisterServiceProviderRequest): Promise<RegisterResponse> {
    const response = await authService.registerServiceProvider(payload);
    await clearStoredTokens();
    return response;
  }

  async function logout() {
    if (user?.id) {
      await AsyncStorage.removeItem(`@activeRole_${user.id}`);
    }
    await AsyncStorage.removeItem('@rastreagro:user_id');
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setProfileImage(null);
    setAvailableRoles([]);
    setActiveRoleState(null);
    setNeedsProfileSelection(false);
  }

  async function setActiveRole(role: string) {
    if (!user?.id) return;
    if (!availableRoles.includes(role)) return;

    setActiveRoleState(role);
    setNeedsProfileSelection(false);
    await AsyncStorage.setItem(`@activeRole_${user.id}`, role);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const hasMultipleRoles = availableRoles.length > 1;
  const currentRoleLabel = activeRole ? roleLabel[activeRole] || 'Usuário' : 'Usuário';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        profileImage,
        availableRoles,
        activeRole,
        hasMultipleRoles,
        needsProfileSelection,
        roleLabel,
        currentRoleLabel,
        updateProfileImage,
        login,
        registerBuyer,
        registerSeller,
        registerServiceProvider,
        logout,
        setActiveRole,
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
