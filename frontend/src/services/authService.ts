/**
 * Authentication Service
 */

import api from '../config/api';
import { setStoredToken, clearStoredToken } from '../config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_type: string;
}

export interface TwoFactorRequest {
  email: string;
  code: string;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/v1/auth/login', credentials);
      const { access_token } = response.data;
      
      // Store token
      await setStoredToken(access_token);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao fazer login');
    }
  },

  /**
   * Verify two-factor authentication code
   */
  async verify2FA(data: TwoFactorRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/v1/auth/login/2fa', data);
      const { access_token } = response.data;
      
      // Store token
      await setStoredToken(access_token);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Código 2FA inválido');
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Erro ao buscar usuário');
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await clearStoredToken();
  },
};

