import api, { setStoredTokens, clearStoredTokens, getStoredRefreshToken } from '../config/api';
import { ApiError, buildApiError } from '../utils/errorMessages';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterBuyerRequest {
  email: string;
  password: string;
  nickname: string;
  buyer_profile: {
    nome_completo: string;
    data_nascimento?: string;
    cpf?: string;
    identidade?: string;
    estado_civil?: string;
    naturalidade?: string;
    endereco: string;
    cep: string;
    cidade: string;
    estado: string;
  };
}

export interface ActivitySelection {
  category_id: number;
  group_id?: number | null;
  item_id?: number | null;
}

export interface RegisterSellerRequest {
  email: string;
  password: string;
  company: {
    nome_propriedade: string;
    inicio_atividades?: string | null;
    ramo_atividade?: string | null;
    cnaes?: string | null;
    cnpj_cpf: string;
    insc_est_identidade?: string | null;
    endereco: string;
    cep: string;
    cidade: string;
    estado: string;
    email: string;
    activities: ActivitySelection[];
  };
}

export interface RegisterServiceProviderRequest {
  email: string;
  password: string;
  service_provider: {
    nome_servico: string;
    descricao?: string | null;
    telefone?: string | null;
    email_contato: string;
    cidade: string;
    estado: string;
    tipo_servico?: string;
    endereco?: string;
    cep?: string;
    cnpj_cpf?: string;
    insc_est_identidade?: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<TokenPairResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      const response = await api.post<TokenPairResponse>('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      await setStoredTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const detail = error?.response?.data?.detail;
        const message =
          typeof detail === 'string'
            ? detail
            : 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
        throw new ApiError(message, 401);
      }
      throw buildApiError(error, 'Erro ao fazer login');
    }
  },

  async registerBuyer(payload: RegisterBuyerRequest): Promise<TokenPairResponse> {
    try {
      const response = await api.post<TokenPairResponse>('/auth/register', {
        email: payload.email,
        password: payload.password,
        role: 'buyer',
        nickname: payload.nickname,
        buyer_profile: payload.buyer_profile,
      });
      return response.data;
    } catch (error: any) {
      const apiError = buildApiError(error, 'Erro ao registrar comprador');
      if (error?.response?.status === 409) {
        throw new ApiError('Email já cadastrado', 409);
      }
      throw apiError;
    }
  },

  async registerSeller(payload: RegisterSellerRequest): Promise<TokenPairResponse> {
    try {
      const response = await api.post<TokenPairResponse>('/auth/register', {
        email: payload.email,
        password: payload.password,
        role: 'seller',
        company: payload.company,
      });
      return response.data;
    } catch (error: any) {
      const apiError = buildApiError(error, 'Erro ao registrar empresa');
      if (error?.response?.status === 409) {
        throw new ApiError('Email já cadastrado', 409);
      }
      throw apiError;
    }
  },

  async registerServiceProvider(
    payload: RegisterServiceProviderRequest
  ): Promise<TokenPairResponse> {
    try {
      const response = await api.post<TokenPairResponse>('/auth/register', {
        email: payload.email,
        password: payload.password,
        role: 'service_provider',
        service_provider: payload.service_provider,
      });
      return response.data;
    } catch (error: any) {
      const apiError = buildApiError(error, 'Erro ao registrar prestador');
      if (error?.response?.status === 409) {
        throw new ApiError('Email já cadastrado', 409);
      }
      throw apiError;
    }
  },

  async refresh(): Promise<TokenPairResponse | null> {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) {
      return null;
    }
    try {
      const response = await api.post<TokenPairResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });
      await setStoredTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      await clearStoredTokens();
      return null;
    }
  },

  async me() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await clearStoredTokens();
  },
};
