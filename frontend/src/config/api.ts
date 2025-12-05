import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  : 'https://api.rastreagro.com.br';

const ACCESS_TOKEN_KEY = '@rastreagro:access_token';
const REFRESH_TOKEN_KEY = '@rastreagro:refresh_token';

type RetryAxiosRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos para endpoints com IA
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos para refresh token
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getStorage = () => {
  const globalObj: any = typeof globalThis !== 'undefined' ? globalThis : undefined;
  if (globalObj?.localStorage) {
    const storage: Storage = globalObj.localStorage;
    return {
      getItem: (key: string) => storage.getItem(key),
      setItem: (key: string, value: string) => storage.setItem(key, value),
      removeItem: (key: string) => storage.removeItem(key),
    };
  }
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage;
};

export const getStoredAccessToken = async (): Promise<string | null> => {
  try {
    return await getStorage().getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    return await getStorage().getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const setStoredTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    const storage = getStorage();
    await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const clearStoredTokens = async (): Promise<void> => {
  try {
    const storage = getStorage();
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Função auxiliar para adicionar header de perfil ativo
async function _addActiveRoleHeader(config: RetryAxiosRequestConfig): Promise<void> {
  try {
    const storage = getStorage();
    const userId = await storage.getItem('@rastreagro:user_id');
    if (userId) {
      const activeRole = await storage.getItem(`@activeRole_${userId}`);
      if (activeRole) {
        console.log(`🔵 Adicionando X-Active-Role: ${activeRole} para usuário ${userId}`);
        const headers = config.headers ?? new AxiosHeaders();
        if (headers instanceof AxiosHeaders) {
          headers.set('X-Active-Role', activeRole);
        } else {
          (headers as Record<string, string>)['X-Active-Role'] = activeRole;
        }
        config.headers = headers;
      } else {
        console.warn(`⚠️ Perfil ativo não encontrado para usuário ${userId}`);
      }
    } else {
      console.warn('⚠️ User ID não encontrado no storage');
    }
  } catch (error) {
    // Ignora erros ao buscar perfil ativo (não é crítico)
    console.debug('Não foi possível adicionar perfil ativo:', error);
  }
}

api.interceptors.request.use(
  async (config: RetryAxiosRequestConfig) => {
    const token = await getStoredAccessToken();
    if (token) {
      const headers = config.headers ?? new AxiosHeaders();
      if (headers instanceof AxiosHeaders) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
      config.headers = headers;
    }

    // Adiciona perfil ativo do usuário (se disponível)
    await _addActiveRoleHeader(config);

    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = (error.config || {}) as RetryAxiosRequestConfig;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        await clearStoredTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              // Re-adiciona perfil ativo após refresh
              _addActiveRoleHeader(originalRequest);
            }
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await refreshClient.post('/auth/refresh', { refresh_token: refreshToken });
        const { access_token: newAccessToken } = response.data;
        await setStoredTokens(newAccessToken, refreshToken);
        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Re-adiciona perfil ativo após refresh
          _addActiveRoleHeader(originalRequest);
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearStoredTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
