import api, { clearStoredTokens, getStoredRefreshToken, setStoredTokens } from '../config/api';
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

export interface RegisterResponse {
  message: string;
  email: string;
  email_verificado: boolean;
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

export interface CheckAvailabilityRequest {
  email?: string;
  cpf?: string;
  cnpj?: string;
}

export interface CheckAvailabilityResponse {
  email_available?: boolean;
  cpf_available?: boolean;
  cnpj_available?: boolean;
}

export interface RegisterSellerRequest {
  email: string;
  password: string;
  nickname?: string | null;
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
  nickname?: string | null;
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
  async checkAvailability(payload: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> {
    try {
      const response = await api.post<CheckAvailabilityResponse>(
        '/auth/check-availability',
        payload
      );
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao verificar disponibilidade');
    }
  },

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

  async registerBuyer(payload: RegisterBuyerRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
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

  async registerSeller(payload: RegisterSellerRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        email: payload.email,
        password: payload.password,
        role: 'seller',
        nickname: payload.nickname,
        company: payload.company,
      });
      return response.data;
    } catch (error: any) {
      // Log completo do erro ANTES de processar
      console.error('🔴 Erro no registerSeller - DADOS COMPLETOS:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        headers: error?.response?.headers,
        message: error?.message,
        error: error,
      });
      
      // Preserva response.data para uso posterior
      const responseData = error?.response?.data;
      
      // Extrai mensagem detalhada do backend
      let errorMessage = 'Erro ao registrar empresa';
      if (responseData?.detail) {
        if (Array.isArray(responseData.detail)) {
          const firstError = responseData.detail[0];
          if (firstError?.msg) {
            const field = firstError.loc?.slice(1).join('.') || 'campo';
            errorMessage = `${field}: ${firstError.msg}`;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else {
            errorMessage = JSON.stringify(firstError, null, 2);
          }
        } else if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else {
          errorMessage = JSON.stringify(responseData.detail, null, 2);
        }
      }
      
      const apiError = buildApiError(error, errorMessage);
      if (error?.response?.status === 409) {
        throw new ApiError('Email já cadastrado', 409, responseData);
      }
      throw apiError;
    }
  },

  async registerServiceProvider(
    payload: RegisterServiceProviderRequest
  ): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        email: payload.email,
        password: payload.password,
        role: 'service_provider',
        nickname: payload.nickname,
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

  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        `/auth/resend-verification?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao reenviar email de verificação');
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao solicitar recuperação de senha');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw buildApiError(error, 'Erro ao redefinir senha');
    }
  },
};
