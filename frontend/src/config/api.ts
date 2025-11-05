/**
 * API Configuration
 */

import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Development
  : 'https://api.rastreagro.com.br';  // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await clearStoredToken();
      // Redirect to login (handled by navigation)
    }
    return Promise.reject(error);
  }
);

// Token storage helpers
const TOKEN_KEY = '@rastreagro:token';

export const getStoredToken = async (): Promise<string | null> => {
  try {
    // Para web, usar localStorage diretamente
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    // Para mobile, usar AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const setStoredToken = async (token: string): Promise<void> => {
  try {
    // Para web, usar localStorage diretamente
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    // Para mobile, usar AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const clearStoredToken = async (): Promise<void> => {
  try {
    // Para web, usar localStorage diretamente
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
      return;
    }
    // Para mobile, usar AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

export default api;

