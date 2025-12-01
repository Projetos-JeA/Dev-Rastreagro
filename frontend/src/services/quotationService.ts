import api from '../config/api';

export interface QuotationResponse {
  id: number;
  seller_id: number;
  seller_type: string;
  title: string;
  description?: string;
  category: 'agriculture' | 'livestock' | 'service' | 'both';
  product_type?: string;
  location_city?: string;
  location_state?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  expires_at?: string;
  image_url?: string;
  images?: string[];
  free_shipping: boolean;
  discount_percentage?: number;
  installments?: number;
  stock?: number;
  status: string;
  created_at: string;
  updated_at: string;
  seller_nickname?: string;
}

export interface QuotationCreateRequest {
  title: string;
  description?: string;
  category: 'agriculture' | 'livestock' | 'service' | 'both';
  product_type?: string;
  location_city?: string;
  location_state?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  expires_at?: string;
  image_url?: string;
  images?: string[];
  free_shipping?: boolean;
  discount_percentage?: number;
  installments?: number;
  stock?: number;
}

export const quotationService = {
  /**
   * Cria uma nova cotação
   */
  async createQuotation(data: QuotationCreateRequest): Promise<QuotationResponse> {
    try {
      const response = await api.post<QuotationResponse>('/quotations', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cotação:', error);
      throw error;
    }
  },

  /**
   * Busca cotações relevantes para o comprador logado
   * Filtra baseado nas atividades do produtor
   */
  async getRelevantQuotations(): Promise<QuotationResponse[]> {
    try {
      const response = await api.get<QuotationResponse[]>('/quotations/relevant');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cotações relevantes:', error);
      throw error;
    }
  },

  /**
   * Busca todas as cotações ativas (sem filtro)
   */
  async getAllQuotations(): Promise<QuotationResponse[]> {
    try {
      const response = await api.get<QuotationResponse[]>('/quotations');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar todas as cotações:', error);
      throw error;
    }
  },

  /**
   * Busca detalhes de uma cotação específica
   */
  async getQuotationById(quotationId: number): Promise<QuotationResponse> {
    try {
      const response = await api.get<QuotationResponse>(`/quotations/${quotationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar cotação:', error);
      throw error;
    }
  },

  /**
   * Busca minhas cotações (cotações criadas pelo usuário logado)
   */
  async getMyQuotations(): Promise<QuotationResponse[]> {
    try {
      const response = await api.get<QuotationResponse[]>('/quotations/my');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar minhas cotações:', error);
      throw error;
    }
  },

  /**
   * Deleta uma cotação
   */
  async deleteQuotation(quotationId: number): Promise<void> {
    try {
      await api.delete(`/quotations/${quotationId}`);
    } catch (error: any) {
      console.error('Erro ao deletar cotação:', error);
      throw error;
    }
  },
};

